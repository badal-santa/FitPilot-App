import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Bell } from "lucide-react-native";
import { useEffect, useState } from "react";
import { ActivityIndicator, Pressable, Switch, Text, View } from "react-native";

import OnboardingProgress from "@/components/common/OnboardingProgress";
import Screen from "@/components/common/Screen";
import { useToast } from "@/components/common/Toast";
import { useThemeColors } from "@/constants/colors";
import { updateProfile } from "@/lib/profile-api";
import type { RootStackParamList } from "@/navigation/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { onboardingActions } from "@/store/onboarding-slice";

type Props = NativeStackScreenProps<RootStackParamList, "Preferences">;

const DAY_OPTIONS = [2, 3, 4, 5, 6];

export default function PreferencesScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const [phase, setPhase] = useState<"form" | "generating">("form");
  const [saving, setSaving] = useState(false);
  const dispatch = useAppDispatch();
  const toast = useToast();
  const workoutDays = useAppSelector((state) => state.onboarding.workoutDays);
  const remindersEnabled = useAppSelector((state) => state.onboarding.remindersEnabled);
  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");

  useEffect(() => {
    if (phase !== "generating") return;
    const timeout = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: "Main" }] });
    }, 1600);
    return () => clearTimeout(timeout);
  }, [phase, navigation]);

  const handleCreatePlan = async () => {
    if (!isAuthenticated) return;
    setSaving(true);
    try {
      await updateProfile({
        workoutDays,
        remindersEnabled,
        onboardingCompleted: true,
      });
      setPhase("generating");
    } catch (error) {
      toast.error(
        "Couldn't save your preferences",
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  };

  if (phase === "generating") {
    return (
      <Screen className="items-center justify-center px-10">
        <View className="mb-7 h-24 w-24 items-center justify-center rounded-full border border-primary-dark bg-surface">
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
        <Text className="text-center font-extrabold text-2xl text-text">Building your plan</Text>
        <Text className="mt-2 text-center font-regular text-sm text-text-muted">
          Our AI coach is putting together a plan tailored to your goals.
        </Text>
      </Screen>
    );
  }

  return (
    <Screen className="px-6">
      <OnboardingProgress step={3} />

      <Text className="mt-6 font-extrabold text-[28px] text-text">Set your preferences</Text>
      <Text className="mt-2 font-regular text-sm leading-5 text-text-muted">
        A few last details so your plan fits your schedule.
      </Text>

      <Text className="mb-3 mt-8 font-medium text-xs text-text-muted">
        Workout days per week
      </Text>
      <View className="flex-row gap-2">
        {DAY_OPTIONS.map((d) => {
          const selected = workoutDays === d;
          return (
            <Pressable
              key={d}
              onPress={() => dispatch(onboardingActions.setWorkoutDays(d))}
              className="h-14 flex-1 items-center justify-center rounded-2xl border"
              style={{
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.surfaceAlt : colors.surface,
              }}
            >
              <Text
                className="font-bold text-base"
                style={{ color: selected ? colors.primary : colors.text }}
              >
                {d}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View className="mt-6 flex-row items-center justify-between rounded-2xl border border-border bg-surface p-4">
        <View className="mr-4 flex-1 flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-xl bg-primary-dark/30">
            <Bell size={18} color={colors.primary} />
          </View>
          <View className="flex-1">
            <Text className="font-semibold text-sm text-text">Workout reminders</Text>
            <Text className="mt-0.5 font-regular text-xs text-text-muted">
              Get nudged before each session
            </Text>
          </View>
        </View>
        <Switch
          value={remindersEnabled}
          onValueChange={(value) => {
            dispatch(onboardingActions.setRemindersEnabled(value));
          }}
          trackColor={{ false: colors.surfaceAlt, true: colors.primaryDark }}
          thumbColor={remindersEnabled ? colors.primary : colors.textFaint}
        />
      </View>

      <View className="flex-1" />

      <Pressable
        onPress={handleCreatePlan}
        disabled={saving}
        className="mb-4 h-14 flex-row items-center justify-center rounded-2xl bg-primary active:opacity-90"
        style={{ opacity: saving ? 0.5 : 1 }}
      >
        <Text className="font-bold text-base text-bg">
          {saving ? "Saving..." : "Create My Plan"}
        </Text>
      </Pressable>
    </Screen>
  );
}
