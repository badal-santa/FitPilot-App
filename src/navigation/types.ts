import type { NavigatorScreenParams } from "@react-navigation/native";

import type { PlanExercise } from "@/lib/workout-api";

export type TabParamList = {
  Home: undefined;
  Workouts: undefined;
  Coach: undefined;
  Progress: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Welcome: undefined;
  Goal: undefined;
  ProfileSetup: undefined;
  Preferences: undefined;
  Main: NavigatorScreenParams<TabParamList>;
  EditProfile: undefined;
  ExerciseDetail: { exerciseId: string };
  Notifications: undefined;
  Auth: undefined;
  WorkoutSession: {
    workoutPlanDayId: string;
    workoutName: string;
    exercises: PlanExercise[];
  };
};

declare global {
  namespace ReactNavigation {
    // React Navigation's own typing pattern for augmenting its global RootParamList.
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface RootParamList extends RootStackParamList {}
  }
}
