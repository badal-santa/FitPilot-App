import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { ChevronDown, ChevronUp } from "lucide-react-native";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import OnboardingProgress from "@/components/common/OnboardingProgress";
import Screen from "@/components/common/Screen";
import { useToast } from "@/components/common/Toast";
import { useThemeColors } from "@/constants/colors";
import { updateProfile } from "@/lib/profile-api";
import type { RootStackParamList } from "@/navigation/types";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { ACTIVITY_LEVEL_LABEL, type ActivityLevel, onboardingActions } from "@/store/onboarding-slice";

type Props = NativeStackScreenProps<RootStackParamList, "ProfileSetup">;

const ACTIVITY_LEVELS = Object.keys(ACTIVITY_LEVEL_LABEL) as ActivityLevel[];

export default function ProfileScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { gender, age, height, weight, activityLevel } = useAppSelector((state) => state.onboarding);
  const [activityOpen, setActivityOpen] = useState(false);
  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");
  const [saving, setSaving] = useState(false);

  const handleNext = async () => {
    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);

    if (!age.trim() || !height.trim() || !weight.trim() || [ageNum, heightNum, weightNum].some(Number.isNaN)) {
      toast.error("Missing details", "Please fill in your age, height and weight.");
      return;
    }
    if (!isAuthenticated) return;

    setSaving(true);
    try {
      await updateProfile({
        gender,
        age: ageNum,
        heightCm: heightNum,
        weightKg: weightNum,
        activityLevel,
      });
      navigation.navigate("Preferences");
    } catch (error) {
      toast.error(
        "Couldn't save your details",
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen className="px-6">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        <OnboardingProgress step={2} />

        <Text className="mt-6 font-extrabold text-[28px] text-text">Tell us about yourself</Text>
        <Text className="mt-2 font-regular text-sm leading-5 text-text-muted">
          This helps us create the perfect plan for you.
        </Text>

        <View className="mt-8 flex-row gap-3">
          <GenderOption
            label="Male"
            selected={gender === "male"}
            onPress={() => dispatch(onboardingActions.setGender("male"))}
          />
          <GenderOption
            label="Female"
            selected={gender === "female"}
            onPress={() => dispatch(onboardingActions.setGender("female"))}
          />
        </View>

        <Field
          label="Age"
          value={age}
          onChangeText={(value) => dispatch(onboardingActions.setAge(value))}
          suffix="years"
        />
        <Field
          label="Height"
          value={height}
          onChangeText={(value) => dispatch(onboardingActions.setHeight(value))}
          suffix="cm"
        />
        <Field
          label="Weight"
          value={weight}
          onChangeText={(value) => dispatch(onboardingActions.setWeight(value))}
          suffix="kg"
        />

        <Text className="mb-2 mt-5 font-medium text-xs text-text-muted">Activity Level</Text>
        <Pressable
          onPress={() => setActivityOpen((v) => !v)}
          className="flex-row items-center justify-between rounded-2xl border border-border bg-surface px-4 py-4"
        >
          <Text className="font-semibold text-sm text-text">
            {ACTIVITY_LEVEL_LABEL[activityLevel].split(" — ")[0]}
          </Text>
          {activityOpen ? (
            <ChevronUp size={18} color={colors.textMuted} />
          ) : (
            <ChevronDown size={18} color={colors.textMuted} />
          )}
        </Pressable>
        <Text className="mt-2 font-regular text-xs text-text-faint">
          {ACTIVITY_LEVEL_LABEL[activityLevel].split(" — ")[1]}
        </Text>

        {activityOpen ? (
          <View className="mt-3 gap-2 rounded-2xl border border-border bg-surface p-2">
            {ACTIVITY_LEVELS.map((level) => (
              <Pressable
                key={level}
                onPress={() => {
                  dispatch(onboardingActions.setActivityLevel(level));
                  setActivityOpen(false);
                }}
                className="rounded-xl px-3 py-3"
                style={{
                  backgroundColor: activityLevel === level ? colors.surfaceAlt : "transparent",
                }}
              >
                <Text className="font-medium text-sm text-text">
                  {ACTIVITY_LEVEL_LABEL[level].split(" — ")[0]}
                </Text>
              </Pressable>
            ))}
          </View>
        ) : null}
      </ScrollView>

      <Pressable
        onPress={handleNext}
        disabled={saving}
        className="mb-4 h-14 flex-row items-center justify-center rounded-2xl bg-primary active:opacity-90"
        style={{ opacity: saving ? 0.5 : 1 }}
      >
        <Text className="font-bold text-base text-bg">{saving ? "Saving..." : "Next"}</Text>
      </Pressable>
    </Screen>
  );
}

function GenderOption({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center rounded-2xl border py-4"
      style={{
        borderColor: selected ? colors.primary : colors.border,
        backgroundColor: selected ? colors.surfaceAlt : colors.surface,
      }}
    >
      <Text
        className="font-semibold text-sm"
        style={{ color: selected ? colors.text : colors.textMuted }}
      >
        {label}
      </Text>
    </Pressable>
  );
}

function Field({
  label,
  value,
  onChangeText,
  suffix,
}: {
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  suffix: string;
}) {
  const colors = useThemeColors();
  return (
    <View className="mt-5">
      <Text className="mb-2 font-medium text-xs text-text-muted">{label}</Text>
      <View className="flex-row items-center rounded-2xl border border-border bg-surface px-4">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType="numeric"
          placeholderTextColor={colors.textFaint}
          className="flex-1 py-4 font-semibold text-base text-text"
        />
        <Text className="font-regular text-sm text-text-faint">{suffix}</Text>
      </View>
    </View>
  );
}
