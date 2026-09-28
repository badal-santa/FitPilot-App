import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertCircle,
  Check,
  Clock,
  Dumbbell,
  ListChecks,
  SkipForward,
  Trophy,
  X,
  type LucideIcon,
} from "lucide-react-native";
import { useEffect, useMemo, useRef, useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useInterstitialAd } from "react-native-google-mobile-ads";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useToast } from "@/components/common/Toast";
import { useThemeColors } from "@/constants/colors";
import { INTERSTITIAL_AD_UNIT_ID } from "@/lib/ads";
import type { RootStackParamList } from "@/navigation/types";
import { useAppSelector } from "@/store/hooks";
import {
  addSessionExercise,
  completeWorkoutSession,
  getWorkoutSessionDetail,
  recordSet,
  startWorkoutSession,
  type WorkoutCompletionResult,
} from "@/lib/workout-api";

type Phase = "active" | "resting" | "complete";
type Advance = "set" | "exercise" | null;

type Props = NativeStackScreenProps<RootStackParamList, "WorkoutSession">;

const DEFAULT_SETS = 3;
const DEFAULT_REPS = 10;
const DEFAULT_REST_SEC = 45;

export default function WorkoutSessionScreen({ navigation, route }: Props) {
  const { workoutPlanDayId, workoutName, exercises: rawExercises } = route.params;
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const toast = useToast();
  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");

  const exercises = useMemo(
    () =>
      rawExercises.map((ex) => ({
        ...ex,
        sets: ex.sets ?? DEFAULT_SETS,
        reps: ex.reps ?? DEFAULT_REPS,
        restSec: ex.restSeconds ?? DEFAULT_REST_SEC,
      })),
    [rawExercises],
  );

  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionExerciseIds, setSessionExerciseIds] = useState<string[]>([]);
  const [initializing, setInitializing] = useState(true);
  const [initError, setInitError] = useState<string | null>(null);

  const [exerciseIndex, setExerciseIndex] = useState(0);
  const [setNumber, setSetNumber] = useState(1);
  const [phase, setPhase] = useState<Phase>("active");
  const [restRemaining, setRestRemaining] = useState(0);
  const [advanceKind, setAdvanceKind] = useState<Advance>(null);
  const [elapsedMin, setElapsedMin] = useState(1);
  const [savingSet, setSavingSet] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [completionResult, setCompletionResult] =
    useState<WorkoutCompletionResult | null>(null);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number | null>(null);

  // Shown once, at the natural break point of leaving the completed-session
  // summary. Waiting for its own "closed" status (rather than navigating
  // right after calling show()) avoids unmounting this screen — and its
  // hook-owned ad instance — while the ad is still on screen.
  const { status: interstitialStatus, show: showInterstitial } = useInterstitialAd({
    adUnitId: INTERSTITIAL_AD_UNIT_ID,
  });
  const exitingAfterAdRef = useRef(false);

  useEffect(() => {
    if (interstitialStatus === "closed" && exitingAfterAdRef.current) {
      navigation.goBack();
    }
  }, [interstitialStatus, navigation]);

  const handleDone = () => {
    if (interstitialStatus === "loaded") {
      exitingAfterAdRef.current = true;
      showInterstitial();
      return;
    }
    navigation.goBack();
  };

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    startWorkoutSession(workoutPlanDayId)
      .then(async (session) => {
        const ids: string[] = [];
        for (let i = 0; i < exercises.length; i++) {
          const id = await addSessionExercise(session.id, exercises[i].exerciseId, i + 1);
          ids.push(id);
        }

        let resumeExerciseIndex = 0;
        let resumeSetNumber = 1;

        if (session.resumed) {
          const detail = await getWorkoutSessionDetail(session.id);
          const completedCounts = new Map<string, number>();
          for (const sessionExercise of detail.exercises) {
            completedCounts.set(
              sessionExercise.exerciseId,
              sessionExercise.sets.filter((set) => set.completed).length,
            );
          }

          for (let i = 0; i < exercises.length; i++) {
            const done = completedCounts.get(exercises[i].exerciseId) ?? 0;
            if (done < exercises[i].sets) {
              resumeExerciseIndex = i;
              resumeSetNumber = done + 1;
              break;
            }
            if (i === exercises.length - 1) {
              // Every prescribed set was already recorded — land on the
              // last exercise so "Complete Set" finishes the session.
              resumeExerciseIndex = i;
              resumeSetNumber = exercises[i].sets;
            }
          }
        }

        return { session, ids, resumeExerciseIndex, resumeSetNumber };
      })
      .then(({ session, ids, resumeExerciseIndex, resumeSetNumber }) => {
        if (cancelled) return;
        setSessionId(session.id);
        setSessionExerciseIds(ids);
        setExerciseIndex(resumeExerciseIndex);
        setSetNumber(resumeSetNumber);
        startTimeRef.current = new Date(session.startedAt).getTime();
        setInitializing(false);
      })
      .catch((error) => {
        if (cancelled) return;
        setInitError(error instanceof Error ? error.message : "Something went wrong");
        setInitializing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isAuthenticated, workoutPlanDayId, exercises]);

  const exercise = exercises[exerciseIndex];
  const isLastSet = setNumber === exercise?.sets;
  const isLastExercise = exerciseIndex === exercises.length - 1;
  const nextExercise = exercises[exerciseIndex + 1];

  const finishRest = (kind: Advance) => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (kind === "set") {
      setSetNumber((n) => n + 1);
    } else if (kind === "exercise") {
      setExerciseIndex((i) => i + 1);
      setSetNumber(1);
    }
    setAdvanceKind(null);
    setPhase("active");
  };

  useEffect(() => {
    if (phase !== "resting" || !exercise) return;

    let remaining = exercise.restSec;

    timerRef.current = setInterval(() => {
      remaining -= 1;
      setRestRemaining(Math.max(remaining, 0));
      if (remaining <= 0) {
        finishRest(advanceKind);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase, advanceKind, exercise?.restSec]);

  const handleCompleteSet = async () => {
    if (!isAuthenticated || !sessionId || !exercise || savingSet || completing) return;

    setSavingSet(true);
    try {
      await recordSet(sessionId, {
        sessionExerciseId: sessionExerciseIds[exerciseIndex],
        setNumber,
        reps: exercise.reps,
        weightKg: exercise.targetWeightKg,
      });
    } catch (error) {
      setSavingSet(false);
      toast.error(
        "Couldn't save that set",
        error instanceof Error ? error.message : "Something went wrong",
      );
      return;
    }
    setSavingSet(false);

    if (!isLastSet) {
      setAdvanceKind("set");
      setRestRemaining(exercise.restSec);
      setPhase("resting");
      return;
    }
    if (!isLastExercise) {
      setAdvanceKind("exercise");
      setRestRemaining(exercise.restSec);
      setPhase("resting");
      return;
    }

    setCompleting(true);
    try {
      const result = await completeWorkoutSession(sessionId, {});
      setCompletionResult(result);
    } catch (error) {
      setCompleting(false);
      toast.error(
        "Couldn't finish the workout",
        error instanceof Error ? error.message : "Something went wrong",
      );
      return;
    }
    setCompleting(false);

    const start = startTimeRef.current ?? Date.now();
    setElapsedMin(Math.max(1, Math.round((Date.now() - start) / 60000)));
    setPhase("complete");
  };

  const handleSkipRest = () => {
    finishRest(advanceKind);
  };

  const handleExit = () => {
    Alert.alert("End Workout?", "You can resume this session later from Home.", [
      { text: "Cancel", style: "cancel" },
      { text: "End Workout", style: "destructive", onPress: () => navigation.goBack() },
    ]);
  };

  if (initializing) {
    return (
      <View
        className="flex-1 items-center justify-center bg-bg px-8"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 font-semibold text-sm text-text-muted">
          Preparing your session...
        </Text>
      </View>
    );
  }

  if (initError) {
    return (
      <View
        className="flex-1 items-center justify-center bg-bg px-8"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <View
          className="h-14 w-14 items-center justify-center rounded-full"
          style={{ backgroundColor: `${colors.danger}12` }}
        >
          <AlertCircle size={25} color={colors.danger} />
        </View>
        <Text className="mt-4 text-center font-semibold text-sm text-text">
          Couldn&apos;t start this workout
        </Text>
        <Text className="mt-1.5 text-center font-regular text-xs text-text-muted">
          {initError}
        </Text>
        <Pressable
          onPress={() => navigation.goBack()}
          className="mt-6 h-12 items-center justify-center rounded-2xl px-8 active:opacity-90"
          style={{ backgroundColor: colors.primary }}
        >
          <Text className="font-bold text-sm" style={{ color: colors.bg }}>
            Go Back
          </Text>
        </Pressable>
      </View>
    );
  }

  if (phase === "complete") {
    return (
      <>
        <View
          className="flex-1 items-center justify-center bg-bg px-8"
          style={{
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
          }}
        >
          {/* Trophy */}
          <View
            className="h-20 w-20 items-center justify-center overflow-hidden rounded-full"
            style={{
              shadowColor: colors.primary,
              shadowOffset: { width: 0, height: 8 },
              shadowOpacity: 0.35,
              shadowRadius: 20,
              elevation: 8,
            }}
          >
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Trophy size={34} color={colors.bg} strokeWidth={2.2} />
          </View>

          {/* Heading */}
          <Text className="mt-6 font-extrabold text-2xl text-text">
            Workout Complete!
          </Text>

          <Text className="mt-1.5 text-center font-regular text-sm text-text-muted">
            Great work finishing {workoutName}.
          </Text>

          {/* Workout Summary */}
          <View className="mt-7 w-full flex-row justify-between rounded-2xl border border-border bg-surface p-5">
            <SummaryStat
              label="Exercises"
              value={`${exercises.length}`}
            />
            <SummaryStat
              label="Time"
              value={`${elapsedMin} min`}
            />
            <SummaryStat
              label="Status"
              value="Done"
            />
          </View>

          {/* XP Rewards */}
          <View className="mt-6 w-full rounded-2xl bg-violet-500/10 p-5">
            <Text className="text-center text-3xl font-bold text-violet-500">
              +{completionResult?.totalXpEarned ?? 0} XP
            </Text>

            <Text className="mt-2 text-center text-sm text-gray-500">
              Total XP earned this workout
            </Text>

            <Text className="mt-3 text-center font-semibold text-gray-900 dark:text-white">
              🔥 {completionResult?.currentStreak ?? 0} Day Streak
            </Text>

            {completionResult?.rewards.some(
              (reward) => reward.type === "streak_milestone",
            ) && (
                <Text className="mt-2 text-center text-sm font-medium text-violet-500">
                  🎉 Streak milestone bonus unlocked!
                </Text>
              )}
          </View>

          {/* Done Button */}
          <Pressable
            onPress={handleDone}
            className="mt-8 h-14 w-full items-center justify-center rounded-2xl active:opacity-90"
            style={{ backgroundColor: colors.primary }}
          >
            <Text
              className="font-bold text-base"
              style={{ color: colors.bg }}
            >
              Done
            </Text>
          </Pressable>
        </View>
      </>
    );
  }

  const totalProgressUnits = exercises.reduce(
    (total, item) => total + item.sets,
    0,
  );

  const completedProgressUnits =
    exercises
      .slice(0, exerciseIndex)
      .reduce((total, item) => total + item.sets, 0) +
    (setNumber - 1);

  const progress =
    totalProgressUnits > 0
      ? completedProgressUnits / totalProgressUnits
      : 0;

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center justify-between px-6 pt-2">
        <Pressable
          onPress={handleExit}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface active:opacity-70"
        >
          <X size={18} color={colors.text} />
        </Pressable>

        <Text className="font-bold text-sm text-text">
          Exercise {exerciseIndex + 1} of {exercises.length}
        </Text>

        <View className="h-10 w-10" />
      </View>

      <View className="mt-4 px-6">
        <View
          className="h-1.5 overflow-hidden rounded-full"
          style={{ backgroundColor: colors.border }}
        >
          <View
            className="h-full rounded-full"
            style={{
              width: `${Math.min(progress * 100, 100)}%`,
              backgroundColor: colors.primary,
            }}
          />
        </View>
      </View>

      <View className="flex-1 px-6" style={{ paddingBottom: insets.bottom + 12 }}>
        <View
          className="mt-6 items-center justify-center overflow-hidden rounded-[30px]"
          style={{
            height: 140,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.border,
          }}
        >
          <LinearGradient
            colors={[colors.surfaceAlt, colors.surface]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFill}
          />
          <View
            className="h-14 w-14 items-center justify-center rounded-full"
            style={{ backgroundColor: `${colors.primary}18` }}
          >
            <Dumbbell size={26} color={colors.primary} strokeWidth={2} />
          </View>
        </View>

        <Text
          className="mt-2.5 text-[10px] font-bold uppercase tracking-[1.4px]"
          style={{ color: colors.primary }}
        >
          {exercise.muscleGroup}
        </Text>
        <Text className="mt-1 font-extrabold text-2xl text-text">{exercise.name}</Text>

        <View className="mt-4 flex-row flex-wrap gap-2">
          <MetaChip icon={ListChecks} label={`Set ${setNumber} of ${exercise.sets}`} />
          <MetaChip icon={Dumbbell} label={`${exercise.reps} reps`} />
          <MetaChip icon={Clock} label={`${exercise.restSec}s rest`} />
        </View>

        <View className="mt-5 flex-1">
          <Text
            className="mb-2.5 text-[10px] font-bold uppercase tracking-[1.4px]"
            style={{ color: colors.textMuted }}
          >
            Workout Exercises
          </Text>
          <ScrollView
            style={{ flex: 1 }}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 4 }}
          >
            {exercises.map((item, index) => (
              <ExerciseListRow
                key={item.id}
                index={index}
                name={item.name}
                sets={item.sets}
                reps={item.reps}
                isCompleted={index < exerciseIndex}
                isCurrent={index === exerciseIndex}
              />
            ))}
          </ScrollView>
        </View>

        {phase === "resting" ? (
          <View className="mt-8 items-center rounded-[28px] border border-border bg-surface px-6 py-8">
            <Text className="font-semibold text-sm text-text-muted">Resting...</Text>
            <Text className="mt-2 font-extrabold text-5xl text-text">{restRemaining}s</Text>
            <Text className="mt-2 text-center font-regular text-xs text-text-muted">
              {advanceKind === "exercise" && nextExercise
                ? `Up next: ${nextExercise.name}`
                : "Get ready for your next set"}
            </Text>

            <Pressable
              onPress={handleSkipRest}
              className="mt-5 flex-row items-center gap-1.5 rounded-full border border-border px-4 py-2 active:opacity-70"
            >
              <SkipForward size={13} color={colors.textMuted} />
              <Text className="font-semibold text-xs text-text-muted">Skip Rest</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handleCompleteSet}
            disabled={savingSet || completing}
            className="mt-8 h-16 flex-row items-center justify-center gap-2 rounded-2xl active:opacity-90"
            style={{
              backgroundColor: colors.primary,
              opacity: savingSet || completing ? 0.6 : 1,
            }}
          >
            {savingSet || completing ? (
              <ActivityIndicator size="small" color={colors.bg} />
            ) : (
              <Check size={19} color={colors.bg} strokeWidth={2.7} />
            )}
            <Text className="font-extrabold text-base" style={{ color: colors.bg }}>
              {completing ? "Finishing..." : savingSet ? "Saving..." : "Complete Set"}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <View className="items-center">
      <Text className="font-extrabold text-lg text-text">{value}</Text>
      <Text className="mt-0.5 font-regular text-[11px] text-text-muted">{label}</Text>
    </View>
  );
}

