import { useNavigation } from "@react-navigation/native";
import {
  AlertCircle,
  Check,
  ListChecks,
  Moon,
  RefreshCw,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import { ActivityIndicator, Alert, Pressable, ScrollView, Text, View } from "react-native";

import { useToast } from "@/components/common/Toast";
import { useThemeColors } from "@/constants/colors";
import { useWorkoutPlan } from "@/hooks/use-workout-plan";
import { showInterstitialThen } from "@/lib/interstitial";

export default function MyPlanSection() {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const toast = useToast();
  const { plan, status, retry, regenerate } = useWorkoutPlan();
  const [regenerating, setRegenerating] = useState(false);

  const handleRegenerate = () => {
    Alert.alert(
      "Regenerate Plan?",
      "This replaces your current plan with a new one based on your profile. Your workout history stays intact.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Regenerate",
          style: "destructive",
          onPress: async () => {
            setRegenerating(true);
            try {
              await regenerate();
            } catch (error) {
              toast.error(
                "Couldn't regenerate your plan",
                error instanceof Error ? error.message : "Something went wrong",
              );
            } finally {
              setRegenerating(false);
            }
          },
        },
      ],
    );
  };

  if (status === "loading") {
    return (
      <View className="mt-6 items-center rounded-[24px] border border-border bg-surface px-6 py-8">
        <ActivityIndicator size="small" color={colors.primary} />
        <Text className="mt-3 text-[12px] font-medium" style={{ color: colors.textMuted }}>
          Loading your plan...
        </Text>
      </View>
    );
  }

  if (status === "error" || !plan) {
    return (
      <View className="mt-6 items-center rounded-[24px] border border-border bg-surface px-6 py-8">
        <AlertCircle size={20} color={colors.danger} />
        <Text className="mt-3 text-[12px] font-semibold text-text">Couldn&apos;t load your plan</Text>
        <Pressable
          onPress={retry}
          className="mt-4 rounded-full border border-border px-4 py-2 active:opacity-70"
        >
          <Text className="text-[11px] font-semibold" style={{ color: colors.textMuted }}>
            Try Again
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View className="mt-6">
      <View className="mb-3 flex-row items-center justify-between">
        <View>
          <Text className="text-[14px] font-bold text-text">My Plan</Text>
          <Text className="mt-0.5 text-[11px] text-text-muted">{plan.name}</Text>
        </View>

        <Pressable
          onPress={handleRegenerate}
          disabled={regenerating}
          className="flex-row items-center gap-1.5 rounded-full border border-border px-3 py-1.5 active:opacity-70"
          style={{ opacity: regenerating ? 0.5 : 1 }}
        >
          {regenerating ? (
            <ActivityIndicator size="small" color={colors.textMuted} />
          ) : (
            <RefreshCw size={12} color={colors.textMuted} />
          )}
          <Text className="text-[10px] font-semibold" style={{ color: colors.textMuted }}>
            {regenerating ? "Regenerating..." : "Regenerate"}
          </Text>
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {plan.days.map((day) => {
          const exerciseCount = day.exercises.length;
          const canStart = !day.restDay && exerciseCount > 0;

          return (
            <Pressable
              key={day.id}
              disabled={!canStart}
              onPress={() =>
                showInterstitialThen(() =>
                  navigation.navigate("WorkoutSession", {
                    workoutPlanDayId: day.id,
                    workoutName: day.title || day.dayName,
                    exercises: day.exercises,
                  }),
                )
              }
              className="w-[150px] rounded-[20px] border p-4 active:opacity-80"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Text
                className="text-[9px] font-bold uppercase tracking-[1px]"
                style={{ color: colors.textMuted }}
              >
                {day.dayName}
              </Text>

              <Text className="mt-1 text-[14px] font-extrabold text-text" numberOfLines={2}>
                {day.restDay ? "Rest Day" : day.title || "Workout"}
              </Text>

              <View className="mt-3 flex-row items-center gap-1.5">
                <PillIcon icon={day.restDay ? Moon : ListChecks} />
                <Text className="text-[10px] font-semibold" style={{ color: colors.textMuted }}>
                  {day.restDay ? "Recovery" : `${exerciseCount} exercises`}
                </Text>
              </View>

              {canStart ? (
                <View
                  className="mt-3 flex-row items-center gap-1 rounded-full px-2.5 py-1.5 self-start"
                  style={{ backgroundColor: `${colors.primary}15` }}
                >
                  <Check size={10} color={colors.primary} />
                  <Text className="text-[9px] font-bold" style={{ color: colors.primary }}>
                    Start
                  </Text>
                </View>
              ) : null}
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

function PillIcon({ icon: Icon }: { icon: LucideIcon }) {
  const colors = useThemeColors();
  return <Icon size={12} color={colors.primary} strokeWidth={2} />;
}
