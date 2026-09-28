import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { Check, Dumbbell, Flame, Leaf, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import OnboardingProgress from "@/components/common/OnboardingProgress";
import Screen from "@/components/common/Screen";
import { useToast } from "@/components/common/Toast";
import { useThemeColors } from "@/constants/colors";
import { updateProfile } from "@/lib/profile-api";
import type { RootStackParamList } from "@/navigation/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { type Goal, GOAL_LABEL, onboardingActions } from "@/store/onboarding-slice";

type Props = NativeStackScreenProps<RootStackParamList, "Goal">;

const GOALS: { id: Goal; icon: LucideIcon; description: string }[] = [
  { id: "lose-weight", icon: Flame, description: "Burn fat and feel lighter" },
  { id: "build-muscle", icon: Dumbbell, description: "Get stronger and leaner" },
  { id: "stay-fit", icon: Leaf, description: "Maintain a healthy lifestyle" },
];

export default function GoalScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const goal = useAppSelector((state) => state.onboarding.goal);
  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    if (!goal || !isAuthenticated) return;
    setSaving(true);
    try {
      await updateProfile({ goal });
      navigation.navigate("ProfileSetup");
    } catch (error) {
      toast.error(
        "Couldn't save your goal",
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen className="px-6">
      <OnboardingProgress step={1} />

      <Text className="mt-6 font-extrabold text-[28px] text-text">What&apos;s your goal?</Text>
      <Text className="mt-2 font-regular text-sm leading-5 text-text-muted">
        Choose one to get a personalized plan from our AI coach.
      </Text>

      <View className="mt-8 gap-4">
        {GOALS.map((g) => {
          const selected = goal === g.id;
          const Icon = g.icon;
          return (
            <Pressable
              key={g.id}
              onPress={() => dispatch(onboardingActions.setGoal(g.id))}
              className="flex-row items-center rounded-2xl border p-4"
              style={{
                borderColor: selected ? colors.primary : colors.border,
                backgroundColor: selected ? colors.surfaceAlt : colors.surface,
              }}
            >
              <View className="h-12 w-12 items-center justify-center rounded-xl bg-primary-dark/10">
                <Icon size={22} color={colors.primary} />
              </View>
              <View className="ml-4 flex-1">
                <Text className="font-semibold text-base text-text">{GOAL_LABEL[g.id]}</Text>
                <Text className="mt-0.5 font-regular text-xs text-text-muted">
                  {g.description}
                </Text>
              </View>
              {selected ? <Check size={22} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </View>

      <View className="flex-1" />

      <Pressable
        onPress={handleNext}
        disabled={!goal || saving}
        className="mb-4 h-14 flex-row items-center justify-center rounded-2xl bg-primary active:opacity-90"
        style={{ opacity: goal && !saving ? 1 : 0.5 }}
      >
        <Text className="font-bold text-base text-bg">{saving ? "Saving..." : "Next"}</Text>
      </Pressable>
    </Screen>
  );
}