function ExerciseListRow({
  index,
  name,
  sets,
  reps,
  isCompleted,
  isCurrent,
}: {
  index: number;
  name: string;
  sets: number;
  reps: number;
  isCompleted: boolean;
  isCurrent: boolean;
}) {
  const colors = useThemeColors();
  return (
    <View
      className="mb-2.5 flex-row items-center rounded-2xl px-4 py-3"
      style={{
        backgroundColor: isCurrent ? `${colors.primary}12` : colors.surface,
        borderWidth: 1,
        borderColor: isCurrent ? colors.primary : colors.border,
        opacity: isCompleted ? 0.55 : 1,
      }}
    >
      <View
        className="h-8 w-8 items-center justify-center rounded-full"
        style={{ backgroundColor: isCompleted || isCurrent ? colors.primary : colors.surfaceAlt }}
      >
        {isCompleted ? (
          <Check size={14} color={colors.bg} strokeWidth={2.7} />
        ) : (
          <Text
            className="font-bold text-xs"
            style={{ color: isCurrent ? colors.bg : colors.textMuted }}
          >
            {index + 1}
          </Text>
        )}
      </View>
      <View className="ml-3 flex-1">
        <Text
          className="font-semibold text-sm text-text"
          numberOfLines={1}
          style={{ textDecorationLine: isCompleted ? "line-through" : "none" }}
        >
          {name}
        </Text>
        <Text className="mt-0.5 font-regular text-[11px] text-text-muted">
          {sets} sets × {reps} reps
        </Text>
      </View>
    </View>
  );
}

function MetaChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  const colors = useThemeColors();
  return (
    <View
      className="flex-row items-center rounded-full px-3 py-2"
      style={{ backgroundColor: colors.surfaceAlt, borderWidth: 1, borderColor: colors.border }}
    >
      <Icon size={12} color={colors.primary} strokeWidth={2} />
      <Text className="ml-1.5 text-[10px] font-semibold" style={{ color: colors.textMuted }}>
        {label}
      </Text>
    </View>
  );
}
