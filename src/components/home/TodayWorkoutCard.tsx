import { LinearGradient } from "expo-linear-gradient";
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Dumbbell,
  Gauge,
  ListChecks,
  Moon,
  Play,
  RefreshCw,
  Sparkles,
  type LucideIcon,
} from "lucide-react-native";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";
import { useTodayWorkout } from "@/hooks/use-today-workout";
import { toTitleCase } from "@/lib/format";
import type { PlanExercise, TodayWorkout } from "@/lib/workout-api";

function estimateDurationMin(exercises: PlanExercise[]) {
  const totalSeconds = exercises.reduce((sum, ex) => {
    const sets = ex.sets ?? 3;
    const work = ex.durationSeconds ?? 40;
    const rest = ex.restSeconds ?? 60;
    return sum + sets * (work + rest);
  }, 0);
  return Math.max(10, Math.round(totalSeconds / 60 / 5) * 5);
}

function estimateDifficulty(exercises: PlanExercise[]) {
  const counts = new Map<string, number>();
  for (const ex of exercises) counts.set(ex.difficulty, (counts.get(ex.difficulty) ?? 0) + 1);

  let best = exercises[0]?.difficulty ?? "";
  let bestCount = 0;
  for (const [level, count] of counts) {
    if (count > bestCount) {
      best = level;
      bestCount = count;
    }
  }
  return toTitleCase(best);
}

