import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { Sparkles } from "lucide-react-native";
import { useCallback, useRef } from "react";
import { RefreshControl, Text, View } from "react-native";

import AdBanner from "@/components/common/AdBanner";
import Screen from "@/components/common/Screen";
import DailyQuoteCard from "@/components/home/DailyQuoteCard";
import HomeHeader from "@/components/home/HomeHeader";
import StatsRow from "@/components/home/StatsRow";
import TodayWorkoutCard from "@/components/home/TodayWorkoutCard";
import WeeklyProgressCard from "@/components/home/WeeklyProgressCard";
import { useThemeColors } from "@/constants/colors";
import { useRefreshRegistry } from "@/hooks/use-refresh-registry";
import { showInterstitialThen } from "@/lib/interstitial";

export function HomeScreen() {
  const colors = useThemeColors();
  const navigation = useNavigation();
  // Each section loads its own data and registers its refresh; pulling down
  // refreshes them all and the spinner stops when the last one finishes.
  const { refreshing, refreshAll, RefreshRegistryProvider } = useRefreshRegistry();

  // Home stays mounted under the workout session, so coming back after
  // finishing a workout wouldn't otherwise update "Start Workout" → done,
  // or the stats. Refresh quietly (no spinner) on every return; skip the
  // first focus since each section already loads on mount.
  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        return;
      }
      refreshAll({ silent: true });
    }, [refreshAll]),
  );

  return (
    <Screen
      scroll
      className="px-4"
      contentContainerStyle={{
        paddingBottom: 150,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={() => refreshAll()}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.surface}
        />
      }
    >
      <RefreshRegistryProvider>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <HomeHeader />

      {/* =====================================================
          SECTION INTRO
      ===================================================== */}

      <View className="mt-6 flex-row items-center">
        <View
          className="mr-2 h-1.5 w-1.5 rounded-full"
          style={{
            backgroundColor: colors.primary,
          }}
        />

        <Text
          className="text-[10px] font-bold uppercase tracking-[2px]"
          style={{
            color: colors.primary,
          }}
        >
          Your training
        </Text>
      </View>

      {/* =====================================================
          TODAY'S WORKOUT
      ===================================================== */}

      <TodayWorkoutCard
        onStart={(workout) => {
          const day = workout.day;
          if (!day) return;
          showInterstitialThen(() =>
            navigation.navigate("WorkoutSession", {
              workoutPlanDayId: day.id,
              workoutName: day.title || workout.plan.name,
              exercises: workout.exercises,
            }),
          );
        }}
      />

      {/* =====================================================
          ACTIVITY
      ===================================================== */}

      <View className="mt-7 flex-row items-center justify-between">
        <View>
          <Text className="text-[17px] font-extrabold text-text">
            Your Activity
          </Text>

          <Text className="mt-1 text-[11px] text-text-muted">
            A quick look at your progress
          </Text>
        </View>

        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${colors.primary}10`,
          }}
        >
          <Sparkles
            size={15}
            color={colors.primary}
          />
        </View>
      </View>

      <StatsRow />

      {/* =====================================================
          WEEKLY PROGRESS
      ===================================================== */}

      <WeeklyProgressCard />

      {/* =====================================================
          DAILY MINDSET
      ===================================================== */}

      <DailyQuoteCard />

      {/* =====================================================
          AD
      ===================================================== */}

      <AdBanner />
      </RefreshRegistryProvider>
    </Screen>
  );
}