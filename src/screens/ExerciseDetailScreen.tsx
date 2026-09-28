import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import {
  AlertCircle,
  Bookmark,
  ChevronLeft,
  Dumbbell,
  Gauge,
  ListChecks,
  type LucideIcon,
  Plus,
  Target,
} from "lucide-react-native";
import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useCallback, useEffect, useRef, useState } from "react";
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AdBanner from "@/components/common/AdBanner";
import AddToWorkoutSheet from "@/components/workouts/AddToWorkoutSheet";
import { useThemeColors } from "@/constants/colors";
import { type Exercise, fetchExerciseById } from "@/lib/exercise-api";
import { toTitleCase } from "@/lib/format";
import type { RootStackParamList } from "@/navigation/types";

const HERO_HEIGHT = 320;

type Status = "loading" | "success" | "error";

type Props = NativeStackScreenProps<RootStackParamList, "ExerciseDetail">;

export default function ExerciseDetailScreen({ route, navigation }: Props) {
  const { exerciseId } = route.params;
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();
  const [saved, setSaved] = useState(false);
  const addToWorkoutSheetRef = useRef<BottomSheetModal>(null);

  const [reloadToken, setReloadToken] = useState(0);
  const requestKey = `${exerciseId}|${reloadToken}`;

  // "loading" is derived (true until a result/error lands for the *current*
  // requestKey) rather than set explicitly, so the effect only ever calls
  // setState from inside its async .then/.catch — not synchronously at the
  // top, which React Compiler's linter flags as a cascading-render risk.
  const [result, setResult] = useState<{ key: string; data: Exercise } | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchExerciseById(exerciseId)
      .then((data) => {
        if (cancelled) return;
        setResult({ key: requestKey, data });
      })
      .catch(() => {
        if (cancelled) return;
        setErrorKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, exerciseId]);

  const status: Status =
    errorKey === requestKey ? "error" : result?.key === requestKey ? "success" : "loading";
  const exercise = result?.key === requestKey ? result.data : null;
  const retry = useCallback(() => setReloadToken((token) => token + 1), []);

  if (status !== "success" || !exercise) {
    return (
      <View
        className="flex-1 items-center justify-center bg-bg px-8"
        style={{ paddingTop: insets.top, paddingBottom: insets.bottom }}
      >
        <Pressable
          onPress={() => navigation.goBack()}
          className="absolute left-5 h-10 w-10 items-center justify-center rounded-full border border-border bg-surface active:opacity-70"
          style={{ top: insets.top + 10 }}
        >
          <ChevronLeft size={20} color={colors.text} />
        </Pressable>

        {status === "error" ? (
          <>
            <View
              className="h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: `${colors.danger}12` }}
            >
              <AlertCircle size={25} color={colors.danger} />
            </View>
            <Text className="mt-4 text-center font-semibold text-sm text-text">
              Couldn&apos;t load this exercise
            </Text>
            <Pressable
              onPress={retry}
              className="mt-5 rounded-full px-6 py-3 active:opacity-80"
              style={{ backgroundColor: colors.primary }}
            >
              <Text className="text-[12px] font-bold" style={{ color: colors.bg }}>
                Try Again
              </Text>
            </Pressable>
          </>
        ) : (
          <ActivityIndicator size="small" color={colors.primary} />
        )}
      </View>
    );
  }

  const muscleGroup = exercise.muscleGroup.replace("-", " ");
  // Instructions come back as a single string, not structured steps — split
  // on sentence boundaries to approximate a numbered "how to perform" list.
  const instructionSteps = (exercise.instructions ?? "")
    .split(/(?<=[.!?])\s+/)
    .map((step) => step.trim())
    .filter(Boolean);

  return (
    <View className="flex-1 bg-bg">
      {/* Sticky hero panel — fixed behind the scrolling content */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: HERO_HEIGHT }}>
        <LinearGradient
          colors={[colors.surfaceAlt, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View className="flex-1 items-center justify-center">
          <View
            className="h-24 w-24 items-center justify-center rounded-full"
            style={{ backgroundColor: `${colors.primary}18` }}
          >
            <Dumbbell size={44} color={colors.primary} strokeWidth={1.8} />
          </View>
        </View>
        <LinearGradient
          colors={["transparent", colors.bg]}
          locations={[0.6, 1]}
          style={StyleSheet.absoluteFill}
        />
      </View>

      {/* Content scrolls up over the hero */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: insets.bottom + 120 }}
      >
        <View style={{ height: HERO_HEIGHT }} />

        <View className="-mt-7 rounded-t-[34px] bg-bg px-5 pt-7">
          <View className="flex-row items-center">
            <View className="mr-2 h-1.5 w-1.5 rounded-full" style={{ backgroundColor: colors.primary }} />
            <Text
              className="text-[11px] font-bold uppercase tracking-[1.8px]"
              style={{ color: colors.primary }}
            >
              {toTitleCase(muscleGroup)}
            </Text>
          </View>

          <Text className="mt-2 text-[28px] font-extrabold leading-[34px] tracking-[-0.7px] text-text">
            {toTitleCase(exercise.name)}
          </Text>

          <View className="mt-5 flex-row flex-wrap gap-2">
            <MetaChip icon={Target} label={toTitleCase(muscleGroup)} />
            {exercise.equipment ? (
              <MetaChip icon={Dumbbell} label={toTitleCase(exercise.equipment)} />
            ) : null}
            <MetaChip icon={Gauge} label={toTitleCase(exercise.difficulty)} />
          </View>

          {exercise.description ? (
            <PremiumCard>
              <Text className="text-[13px] leading-[20px] text-text-muted">
                {exercise.description}
              </Text>
            </PremiumCard>
          ) : null}

          {instructionSteps.length > 0 ? (
            <PremiumCard>
              <SectionHeader icon={ListChecks} title="How To Perform" />
              <View className="mt-1">
                {instructionSteps.map((step, index) => (
                  <InstructionStep
                    key={`${step}-${index}`}
                    index={index}
                    text={step}
                    isLast={index === instructionSteps.length - 1}
                  />
                ))}
              </View>
            </PremiumCard>
          ) : null}

          <AdBanner />
        </View>
      </ScrollView>

      {/* Floating hero buttons */}
      <View
        className="absolute inset-x-0 top-0 flex-row items-center justify-between px-5"
        style={{ paddingTop: insets.top + 10 }}
      >
        <GlassButton onPress={() => navigation.goBack()}>
          <ChevronLeft size={21} color={colors.text} strokeWidth={2.2} />
        </GlassButton>
        <GlassButton onPress={() => setSaved((v) => !v)}>
          <Bookmark size={18} color={colors.text} fill={saved ? colors.text : "transparent"} />
        </GlassButton>
      </View>

      {/* Fixed bottom CTA */}
      <View
        className="absolute bottom-0 left-0 right-0 border-t border-border/80 bg-bg/95 px-5 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}
      >
        <Pressable
          onPress={() => addToWorkoutSheetRef.current?.present()}
          className="h-[52px] flex-row items-center justify-center gap-2 rounded-[20px] active:opacity-90"
          style={{
            backgroundColor: colors.primary,
          }}
        >
          <Plus size={19} color={colors.bg} strokeWidth={2.7} />
          <Text className="text-[15px] font-extrabold" style={{ color: colors.bg }}>
            Add to Workout
          </Text>
        </Pressable>
      </View>

      <AddToWorkoutSheet
        ref={addToWorkoutSheetRef}
        exerciseId={exercise.id}
        exerciseName={exercise.name}
      />
    </View>
  );
}

