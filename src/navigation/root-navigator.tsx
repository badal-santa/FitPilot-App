import { createNativeStackNavigator } from "@react-navigation/native-stack";

import AuthScreen from "@/screens/AuthScreen";
import EditProfileScreen from "@/screens/EditProfileScreen";
import ExerciseDetailScreen from "@/screens/ExerciseDetailScreen";
import GoalScreen from "@/screens/onboarding/GoalScreen";
import PreferencesScreen from "@/screens/onboarding/PreferencesScreen";
import ProfileScreen from "@/screens/onboarding/ProfileScreen";
import SplashScreen from "@/screens/onboarding/SplashScreen";

import { TabNavigator } from "./tab-navigator";
import type { RootStackParamList } from "./types";
import NotificationsScreen from "@/screens/NotificationsScreen";
import WorkoutSessionScreen from "@/screens/WorkoutSessionScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <Stack.Navigator
      // Welcome (onboarding/SplashScreen) checks the stored session, then
      // sends signed-in users on to Main / onboarding.
      initialRouteName="Welcome"
      screenOptions={{ headerShown: false, animation: "slide_from_right" }}
    >
      <Stack.Screen name="Welcome" component={SplashScreen} />
      <Stack.Screen name="Goal" component={GoalScreen} />
      <Stack.Screen name="ProfileSetup" component={ProfileScreen} />
      <Stack.Screen name="Preferences" component={PreferencesScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="ExerciseDetail" component={ExerciseDetailScreen} />
      <Stack.Screen name="Auth" component={AuthScreen} />
      <Stack.Screen name="WorkoutSession" component={WorkoutSessionScreen} />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          headerShown: false,
        }}
      />
    </Stack.Navigator>
  );
}
