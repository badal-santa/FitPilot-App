import type { BottomSheetModal } from "@gorhom/bottom-sheet";
import { LinearGradient } from "expo-linear-gradient";
import { Bell, Ruler } from "lucide-react-native";
import { useRef } from "react";
import { StyleSheet, Switch, Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { type Units, UNITS_LABEL, onboardingActions } from "@/store/onboarding-slice";

import { SettingDivider, SettingRow } from "./SettingRow";
import UnitsBottomSheet from "./UnitsBottomSheet";

export default function PreferencesSection({
  remindersEnabled,
  onRemindersChange,
}: {
  remindersEnabled: boolean;
  onRemindersChange: (enabled: boolean) => void;
}) {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const units = useAppSelector((state) => state.onboarding.units);
  const unitsSheetRef = useRef<BottomSheetModal>(null);

  const handleSelectUnits = (value: Units) => {
    dispatch(onboardingActions.setUnits(value));
    unitsSheetRef.current?.dismiss();
  };

  return (
    <>
      <Text className="mb-2 mt-6 font-semibold text-sm text-text">Preferences</Text>
      <View className="overflow-hidden rounded-[28px] border border-border">
        <LinearGradient
          colors={[colors.surfaceAlt, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        
        <SettingRow icon={Bell} label="Workout Reminders">
          <Switch
            value={remindersEnabled}
            onValueChange={onRemindersChange}
            trackColor={{ false: colors.surfaceAlt, true: colors.primary }}
            thumbColor="#FFFFFF"
          />
        </SettingRow>
        <SettingDivider />
        <SettingRow
          icon={Ruler}
          label="Units"
          trailingText={UNITS_LABEL[units]}
          onPress={() => unitsSheetRef.current?.present()}
        />
      </View>

      <UnitsBottomSheet ref={unitsSheetRef} selected={units} onSelect={handleSelectUnits} />
    </>
  );
}
