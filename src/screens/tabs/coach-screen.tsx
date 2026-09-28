import { Sparkles } from "lucide-react-native";
import { Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { CoachAvatar } from "@/components/coach/ChatBubble";
import { useThemeColors } from "@/constants/colors";

export function CoachScreen() {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();

  return (
    <View className="flex-1 bg-bg" style={{ paddingTop: insets.top }}>
      <View className="flex-row items-center gap-3 px-6 pb-4 pt-2">
        <CoachAvatar size={40} />
        <View>
          <Text className="font-bold text-xl text-text">AI Coach</Text>
          <Text className="font-regular text-xs text-text-muted">
            Your personal fitness assistant
          </Text>
        </View>
      </View>

      <View className="flex-1 items-center justify-center px-8" style={{ paddingBottom: insets.bottom }}>
        <View
          className="h-16 w-16 items-center justify-center rounded-full"
          style={{ backgroundColor: `${colors.primary}12` }}
        >
          <Sparkles size={28} color={colors.primary} />
        </View>

        <Text className="mt-5 font-bold text-lg text-text">Coming Soon</Text>
        <Text className="mt-2 text-center font-regular text-sm leading-5 text-text-muted">
          Your AI coach is still warming up. Chat-based coaching will be available here soon.
        </Text>
      </View>
    </View>
  );
}
