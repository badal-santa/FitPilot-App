import { apiRequest } from "@/lib/api-client";

export type Goal = "lose-weight" | "build-muscle" | "stay-fit";
export type Gender = "male" | "female";
export type OnboardingRoute = "Goal" | "ProfileSetup" | "Preferences";

export type Profile = {
  id: string;
  email: string;
  name: string | null;
  goal: Goal | null;
  gender: Gender | null;
  age: number | null;
  heightCm: number | null;
  weightKg: number | null;
  activityLevel: string | null;
  workoutDays: number | null;
  remindersEnabled: boolean;
  onboardingCompleted: boolean;
};

export type ProfileUpdate = Partial<{
  goal: Goal;
  gender: Gender;
  age: number;
  heightCm: number;
  weightKg: number;
  activityLevel: string;
  workoutDays: number;
  remindersEnabled: boolean;
  onboardingCompleted: boolean;
}>;

// Raw shape returned by the API (snake_case, see ProfileUser in /openapi.json).
type RawProfile = {
  id: string;
  email: string;
  name: string | null;
  gender: Gender | null;
  age: number | null;
  height_cm: number | null;
  weight_kg: number | null;
  goal: Goal | null;
  activity_level: string | null;
  workout_days: number | null;
  reminders_enabled: boolean;
  onboarding_completed: boolean;
};

function normalizeProfile(raw: RawProfile): Profile {
  return {
    id: raw.id,
    email: raw.email,
    name: raw.name,
    goal: raw.goal,
    gender: raw.gender,
    age: raw.age,
    heightCm: raw.height_cm,
    weightKg: raw.weight_kg,
    activityLevel: raw.activity_level,
    workoutDays: raw.workout_days,
    remindersEnabled: Boolean(raw.reminders_enabled),
    onboardingCompleted: Boolean(raw.onboarding_completed),
  };
}

/**
 * Get the signed-in user's profile / onboarding data.
 */
export async function getProfile(): Promise<Profile> {
  const json = await apiRequest<{ success: true; user: RawProfile }>("/profile");
  return normalizeProfile(json.user);
}

/**
 * Save onboarding fields as the user completes each step. Send only the
 * fields collected on that step — the API merges them into the existing row.
 */
export async function updateProfile(update: ProfileUpdate): Promise<Profile> {
  const json = await apiRequest<{ success: true; user: RawProfile }>("/profile", {
    method: "PUT",
    body: update,
  });
  return normalizeProfile(json.user);
}

/**
 * Which onboarding screen (if any) still has missing data. Returns null once
 * the profile is fully onboarded, meaning the caller should go to "Main".
 */
export function getOnboardingRoute(profile: Profile | null): OnboardingRoute | null {
  if (!profile || profile.onboardingCompleted) return null;
  if (!profile.goal) return "Goal";
  if (
    !profile.gender ||
    profile.age == null ||
    profile.heightCm == null ||
    profile.weightKg == null ||
    !profile.activityLevel
  ) {
    return "ProfileSetup";
  }
  return "Preferences";
}