function GlassButton({ onPress, children }: { onPress: () => void; children: React.ReactNode }) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      className="h-11 w-11 items-center justify-center rounded-full border active:opacity-70"
      style={{ borderColor: colors.border, backgroundColor: `${colors.surface}CC` }}
    >
      {children}
    </Pressable>
  );
}

function PremiumCard({ children }: { children: React.ReactNode }) {
  const colors = useThemeColors();
  return (
    <View className="mt-2 overflow-hidden rounded-[14px] border border-border">
      <LinearGradient
        colors={[colors.surfaceAlt, colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View
        pointerEvents="none"
        className="absolute -right-16 -top-16 h-36 w-36 rounded-full bg-primary/5"
      />
      <View className="p-5">{children}</View>
    </View>
  );
}

function SectionHeader({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  const colors = useThemeColors();
  return (
    <View className="mb-5 flex-row items-center gap-3">
      <View
        className="h-9 w-9 items-center justify-center rounded-2xl"
        style={{ backgroundColor: `${colors.primary}15` }}
      >
        <Icon size={17} color={colors.primary} strokeWidth={2} />
      </View>
      <Text className="text-[15px] font-bold text-text">{title}</Text>
    </View>
  );
}

function MetaChip({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  const colors = useThemeColors();
  return (
    <View className="flex-row items-center rounded-full border border-border bg-surface px-3 py-2">
      <View
        className="mr-2 h-6 w-6 items-center justify-center rounded-full"
        style={{ backgroundColor: `${colors.primary}12` }}
      >
        <Icon size={11} color={colors.primary} strokeWidth={2} />
      </View>
      <Text className="text-[11px] font-semibold text-text-muted">{label}</Text>
    </View>
  );
}

function InstructionStep({
  index,
  text,
  isLast,
}: {
  index: number;
  text: string;
  isLast: boolean;
}) {
  const colors = useThemeColors();
  return (
    <View className="flex-row">
      <View className="mr-4 items-center">
        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: `${colors.primary}14`, borderWidth: 1, borderColor: `${colors.primary}55` }}
        >
          <Text className="text-[12px] font-extrabold" style={{ color: colors.primary }}>
            {index + 1}
          </Text>
        </View>
        {!isLast ? (
          <View className="my-1 w-[1px] flex-1" style={{ backgroundColor: `${colors.primary}22` }} />
        ) : null}
      </View>

      <View className={`flex-1 ${isLast ? "pb-1" : "pb-5"}`}>
        <Text className="pt-1 text-[13px] leading-[20px] text-text-muted">{text}</Text>
      </View>
    </View>
  );
}
