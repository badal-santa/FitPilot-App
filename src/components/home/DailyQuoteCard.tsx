
import { LinearGradient } from "expo-linear-gradient";
import { Quote, Sparkles } from "lucide-react-native";
import {
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useThemeColors } from "@/constants/colors";
import { getDailyQuote } from "@/constants/quotes";

export default function DailyQuoteCard() {
  const colors = useThemeColors();

  return (
    <View
      className="mt-5 overflow-hidden rounded-[30px]"
      style={{
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.border,
      }}
    >
      {/* Theme-aware background */}
      <LinearGradient
        colors={[
          colors.surfaceAlt,
          colors.surface,
        ]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Decorative glow */}
      <View
        pointerEvents="none"
        className="absolute -left-16 -top-16 h-40 w-40 rounded-full"
        style={{
          backgroundColor: `${colors.primary}0C`,
        }}
      />

      {/* Decorative quote */}
      <Quote
        size={112}
        color={colors.primary}
        opacity={0.09}
        style={{
          position: "absolute",
          right: -8,
          bottom: -15,
        }}
      />

      <View className="p-5">
        {/* Header */}
        <View className="flex-row items-center">
          <View
            className="h-10 w-10 items-center justify-center rounded-2xl"
            style={{
              backgroundColor: `${colors.primary}15`,
            }}
          >
            <Sparkles
              size={17}
              color={colors.primary}
            />
          </View>

          <View className="ml-3">
            <Text
              className="text-[10px] font-bold uppercase tracking-[1.5px]"
              style={{ color: colors.primaryDark }}
            >
              Daily Mindset
            </Text>

            <Text
              className="mt-1 text-[11px]"
              style={{ color: colors.textMuted }}
            >
              A little motivation for today
            </Text>
          </View>
        </View>

        {/* Quote */}
        <View className="mt-5 flex-row">
          <View
            className="mr-3 w-[3px] rounded-full"
            style={{ backgroundColor: colors.primary }}
          />

          <Text
            className="min-w-0 flex-1 text-[17px] font-semibold leading-[26px]"
            style={{ color: colors.text }}
          >
            {`“${getDailyQuote()}”`}
          </Text>
        </View>

        {/* Footer */}
        <View className="mt-5 flex-row items-center">
          <View
            className="h-[2px] w-7 rounded-full"
            style={{ backgroundColor: colors.primary }}
          />

          <Text
            className="ml-2 text-[10px] font-medium uppercase tracking-[1px]"
            style={{ color: colors.textMuted }}
          >
            Stay consistent
          </Text>
        </View>
      </View>
    </View>
  );
}