export default function TodayWorkoutCard({
  onStart,
}: {
  onStart?: (workout: TodayWorkout) => void;
}) {
  const colors = useThemeColors();
  const { workout, status, retry } = useTodayWorkout();
  const canStart = Boolean(onStart) && Boolean(workout) && (workout?.exercises.length ?? 0) > 0;

  const isCompletedToday = workout?.workoutStatus === "completed";
  const isInProgress = workout?.workoutStatus === "started";

  return (
    <View
      className="mt-5 overflow-hidden rounded-[30px]"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Theme-aware gradient */}
      <LinearGradient
        colors={[colors.surfaceAlt, colors.surface, colors.surface]}
        locations={[0, 0.55, 1]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Emerald ambient glow */}
      <View
        pointerEvents="none"
        className="absolute -right-16 -top-16 h-44 w-44 rounded-full"
        style={{
          backgroundColor: `${colors.primary}0C`,
        }}
      />

      {status === "loading" ? (
        <View className="items-center justify-center p-8">
          <ActivityIndicator size="small" color={colors.primary} />
          <Text className="mt-3 text-[12px] font-medium" style={{ color: colors.textMuted }}>
            Loading today&apos;s workout...
          </Text>
        </View>
      ) : status === "error" ? (
        <View className="items-center justify-center p-8">
          <Text className="text-[13px] font-semibold text-text">
            Couldn&apos;t load your workout
          </Text>
          <Pressable
            onPress={retry}
            className="mt-4 flex-row items-center gap-1.5 rounded-full border border-border px-4 py-2 active:opacity-70"
          >
            <RefreshCw size={12} color={colors.textMuted} />
            <Text className="text-[11px] font-semibold" style={{ color: colors.textMuted }}>
              Try Again
            </Text>
          </Pressable>
        </View>
      ) : workout?.isRestDay ? (
        <View className="items-center justify-center p-8">
          <View
            className="h-12 w-12 items-center justify-center rounded-2xl"
            style={{ backgroundColor: `${colors.primary}18` }}
          >
            <Moon size={21} color={colors.primary} strokeWidth={2} />
          </View>
          <Text className="mt-3 text-[16px] font-extrabold text-text">Rest Day</Text>
          <Text className="mt-1 text-center text-[12px] text-text-muted">
            No workout scheduled today — recovery is part of the plan.
          </Text>
        </View>
      ) : (
        <View className="p-5">
          {/* Header */}
          <View className="flex-row items-start justify-between">
            <View className="min-w-0 flex-1 flex-row items-center">
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `${colors.primary}18`,
                }}
              >
                <Dumbbell size={21} color={colors.primary} strokeWidth={2} />
              </View>

              <View className="ml-3 min-w-0 flex-1">
                <Text
                  className="text-[10px] font-bold uppercase tracking-[1.4px]"
                  style={{ color: colors.textMuted }}
                >
                  Today&apos;s Workout
                </Text>

                <Text
                  className="mt-1 text-[19px] font-extrabold tracking-[-0.4px]"
                  style={{ color: colors.text }}
                  numberOfLines={2}
                >
                  {workout?.day?.title || workout?.plan.name}
                </Text>
              </View>
            </View>

            <View
              className="ml-2 flex-row items-center rounded-full px-2.5 py-1.5"
              style={{
                backgroundColor: `${colors.primary}15`,
                borderWidth: 1,
                borderColor: `${colors.primary}30`,
              }}
            >
              <Sparkles size={11} color={colors.primary} />

              <Text className="ml-1 text-[9px] font-bold" style={{ color: colors.primaryDark }}>
                FOR YOU
              </Text>
            </View>
          </View>

          {/* Workout metadata */}
          <View className="mt-5 flex-row flex-wrap gap-2">
            <MetaChip icon={ListChecks} label={`${workout?.exercises.length ?? 0} Exercises`} />

            <MetaChip
              icon={Clock}
              label={`${estimateDurationMin(workout?.exercises ?? [])} min`}
            />

            <MetaChip icon={Gauge} label={estimateDifficulty(workout?.exercises ?? [])} />
          </View>

          {isCompletedToday ? (
            <>
              {/* Completed state */}
              <View
                className="mt-5 flex-row items-center justify-between rounded-2xl px-3.5 py-3"
                style={{
                  backgroundColor: `${colors.primary}0C`,
                  borderWidth: 1,
                  borderColor: `${colors.primary}20`,
                }}
              >
                <View className="flex-row items-center">
                  <CheckCircle2 size={14} color={colors.primary} />

                  <Text className="ml-2 text-[12px] font-semibold" style={{ color: colors.text }}>
                    Workout Completed
                  </Text>
                </View>

                <Text className="text-[11px] font-medium" style={{ color: colors.textMuted }}>
                  Nice work today
                </Text>
              </View>

              <View
                className="mt-5 h-[56px] flex-row items-center justify-center rounded-[19px] px-4"
                style={{
                  backgroundColor: colors.surfaceAlt,
                  borderWidth: 1,
                  borderColor: colors.border,
                }}
              >
                <CheckCircle2 size={17} color={colors.primary} />

                <Text className="ml-2 text-[14px] font-extrabold" style={{ color: colors.text }}>
                  Today&apos;s Workout Completed
                </Text>
              </View>
            </>
          ) : (
            <>
              {/* Ready / in-progress state */}
              <View
                className="mt-5 flex-row items-center justify-between rounded-2xl px-3.5 py-3"
                style={{
                  backgroundColor: `${colors.primary}0C`,
                  borderWidth: 1,
                  borderColor: `${colors.primary}20`,
                }}
              >
                <View className="flex-row items-center">
                  <View className="h-2 w-2 rounded-full" style={{ backgroundColor: colors.primary }} />

                  <Text className="ml-2 text-[12px] font-semibold" style={{ color: colors.text }}>
                    {isInProgress ? "In progress" : "Ready when you are"}
                  </Text>
                </View>

                <Text className="text-[11px] font-medium" style={{ color: colors.textMuted }}>
                  {isInProgress ? "Pick up where you left off" : "Let's get moving"}
                </Text>
              </View>

              {/* Primary CTA */}
              <Pressable
                onPress={() => workout && onStart?.(workout)}
                disabled={!canStart}
                accessibilityRole="button"
                accessibilityLabel={isInProgress ? "Resume today's workout" : "Start today's workout"}
                className="mt-5 h-[56px] flex-row items-center justify-between rounded-[19px] px-4"
                style={{
                  backgroundColor: colors.primary,
                }}
              >
                <View className="flex-row items-center">
                  <View
                    className="h-8 w-8 items-center justify-center rounded-full"
                    style={{
                      backgroundColor: `${colors.bg}15`,
                    }}
                  >
                    <Play size={14} color={colors.bg} fill={colors.bg} />
                  </View>

                  <Text className="ml-3 text-[14px] font-extrabold" style={{ color: colors.bg }}>
                    {isInProgress ? "Resume Workout" : "Start Workout"}
                  </Text>
                </View>

                <ArrowRight size={19} color={colors.bg} strokeWidth={2.5} />
              </Pressable>
            </>
          )}
        </View>
      )}
    </View>
  );
}

function MetaChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  const colors = useThemeColors();

  return (
    <View
      className="flex-row items-center rounded-full px-3 py-2"
      style={{
        backgroundColor: colors.surfaceAlt,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      <Icon size={12} color={colors.primary} strokeWidth={2} />

      <Text className="ml-1.5 text-[10px] font-semibold" style={{ color: colors.textMuted }}>
        {label}
      </Text>
    </View>
  );
}
