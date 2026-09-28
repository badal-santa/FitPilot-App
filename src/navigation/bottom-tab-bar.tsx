import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { BlurView } from "expo-blur";
import * as Haptics from "expo-haptics";
import { useColorScheme } from "nativewind";
import { useEffect } from "react";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import CoachIcon from "@/assets/icons/Coach";
import HomeIcon from "@/assets/icons/Home";
import ProfileIcon from "@/assets/icons/Profile";
import ProgressIcon from "@/assets/icons/Progress";
import { useThemeColors } from "@/constants/colors";
import Dumbell from "@/assets/icons/Dumbell";

type TabIconComponent = React.ComponentType<{
  size: number;
  color: string;
  stroke: string;
  strokeWidth: number;
}>;

const ICONS: Record<string, TabIconComponent> = {
  Home: HomeIcon,
  Workouts: Dumbell,
  Coach: CoachIcon,
  Progress: ProgressIcon,
  Profile: ProfileIcon,
};

const BAR_HEIGHT = 58;

export function BottomTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const colors = useThemeColors();
  const { colorScheme } = useColorScheme();
  const isLight = colorScheme === "light";

  return (
    <View
      pointerEvents="box-none"
      style={{ position: "absolute", left: 6, right: 6, bottom: insets.bottom + 6 }}
    >
      <View
        className="overflow-hidden rounded-full border border-border"
        style={{
          height: BAR_HEIGHT,
        }}
      >
        {/* iOS: real native blur, samples automatically. Android's real
            snapshot-based blur (dimezisBlurView*) caused stale content from
            the previously active tab to ghost through when switching tabs,
            so it stays on the "none" fallback (flat translucent tint). */}
        <BlurView
          intensity={Platform.OS === "ios" ? 55 : 100}
          tint={isLight ? "light" : "dark"}
          style={StyleSheet.absoluteFill}
        />
        {/* Translucent tint on top of the blur so icons/labels stay legible */}
        <View className="bg-surface/70" style={StyleSheet.absoluteFill} />

        <View className="h-full w-full flex-row items-center justify-between px-2">
          {state.routes.map((route, index) => {
            const focused = state.index === index;
            const Icon = ICONS[route.name] ?? HomeIcon;

            const onPress = () => {
              const event = navigation.emit({
                type: "tabPress",
                target: route.key,
                canPreventDefault: true,
              });
              if (!focused && !event.defaultPrevented) {
                Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                navigation.navigate(route.name);
              }
            };

            return (
              <TabItem
                key={route.key}
                label={route.name}
                icon={Icon}
                focused={focused}
                onPress={onPress}
                primary={colors.primary}
                inactive={colors.textFaint}
                textColor={colors.text}
              />
            );
          })}
        </View>
      </View>
    </View>
  );
}

function TabItem({
  label,
  icon: Icon,
  focused,
  onPress,
  primary,
  inactive,
  textColor,
}: {
  label: string;
  icon: TabIconComponent;
  focused: boolean;
  onPress: () => void;
  primary: string;
  inactive: string;
  textColor: string;
}) {
  const progress = useSharedValue(focused ? 1 : 0);

  useEffect(() => {
    progress.value = withTiming(focused ? 1 : 0, {
      duration: 200,
      easing: Easing.out(Easing.cubic),
    });
  }, [focused, progress]);

  const pillStyle = useAnimatedStyle(() => ({
    opacity: progress.value,
    transform: [{ scale: 0.85 + progress.value * 0.15 }],
  }));

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center gap-1"
      style={{ height: BAR_HEIGHT }}
    >
      <View className="h-8 items-center justify-center">
        <Animated.View
          pointerEvents="none"
          style={[
            pillStyle,
            {
              position: "absolute",
              height: 32,
              width: 44,
              borderRadius: 16,
              backgroundColor: `${primary}26`,
            },
          ]}
        />
        <Icon
          size={24}
          color={focused ? primary : inactive}
          stroke={focused ? primary : inactive}
          strokeWidth={2.5}
        />
      </View>
      <Text
        className={focused ? "font-bold text-[10px]" : "font-medium text-[10px]"}
        style={{ color: focused ? textColor : inactive }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
