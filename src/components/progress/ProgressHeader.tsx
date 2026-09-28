import { TrendingUp } from "lucide-react-native";
import { Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";

export default function ProgressHeader() {
  const colors = useThemeColors();

  return (
    <View className="relative overflow-hidden pt-2">
      {/* Decorative glow */}
      <View
        pointerEvents="none"
        className="absolute -right-16 -top-20 h-40 w-40 rounded-full"
        style={{ backgroundColor: `${colors.primary}0C` }}
      />

      <View className="flex-row items-end justify-between">
        <View>
          <Text className="text-[30px] font-extrabold tracking-[-0.7px] text-text">
            Progress
          </Text>

          <Text className="mt-1 text-[14px] leading-[20px] text-text-muted">
            Track your fitness journey over time.
          </Text>
        </View>

        <View
          className="h-10 w-10 items-center justify-center rounded-full border border-primary/20"
          style={{ backgroundColor: `${colors.primary}10` }}
        >
          <TrendingUp size={18} color={colors.primary} />
        </View>
      </View>
    </View>
  );
}
