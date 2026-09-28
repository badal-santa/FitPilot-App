import { LinearGradient } from "expo-linear-gradient";
import { Bot } from "lucide-react-native";
import { StyleSheet, View } from "react-native";

import { useThemeColors } from "@/constants/colors";

export function CoachAvatar({ size = 28 }: { size?: number }) {
  const colors = useThemeColors();
  return (
    <View
      style={{ height: size, width: size, borderRadius: size / 2 }}
      className="items-center justify-center overflow-hidden"
    >
      <LinearGradient
        colors={[colors.primary, colors.primaryDark]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <Bot size={size * 0.55} color={colors.bg} />
    </View>
  );
}
