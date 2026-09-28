import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";

import { CoachScreen } from "@/screens/tabs/coach-screen";
import { HomeScreen } from "@/screens/tabs/home-screen";
import { ProfileScreen } from "@/screens/tabs/profile-screen";
import { ProgressScreen } from "@/screens/tabs/progress-screen";
import { WorkoutsScreen } from "@/screens/tabs/workouts-screen";

import { BottomTabBar } from "./bottom-tab-bar";
import type { TabParamList } from "./types";

const Tab = createBottomTabNavigator<TabParamList>();

export function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={{ headerShown: false, animation: "shift" }}
      tabBar={(props) => <BottomTabBar {...props} />}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Workouts" component={WorkoutsScreen} />
      <Tab.Screen name="Coach" component={CoachScreen} />
      <Tab.Screen name="Progress" component={ProgressScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
