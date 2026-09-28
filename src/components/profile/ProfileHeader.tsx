import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import { ChevronRight, Pencil, Target } from "lucide-react-native";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";
import { useAppSelector } from "@/store/hooks";
import { GOAL_LABEL } from "@/store/onboarding-slice";

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .filter(Boolean)
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function ProfileHeader() {
  const colors = useThemeColors();
  const navigation = useNavigation();
  const name = useAppSelector((state) => state.onboarding.name);
  const goal = useAppSelector((state) => state.onboarding.goal);

  return (
    <Pressable
      onPress={() => navigation.navigate("EditProfile")}
      className="mt-5 overflow-hidden rounded-[28px] border border-border active:opacity-95"
    >
      <LinearGradient
        colors={[colors.surfaceAlt, colors.surface]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View className="flex-row items-center p-4">
        <View
        >
          <View className="h-[56px] w-[56px] items-center justify-center overflow-hidden rounded-full">
            <LinearGradient
              colors={[colors.primary, colors.primaryDark]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={StyleSheet.absoluteFill}
            />
            <Text className="font-extrabold text-2xl text-bg">{getInitials(name)}</Text>
          </View>

          <View
            className="absolute -bottom-0.5 -right-0.5 h-6 w-6 items-center justify-center rounded-full border-2"
            style={{ backgroundColor: colors.bg, borderColor: colors.surface }}
          >
            <Pencil size={10} color={colors.primary} />
          </View>
        </View>

        <View className="ml-4 flex-1">
          <Text className="font-bold text-xl text-text">{name}</Text>
          <View className="mt-1.5 flex-row items-center gap-1 self-start rounded-full bg-primary/15 px-2.5 py-1">
            <Target size={11} color={colors.primary} />
            <Text className="font-semibold text-[11px]" style={{ color: colors.primary }}>
              {goal ? GOAL_LABEL[goal] : "Set your fitness goal"}
            </Text>
          </View>
        </View>

        <ChevronRight size={18} color={colors.textFaint} />
      </View>
    </Pressable>
  );
}
