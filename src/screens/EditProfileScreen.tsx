import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import {
  Camera,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronUp,
  Dumbbell,
  Flame,
  Leaf,
  type LucideIcon,
} from "lucide-react-native";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";

import Screen from "@/components/common/Screen";
import { useToast } from "@/components/common/Toast";
import { useThemeColors } from "@/constants/colors";
import { updateProfile } from "@/lib/profile-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import {
  ACTIVITY_LEVEL_LABEL,
  type ActivityLevel,
  type Goal,
  GOAL_LABEL,
  onboardingActions,
} from "@/store/onboarding-slice";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<RootStackParamList, "EditProfile">;

const GOALS: { id: Goal; icon: LucideIcon }[] = [
  { id: "lose-weight", icon: Flame },
  { id: "build-muscle", icon: Dumbbell },
  { id: "stay-fit", icon: Leaf },
];

const ACTIVITY_LEVELS = Object.keys(ACTIVITY_LEVEL_LABEL) as ActivityLevel[];

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function EditProfileScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const onboarding = useAppSelector((state) => state.onboarding);
  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");

  const [name, setName] = useState(onboarding.name);
  const [goal, setGoal] = useState(onboarding.goal);
  const [gender, setGender] = useState(onboarding.gender);
  const [age, setAge] = useState(onboarding.age);
  const [height, setHeight] = useState(onboarding.height);
  const [weight, setWeight] = useState(onboarding.weight);
  const [activityLevel, setActivityLevel] = useState(onboarding.activityLevel);
  const [activityOpen, setActivityOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleSave = async () => {
    const ageNum = Number(age);
    const heightNum = Number(height);
    const weightNum = Number(weight);

    if (
      !age.trim() ||
      !height.trim() ||
      !weight.trim() ||
      [ageNum, heightNum, weightNum].some(Number.isNaN)
    ) {
      toast.error("Missing details", "Please fill in your age, height and weight.");
      return;
    }
    if (!isAuthenticated) return;

    setSaving(true);
    try {
      await updateProfile({
        ...(goal ? { goal } : {}),
        gender,
        age: ageNum,
        heightCm: heightNum,
        weightKg: weightNum,
        activityLevel,
      });

      dispatch(onboardingActions.setName(name.trim() || onboarding.name));
      if (goal) dispatch(onboardingActions.setGoal(goal));
      dispatch(onboardingActions.setGender(gender));
      dispatch(onboardingActions.setAge(age));
      dispatch(onboardingActions.setHeight(height));
      dispatch(onboardingActions.setWeight(weight));
      dispatch(onboardingActions.setActivityLevel(activityLevel));
      navigation.goBack();
    } catch (error) {
      toast.error(
        "Couldn't save changes",
        error instanceof Error ? error.message : "Something went wrong",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen className="px-6">
      <View className="flex-row items-center justify-between pt-2">
        <Pressable
          onPress={() => navigation.goBack()}
          className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface"
        >
          <ChevronLeft size={20} color={colors.text} />
        </Pressable>
        <Text className="font-bold text-lg text-text">Edit Profile</Text>
        <View className="h-10 w-10" />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="interactive"
        >
          {/* Avatar */}
          <View className="mt-6 items-center">
            <View
              className="h-24 w-24 items-center justify-center overflow-hidden rounded-full"
              style={{
                shadowColor: colors.primary,
                shadowOffset: { width: 0, height: 8 },
                shadowOpacity: 0.35,
                shadowRadius: 16,
                elevation: 6,
              }}
            >
              <LinearGradient
                colors={[colors.primary, colors.primaryDark]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ position: "absolute", height: "100%", width: "100%" }}
              />
              <Text className="font-extrabold text-2xl text-bg">{getInitials(name)}</Text>
            </View>
            <Pressable className="mt-3 flex-row items-center gap-1.5 active:opacity-70">
              <Camera size={14} color={colors.primary} />
              <Text className="font-semibold text-xs" style={{ color: colors.primary }}>
                Change Photo
              </Text>
            </Pressable>
          </View>

          {/* Name */}
          <Field label="Name" value={name} onChangeText={setName} />

          {/* Goal */}
          <Text className="mb-2 mt-5 font-medium text-xs text-text-muted">Fitness Goal</Text>
          <View className="flex-row gap-3">
            {GOALS.map((g) => {
              const selected = goal === g.id;
              const Icon = g.icon;
              return (
                <Pressable
                  key={g.id}
                  onPress={() => setGoal(g.id)}
                  className="flex-1 items-center gap-1.5 rounded-2xl border py-3"
                  style={{
                    borderColor: selected ? colors.primary : colors.border,
                    backgroundColor: selected ? colors.surfaceAlt : colors.surface,
                  }}
                >
                  <Icon size={18} color={selected ? colors.primary : colors.textFaint} />
                  <Text
                    className={selected ? "font-bold text-[11px]" : "font-medium text-[11px]"}
                    style={{ color: selected ? colors.primary : colors.textFaint }}
                  >
                    {GOAL_LABEL[g.id]}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {/* Gender */}
          <Text className="mb-2 mt-5 font-medium text-xs text-text-muted">Gender</Text>
          <View className="flex-row gap-3">
            <GenderOption label="Male" selected={gender === "male"} onPress={() => setGender("male")} />
            <GenderOption
              label="Female"
              selected={gender === "female"}
              onPress={() => setGender("female")}
            />
          </View>

          <Field label="Age" value={age} onChangeText={setAge} suffix="years" />
          <Field label="Height" value={height} onChangeText={setHeight} suffix="cm" />
          <Field label="Weight" value={weight} onChangeText={setWeight} suffix="kg" />

          {/* Activity level */}
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

          {activityOpen ? (
            <View className="mt-3 gap-2 rounded-2xl border border-border bg-surface p-2">
              {ACTIVITY_LEVELS.map((level) => (
                <Pressable
                  key={level}
                  onPress={() => {
                    setActivityLevel(level);
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

          <View className="h-6" />
        </ScrollView>

        <Pressable
          onPress={handleSave}
          disabled={saving}
          className="mb-4 h-14 flex-row items-center justify-center gap-2 rounded-2xl bg-primary active:opacity-90"
          style={{ opacity: saving ? 0.5 : 1 }}
        >
          <Check size={17} color={colors.bg} strokeWidth={2.5} />
          <Text className="font-bold text-base text-bg">
            {saving ? "Saving..." : "Save Changes"}
          </Text>
        </Pressable>
      </KeyboardAvoidingView>
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
  suffix?: string;
}) {
  const colors = useThemeColors();
  return (
    <View className="mt-5">
      <Text className="mb-2 font-medium text-xs text-text-muted">{label}</Text>
      <View className="flex-row items-center rounded-2xl border border-border bg-surface px-4">
        <TextInput
          value={value}
          onChangeText={onChangeText}
          keyboardType={suffix ? "numeric" : "default"}
          placeholderTextColor={colors.textFaint}
          className="flex-1 py-4 font-semibold text-base text-text"
        />
        {suffix ? <Text className="font-regular text-sm text-text-faint">{suffix}</Text> : null}
      </View>
    </View>
  );
}
