import { LinearGradient } from "expo-linear-gradient";
import { type LucideIcon, Moon, Sun, SunMoon } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { setThemePreference } from "@/theme/theme-slice";

export default function AppearanceSection() {
  const colors = useThemeColors();
  const dispatch = useAppDispatch();
  const preference = useAppSelector((state) => state.theme.preference);
  const setPreference = (value: "system" | "light" | "dark") =>
    dispatch(setThemePreference(value));

  return (
    <>
      <Text className="mb-2 mt-6 font-semibold text-sm text-text">Appearance</Text>
      <View className="overflow-hidden rounded-[28px] border border-border">
        <LinearGradient
          colors={[colors.surfaceAlt, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View className="flex-row gap-1 p-1">
          <ThemeOption
            label="System"
            icon={SunMoon}
            active={preference === "system"}
            onPress={() => setPreference("system")}
          />
          <ThemeOption
            label="Light"
            icon={Sun}
            active={preference === "light"}
            onPress={() => setPreference("light")}
          />
          <ThemeOption
            label="Dark"
            icon={Moon}
            active={preference === "dark"}
            onPress={() => setPreference("dark")}
          />
        </View>
      </View>
    </>
  );
}

function ThemeOption({
  label,
  icon: Icon,
  active,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center gap-2 rounded-full border py-1"
      style={{
        borderColor: active ? colors.primary : "transparent",
        backgroundColor: active ? `${colors.primary}1F` : "transparent",
        ...(active
          ? {

          }
          : null),
      }}
    >
      <View className="flex-row items-center gap-2">

        <View
          className="h-9 w-9 items-center justify-center rounded-full"
          style={{ backgroundColor: active ? colors.primary : `${colors.textFaint}1A` }}
        >
          <Icon size={16} color={active ? colors.bg : colors.textFaint} />
        </View>
        <Text
          className={active ? "font-bold text-[11px]" : "font-medium text-[11px]"}
          style={{ color: active ? colors.primary : colors.textFaint }}
        >
          {label}
        </Text>
      </View>
    </Pressable>
  );
}
