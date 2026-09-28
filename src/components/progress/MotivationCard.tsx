import { Target } from "lucide-react-native";
import { Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";

export default function MotivationCard() {
  const colors = useThemeColors();

  return (
    <View className="mt-4 overflow-hidden rounded-[28px] border border-primary/15">
      <View
        className="absolute inset-0"
        style={{ backgroundColor: `${colors.primary}07` }}
      />

      <View className="flex-row items-center p-5">
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${colors.primary}15` }}
        >
          <Target size={20} color={colors.primary} />
        </View>

        <View className="ml-3 flex-1">
          <Text className="text-[14px] font-bold text-text">Keep going</Text>
          <Text className="mt-1 text-[12px] leading-[18px] text-text-muted">
            Consistency is what turns small efforts into real progress.
          </Text>
        </View>
      </View>
    </View>
  );
}
