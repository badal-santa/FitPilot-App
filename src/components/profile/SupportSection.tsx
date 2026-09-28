import { LinearGradient } from "expo-linear-gradient";
import { HelpCircle, Shield, Star } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";

import { SettingDivider, SettingRow } from "./SettingRow";

export default function SupportSection() {
  const colors = useThemeColors();

  return (
    <>
      <Text className="mb-2 mt-6 font-semibold text-sm text-text">Support</Text>
      <View className="overflow-hidden rounded-[28px] border border-border">
        <LinearGradient
          colors={[colors.surfaceAlt, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <SettingRow icon={HelpCircle} label="Help & Support" onPress={() => {}} />
        <SettingDivider />
        <SettingRow icon={Shield} label="Privacy Policy" onPress={() => {}} />
        <SettingDivider />
        <SettingRow icon={Star} label="Rate the App" onPress={() => {}} />
      </View>
    </>
  );
}
