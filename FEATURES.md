# FitPilot — Features & Functionality

FitPilot is an AI-assisted fitness app built with **Expo SDK 57 / React Native
0.86**, **React Navigation** (native stack + bottom tabs), **NativeWind** and
**Redux Toolkit**. It talks to a **Cloudflare Workers + D1** backend
(`../fitpilot-backend`) and is managed from a **Next.js admin panel**
(`../fitpilot-admin`).

This document describes what the app does, how each feature works, and where
the code lives.

- [Running locally](#running-locally)
- [App flow](#app-flow)
- [Features](#features)
- [Admin panel](#admin-panel)
- [Architecture](#architecture)
- [Backend API used by the app](#backend-api-used-by-the-app)
- [Configuration](#configuration)
- [Building an APK](#building-an-apk)
- [Known limitations](#known-limitations)
- [Before releasing](#before-releasing)

---

## Running locally

```bash
# 1. Backend (from ../fitpilot-backend) — listens on 0.0.0.0:8787
npm run dev

# 2. App (from this folder)
npx expo start -c       # Metro dev server
npm run android         # first time / after adding native modules: dev build
```

- **No `adb reverse` needed.** In development the app sends API calls through
  Metro (`http://<metro-host>/__api/*`), and `metro.config.js` proxies them to
  the backend on `localhost:8787`. This works over USB, Wi-Fi and the emulator
  alike. See [API client](#api-client-srclibapi-clientts).
- Native modules (Google Sign-In, AdMob, OneSignal, SecureStore, System UI,
  Application) need a **development build** — Expo Go won't work.
- `android/` and `ios/` are generated (CNG) and git-ignored. After changing
  `app.json` plugins run `npx expo prebuild --platform android`, then rebuild.

---

## App flow

```
Launch
  └─ Native splash (fonts loading)
      └─ Welcome / Splash screen  ── checks stored session ──┐
            │ not signed in                                   │ signed in
            ▼                                                 ▼
      Get Started / Sign In ──► Auth screen ──► Onboarding ──► Main tabs
                                 (email or Google)   (only missing steps)
                                                              │
               Home · Workouts · Coach · Progress · Profile ◄─┘
```

Routes are declared in `src/navigation/root-navigator.tsx` (stack) and
`src/navigation/tab-navigator.tsx` (tabs); param types live in
`src/navigation/types.ts`.

---

## Features

### 1. Launch & session restore
**Files:** `App.tsx`, `src/screens/onboarding/SplashScreen.tsx`,
`src/store/auth-slice.ts` (`initializeAuth`)

- The native splash only covers font loading. The app then shows the
  **Welcome screen** (hero image, "Stronger Healthier Happier You").
- While the saved session is checked, a spinner sits where the buttons go:
  - **Signed in** → after a minimum of 1.2 s, goes straight to **Home**, or to
    the first onboarding step that's still missing data.
  - **Not signed in** → **Get Started** / **Sign In** fade in.
- Expired access tokens are refreshed automatically during the check.
- Sign-out and session expiry both return to this screen.

### 2. Authentication
**Files:** `src/screens/AuthScreen.tsx`, `src/components/auth/*`,
`src/lib/auth-api.ts`, `src/lib/google-auth.ts`

- **Email & password** sign in / sign up on one screen with a mode toggle.
  Validation with `react-hook-form`: name required for sign up, valid email,
  password ≥ 6 characters.
- **Google Sign-In** (`@react-native-google-signin/google-signin`):
  - The native account picker returns an ID token, which is sent to
    `POST /auth/google`.
  - The backend verifies the token's signature and audience, then signs the
    user in, creates the account, or links Google to an existing account
    with the same verified email.
  - Closing the picker shows no error.
- **Loading overlay** while signing in: "Signing you in…", "Creating your
  account…" or "Signing in with Google…". It blocks double taps.
- After sign-in → onboarding (only the missing steps) or Home.
- Tokens are stored in **SecureStore**. Sign-out revokes the session on the
  server, clears tokens, and signs out of Google and OneSignal.

### 3. Onboarding
**Files:** `src/screens/onboarding/{Goal,Profile,Preferences}Screen.tsx`,
`src/store/onboarding-slice.ts`, `src/lib/profile-api.ts`

Three steps:
1. **Goal:** lose weight / build muscle / stay fit.
2. **Profile:** gender, age, height, weight, activity level.
3. **Preferences:** workout days per week, reminders.

- Each step saves to `PUT /profile` before moving on, so leaving mid-flow
  loses nothing.
- `getOnboardingRoute(profile)` decides which step to resume at on every
  login or launch.

### 4. Home
**Files:** `src/screens/tabs/home-screen.tsx`, `src/components/home/*`

- **Header:**
  - greeting and name
  - **streak** 🔥: consecutive days with a completed workout
  - **notification bell**, with a dot only when something is unread
- **Today's Workout:** today's day from the active plan
  (`GET /workouts/today`), with three states: **Start**, **Resume** (in
  progress) and **Completed**, plus **Rest day**. If the user has no plan yet,
  one is generated automatically.
- **Your Activity:** total workouts, calories today, current weight. Shows
  "—" while loading, never placeholder numbers.
- **Weekly Progress:** days trained this week (Mon–Sun bars).
- **Daily Mindset:** motivational quote, rotating daily
  (`src/constants/quotes.ts`).
- **Banner ad** at the bottom.
- **Pull to refresh** refreshes every section. Home also refreshes quietly
  whenever you return to it, e.g. after finishing a workout.

### 5. Workouts tab
**Files:** `src/screens/tabs/workouts-screen.tsx`, `src/components/workouts/*`

- **My Plan:**
  - Every day of the active plan, with exercise count, rest days, and a
    **Start** button on each day.
  - **Regenerate** retires the current plan (it's marked completed and
    history is kept) and builds a new one from the profile.
- **Exercise library:**
  - search, muscle-group chips, and an **A–Z / Z–A** sort (case-insensitive)
  - a **NEW** ribbon on exercises an admin added in the last 7 days
  - tapping a card opens **Exercise detail**
- The list reloads whenever the tab is opened, and **pull to refresh**
  refreshes the plan and the list.
- A banner ad after the list.

### 6. Exercise detail
**Files:** `src/screens/ExerciseDetailScreen.tsx`,
`src/components/workouts/AddToWorkoutSheet.tsx`

- Description, muscle group, equipment, difficulty, and step-by-step
  instructions.
- **Add to workout:** pick a day of your plan to add the exercise to. It
  defaults to 3 × 10 with 45 s rest.
- A banner ad below the content.

### 7. Workout session
**Files:** `src/screens/WorkoutSessionScreen.tsx`, `src/lib/workout-api.ts`

- Starting a workout shows an **interstitial ad** first when one is ready, at
  most once every 3 minutes (see [Ads](#10-ads)). The workout opens when the
  ad closes, or immediately if no ad is ready.
- Starts a session on the backend, or **resumes** an unfinished session for
  that same day, restoring exactly which sets were already done.
- Steps through each set with a **rest timer**: 45 s by default, or the
  exercise's own rest time.
- Finishing the last set completes the session and shows a summary,
  including **XP earned** and any **streak milestone** reached (see
  [XP & rewards](#8-progress)).
- Today's card on Home counts a workout started today on today's plan day,
  including one started just before a plan regeneration.

### 8. Progress
**Files:** `src/screens/tabs/progress-screen.tsx` (layout only),
`src/components/progress/*`, `src/hooks/useProgress.ts`, `src/lib/xp.ts`

Sections, top to bottom:

| Component | Shows |
|---|---|
| `ProgressHeader` | Title and subtitle |
| `PeriodSelector` | **Weekly / Monthly / Yearly**, backed by `GET /progress?period=` |
| `ProgressStatsRow` | Current streak, total workouts, average calories per day |
| `RewardsCard` | Total XP, day streak, progress to the next streak milestone, last 5 rewards |
| `LevelProgressCard` | Fitness level (1 Beginner → 8 Legend) and XP to the next level |
| `WeeklyActivityCard` | Days / weeks / months active |
| `CaloriesTrendCard` | Calories trend |
| `MotivationCard` | "Keep going" card |
| `AdBanner` | Banner ad |

`WeightTrendCard` is built but not shown.

**XP & rewards** (backend `services/rewards.ts`, table `reward_events`,
migration 0019):
- **+20 XP** for each completed workout.
- **Streak milestone bonus** the day the streak reaches it: 3 days → +50,
  7 → +150, 30 → +500, 100 → +2000.
- Each reward is recorded once, keyed by `workout:<sessionId>` or
  `streak:<days>`, so repeating a request can't award it twice.
- `POST …/complete` returns the rewards earned; `GET /progress` returns
  `rewards.totalXp` and `rewards.history`.
- Levels and milestone progress are calculated in the app by `src/lib/xp.ts`:
  - `getXpLevel` returns the level for a total XP.
  - `getStreakMilestone` returns the next milestone and progress toward it.
  - Its milestone table must match the backend's `STREAK_REWARDS`.

### 9. Notifications
**Files:** `src/screens/NotificationsScreen.tsx`,
`src/hooks/use-notifications.ts`, `src/lib/notifications-api.ts`,
`src/lib/onesignal.ts`

- **Push notifications** via **OneSignal**. The device is linked to the user
  (`OneSignal.login(userId)`) after sign-in. The permission prompt appears
  after the first login.
- **Inbox:** broadcasts sent from the admin panel (`GET /notifications`):
  - 20 per page, loading more as you scroll
  - pull to refresh
  - relative times ("5 min ago", "Yesterday")
  - loading, empty and error states
- **Unread state:** tap a card to mark it read, or use **Read all**. Read IDs
  are stored per device, so the same account on another phone starts with
  everything unread.

### 10. Ads
**Files:** `src/lib/ads.ts`, `src/components/common/AdBanner.tsx`,
`src/lib/interstitial.ts`

- **Banner ads** (inline adaptive, resizing to the ad served) on Home,
  Progress, Workouts and Exercise detail. A banner that fails to load removes
  itself.
- **Interstitial** before starting a workout:
  - preloaded at launch and reloaded after each show
  - frequency-capped to once every 3 minutes
  - skipped if not ready
  - an 8 s safety timeout so it can never block the workout
- No ads on auth, onboarding, the workout session or notifications.
- Ad unit IDs are Google **test IDs** until replaced in `src/lib/ads.ts`.

### 11. Profile
**Files:** `src/screens/tabs/profile-screen.tsx`, `src/screens/EditProfileScreen.tsx`,
`src/components/profile/*`

- **Header** with name, initials avatar and goal.
- **My Details:** age, height, weight, activity level.
- **Edit Profile:** goal, gender, age, height, weight and activity level, all
  saved to `PUT /profile`.
- **Appearance:** System / Light / Dark.
- **Preferences:** workout reminders, units.
- **Support:** Help & Support, Privacy Policy, Rate the App.
- **Sign Out.**

### 12. Theming (light / dark)
**Files:** `src/theme/*`, `src/constants/colors.ts`, `src/global.css`

- **System / Light / Dark**, applied app-wide through NativeWind CSS variables
  (`bg-bg`, `text-text`, …) and `useThemeColors()` for JS colors.
- The preference is saved in AsyncStorage.
- **System** follows the phone's setting live. On Android this requires the
  `expo-system-ui` package, which is installed.

### 13. App update sheet *(built, currently disabled)*
**Files:** `src/components/common/AppUpdateSheet.tsx`, `src/lib/app-version-api.ts`

- Compares the installed version with the latest and minimum versions set in
  the admin panel (`GET /app/version`):
  - **Optional update:** "Update Now" / "Maybe Later". Later hides it for 24 h
    per version.
  - **Forced update:** can't be dismissed.
  - **Update Now** opens the Play Store / App Store.
- Checks at launch and whenever the app returns to the foreground.
- **Disabled for now.** To enable it, uncomment the import and
  `<AppUpdateSheet />` in `App.tsx`.

### 14. Coach *(coming soon)*
`src/screens/tabs/coach-screen.tsx` shows a "Coming Soon" placeholder. The
chat UI components exist (`src/components/coach/ChatBubble.tsx`) but aren't
connected to an AI backend yet.

---

## Admin panel
`../fitpilot-admin` (Next.js). The pages that affect the app:

| Page | What it controls in the app |
|---|---|
| **Exercises** | The exercise library. Muscle group is a fixed dropdown matching the app's filter chips. New exercises show a NEW ribbon for 7 days. |
| **Notifications** | Push broadcasts via OneSignal, which also appear in the app's inbox. |
| **App Updates** | Latest / minimum version, store URL and release notes per platform, for the update sheet. |
| Dashboard, Users, Workouts, Analytics | Read-only reporting. |

---

## Architecture

```
src/
  navigation/   stack + tab navigators, custom bottom tab bar, route types
  screens/      one file per screen (tabs/, onboarding/)
  components/   UI grouped by feature (home/, workouts/, auth/, common/…)
  hooks/        data hooks — one per feature, own loading/error/refresh
  lib/          API client + one *-api.ts per backend area, ads, OneSignal
  store/        Redux Toolkit slices (auth, onboarding) + typed hooks
  theme/        theme provider, tokens, theme slice
  constants/    colors, quotes
```

### API client (`src/lib/api-client.ts`)
The single place for the API URL, tokens and requests. Every `*-api.ts`
module calls `apiRequest()`, and none of them handle tokens themselves.

- **Base URL:** `EXPO_PUBLIC_API_URL`.
  - In development, a localhost URL is routed through Metro's `/__api` proxy.
  - Release builds use the URL as-is.
- **Tokens:** kept in SecureStore with an in-memory cache. The `Bearer`
  header is attached automatically.
- **401 handling:** one shared refresh (`/auth/refresh`), then the request is
  retried. If the refresh fails, tokens are cleared and a `sessionExpired`
  action returns the user to the Welcome screen.
- **Errors:** `ApiError` carries `status` and `body`. A network failure gives
  "Can't reach the server at …".
- Each `*-api.ts` converts the backend's snake_case JSON into camelCase types.

### State (Redux Toolkit)
- **`auth-slice`:** `user`, `profile`, `status`, `error`, `initialized`, with
  thunks `signIn`, `signUp`, `signInWithGoogle`, `initializeAuth` and
  `signOut`.
  - Tokens are **not** in Redux; the API client owns them.
  - `initialized` gates the first render only. Sign-in itself never unmounts
    the navigator.
- **`onboarding-slice`:** onboarding and profile form fields, filled from the
  fetched profile by `hydrateFromProfile`.
- **`theme-slice`:** System / Light / Dark preference, saved to AsyncStorage.
- Components use only `useAppSelector` / `useAppDispatch`
  (`src/store/hooks.ts`).

### Data hooks & refresh
- Each feature has a hook, such as `useTodayWorkout`, `useWorkoutStats`,
  `useWeeklyProgress`, `useWorkoutPlan`, `useExercises`, `useNotifications`
  and `useProgress`. Each one owns its loading, error and refresh.
- **Pull-to-refresh registry** (`src/hooks/use-refresh-registry.tsx`):
  - Hooks call `useRegisterRefresh(refresh)`.
  - A screen wraps its sections in `RefreshRegistryProvider` and passes
    `refreshAll` to its `RefreshControl`. The spinner stops when every
    section has finished.
  - `refreshAll({ silent: true })` refreshes without the spinner, for example
    when a screen regains focus.
- Refreshes are **quiet**: the current data stays on screen until the new data
  arrives, with no flash back to skeletons.

---

## Backend API used by the app

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `/auth/login`, `/auth/google`, `/auth/refresh`, `/auth/logout`, `GET /auth/me` |
| Profile | `GET /profile`, `PUT /profile` |
| Exercises | `GET /exercises` (filters, returns `is_new`), `GET /exercises/:id` |
| Plans | `GET /workouts`, `GET /workouts/:id`, `GET /workouts/today`, `POST /workouts/generate`, `POST /workouts/regenerate`, `POST /workouts/:planId/days/:dayId/exercises` |
| Sessions | `POST /workouts/sessions`, `GET /workouts/sessions/:id`, `POST …/exercises`, `POST …/sets`, `POST …/complete` (returns XP rewards) |
| Stats | `GET /workouts/stats` (includes `currentStreak`), `GET /workouts/weekly-progress`, `GET /progress?period=` (includes rewards) |
| Notifications | `GET /notifications?page=&limit=` |
| App version | `GET /app/version?platform=` |

Full reference: `http://localhost:8787/docs` (Swagger) when the backend is
running.

**Backend layout** (`../fitpilot-backend/src`):
- `index.ts`: entry point.
- `routers/`: routing by area (`auth`, `workouts`, `exercises`, `progress`,
  `notifications`, `app-version`, and `admin/*`).
- `handlers/`: the endpoint logic.
- `services/`: auth, Google token checks, password hashing, OneSignal and
  rewards.
- `http.ts`: shared response helpers.

**How the numbers are calculated:**
- **Streak:** consecutive UTC days with ≥ 1 completed workout, counting from
  today, or from yesterday if the user hasn't trained yet today.
- **Today's day:** plan day = weekday (Mon = Day 1) when it's within the plan's
  days per week. Otherwise it's a rest day.
- **Rest times:** Build Muscle 45 s, core 45 s, cardio / Lose Weight /
  Stay Fit 60 s.
- **XP:** +20 per completed workout, plus streak bonuses (see §8).

---

## Configuration

**`.env` (app):**

| Variable | Purpose |
|---|---|
| `EXPO_PUBLIC_API_URL` | Backend URL. Leave as `http://localhost:8787` for development. |
| `EXPO_PUBLIC_ONESIGNAL_APP_ID` | OneSignal app ID (push notifications). |
| `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID` | Google Cloud **Web** OAuth client ID (Google Sign-In). |
| `EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID` | Google Cloud **iOS** OAuth client ID (iOS only). |

`EXPO_PUBLIC_*` values are baked in at bundle time, so restart with
`npx expo start -c` after changing them.

**`fitpilot-backend/.dev.vars`:** `ONESIGNAL_REST_API_KEY`, and
`GOOGLE_CLIENT_IDS` (same Web client ID; comma-separate multiple IDs).

**Google Sign-In also needs** an **Android** OAuth client in the same Google
Cloud project, with package `com.anonymous.aihealthfitness` and the signing
key's SHA-1. Without it you get `DEVELOPER_ERROR`.

**`app.json` plugins:**
- `onesignal-expo-plugin`
- `expo-splash-screen`
- `expo-secure-store`
- `react-native-google-mobile-ads` (AdMob app IDs)
- `@react-native-google-signin/google-signin` (`iosUrlScheme`)
- `expo-build-properties`, currently with `android.usesCleartextTraffic:
  true` so a test APK can call the backend over plain `http://` on the LAN.
  Remove it for a production build that uses `https://`.

---

## Building an APK

**Test APK** (standalone, backend on your Mac, same Wi-Fi):

```bash
# 1. Mac's current Wi-Fi IP — it can change between networks
ipconfig getifaddr en0

# 2. Backend running (fitpilot-backend): npm run dev   → listens on 0.0.0.0:8787

# 3. Build with that IP baked in (.env stays untouched for development)
cd android
EXPO_PUBLIC_API_URL=http://<mac-ip>:8787 ./gradlew assembleRelease

# Output: android/app/build/outputs/apk/release/app-release.apk
adb install -r app/build/outputs/apk/release/app-release.apk
```

- It's signed with the **debug key**. That's fine for installing and sharing,
  and Google Sign-In works because the debug SHA-1 is registered, but the
  Play Store won't accept it.
- If the Mac's IP changes, the APK can't reach the backend. Rebuild with the
  new IP, or use a deployed backend.
- After changing `app.json` plugins, run
  `npx expo prebuild --platform android` before building.

**Production build:**
1. Deploy the backend.
2. Set `EXPO_PUBLIC_API_URL` to its `https://` URL.
3. Remove `usesCleartextTraffic`.
4. Build with EAS, which handles release signing, and upload the `.aab`:
   `npx eas-cli@latest build -p android --profile production`

---

## Known limitations

- **Coach** is a placeholder with no AI chat yet.
- **Notification read state** is stored per device, not per account.
- **Profile → Support** rows (Help, Privacy Policy, Rate the App) have no
  action yet.
- **Days use UTC.** Streaks and "today" are based on UTC, so in India the day
  rolls over at 5:30 AM, not midnight.
- **Weight trend chart** (`WeightTrendCard`) exists but isn't shown on the
  Progress screen.
- **App update sheet** is built but disabled (see §13).

---

## Before releasing

1. **Database:** apply migrations to production:
   `npx wrangler d1 migrations apply fitpilot-db --remote`. This covers
   0015 app versions, 0016 Google auth, 0017 muscle groups, 0018 rest
   times and 0019 rewards.
2. **Backend secrets:** set `GOOGLE_CLIENT_IDS` and `ONESIGNAL_REST_API_KEY`
   on the deployed Worker.
3. **Release API URL:** set `EXPO_PUBLIC_API_URL` to the deployed Worker's
   `https://` URL.
4. **AdMob:** replace the test IDs:
   - ad unit IDs in `src/lib/ads.ts` (keep test IDs for `__DEV__`)
   - AdMob app IDs in `app.json`
5. **Google Sign-In:** add the **release** signing key's SHA-1 (from EAS / Play
   App Signing) to the Android OAuth client, and publish the consent screen.
6. **App identity:** change the package / bundle ID from
   `com.anonymous.aihealthfitness` if needed. This also affects Google
   Sign-In, AdMob and the store URL.
7. **Version:** bump `version` in `app.json` for each store release.
8. **Cleartext:** remove `usesCleartextTraffic` from the
   `expo-build-properties` plugin in `app.json`.
