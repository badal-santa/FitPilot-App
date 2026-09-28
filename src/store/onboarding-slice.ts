import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

import type { Profile } from "@/lib/profile-api";

export type Goal = "lose-weight" | "build-muscle" | "stay-fit";
export type Gender = "male" | "female";
export type ActivityLevel = "sedentary" | "light" | "moderate" | "active";
export type Units = "metric" | "imperial";

export type OnboardingState = {
  name: string;
  goal: Goal | null;
  gender: Gender;
  age: string;
  height: string;
  weight: string;
  activityLevel: ActivityLevel;
  workoutDays: number;
  remindersEnabled: boolean;
  units: Units;
};

const KNOWN_ACTIVITY_LEVELS: readonly ActivityLevel[] = ["sedentary", "light", "moderate", "active"];

// The backend stores activityLevel as a free-text string with no
// server-side enum validation, and some accounts carry values from an
// older/foreign 5-tier scale ("lightly-active", "moderately-active",
// "very-active", "extremely-active") instead of this app's 4-tier one.
// Map those to the closest match rather than letting an unrecognized
// value flow into ACTIVITY_LEVEL_LABEL lookups downstream and crash.
function normalizeActivityLevel(raw: string | null): ActivityLevel {
  if (raw && (KNOWN_ACTIVITY_LEVELS as string[]).includes(raw)) return raw as ActivityLevel;
  if (!raw) return "moderate";
  if (raw.startsWith("light")) return "light";
  if (raw.startsWith("moderate")) return "moderate";
  if (raw.startsWith("very") || raw.startsWith("extreme")) return "active";
  return "moderate";
}

const initialState: OnboardingState = {
  name: "",
  goal: null,
  gender: "male",
  age: "25",
  height: "180",
  weight: "78",
  activityLevel: "moderate",
  workoutDays: 3,
  remindersEnabled: true,
  units: "metric",
};

const onboardingSlice = createSlice({
  name: "onboarding",
  initialState,
  reducers: {
    setName: (state, action: PayloadAction<string>) => {
      state.name = action.payload;
    },
    setGoal: (state, action: PayloadAction<Goal>) => {
      state.goal = action.payload;
    },
    setGender: (state, action: PayloadAction<Gender>) => {
      state.gender = action.payload;
    },
    setAge: (state, action: PayloadAction<string>) => {
      state.age = action.payload;
    },
    setHeight: (state, action: PayloadAction<string>) => {
      state.height = action.payload;
    },
    setWeight: (state, action: PayloadAction<string>) => {
      state.weight = action.payload;
    },
    setActivityLevel: (state, action: PayloadAction<ActivityLevel>) => {
      state.activityLevel = action.payload;
    },
    setWorkoutDays: (state, action: PayloadAction<number>) => {
      state.workoutDays = action.payload;
    },
    setRemindersEnabled: (state, action: PayloadAction<boolean>) => {
      state.remindersEnabled = action.payload;
    },
    setUnits: (state, action: PayloadAction<Units>) => {
      state.units = action.payload;
    },
    /**
     * Dispatched after fetching the profile from the backend (sign in / sign
     * up / app-boot session restore) so the onboarding screens resume
     * showing whatever the user already saved, instead of blank defaults.
     */
    hydrateFromProfile: (state, action: PayloadAction<Profile>) => {
      const profile = action.payload;
      state.name = profile.name?.trim() || profile.email.split("@")[0];
      state.goal = profile.goal;
      state.gender = profile.gender ?? "male";
      state.age = profile.age != null ? String(profile.age) : "25";
      state.height = profile.heightCm != null ? String(profile.heightCm) : "180";
      state.weight = profile.weightKg != null ? String(profile.weightKg) : "78";
      state.activityLevel = normalizeActivityLevel(profile.activityLevel);
      state.workoutDays = profile.workoutDays ?? 3;
      state.remindersEnabled = profile.remindersEnabled;
    },
  },
});

export const onboardingActions = onboardingSlice.actions;
export default onboardingSlice.reducer;

export const UNITS_LABEL: Record<Units, string> = {
  metric: "Metric (kg, cm)",
  imperial: "Imperial (lb, ft)",
};

export const GOAL_LABEL: Record<Goal, string> = {
  "lose-weight": "Lose Weight",
  "build-muscle": "Build Muscle",
  "stay-fit": "Stay Fit",
};

export const ACTIVITY_LEVEL_LABEL: Record<ActivityLevel, string> = {
  sedentary: "Sedentary — little to no exercise",
  light: "Lightly active — 1-2 times per week",
  moderate: "Moderately active — 2-3 times per week",
  active: "Very active — 4+ times per week",
};
