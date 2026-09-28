import { Text } from "react-native";

import Screen from "@/components/common/Screen";
import AppearanceSection from "@/components/profile/AppearanceSection";
import MyDetailsSection from "@/components/profile/MyDetailsSection";
import PreferencesSection from "@/components/profile/PreferencesSection";
import ProfileHeader from "@/components/profile/ProfileHeader";
import SignOutButton from "@/components/profile/SignOutButton";
import SupportSection from "@/components/profile/SupportSection";
import { updateProfile } from "@/lib/profile-api";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { onboardingActions } from "@/store/onboarding-slice";

export function ProfileScreen() {
  const dispatch = useAppDispatch();

  const {
    age,
    height,
    weight,
    activityLevel,
    remindersEnabled,
  } = useAppSelector((state) => state.onboarding);

  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");

  const handleRemindersChange = async (enabled: boolean) => {
    // Update UI immediately
    dispatch(
      onboardingActions.setRemindersEnabled(enabled),
    );

    if (!isAuthenticated) {
      return;
    }

    try {
      await updateProfile({
        remindersEnabled: enabled,
      });

      console.log(
        "🔔 Workout reminders updated:",
        enabled,
      );
    } catch (error) {
      console.error(
        "❌ Failed to update workout reminders:",
        error,
      );

      // Revert UI if backend update fails
      dispatch(
        onboardingActions.setRemindersEnabled(!enabled),
      );
    }
  };

  return (
    <Screen
      scroll
      contentContainerStyle={{ paddingBottom: 140 }}
    >
      <Text className="pt-2 font-bold text-2xl text-text">
        Profile
      </Text>

      <Text className="mt-1 font-regular text-sm text-text-muted">
        Manage your account and preferences.
      </Text>

      <ProfileHeader />

      <MyDetailsSection
        age={age}
        height={height}
        weight={weight}
        activityLevel={activityLevel}
      />

      <AppearanceSection />

      <PreferencesSection
        remindersEnabled={remindersEnabled}
        onRemindersChange={handleRemindersChange}
      />

      <SupportSection />

      <SignOutButton />

      <Text className="mb-2 mt-6 text-center font-regular text-xs text-text-faint">
        FitPilot v1.0.0
      </Text>
    </Screen>
  );
}