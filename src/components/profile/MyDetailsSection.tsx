import { LinearGradient } from "expo-linear-gradient";
import { Activity, Calendar, type LucideIcon, Ruler, Scale } from "lucide-react-native";
import { StyleSheet, Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";
import { ACTIVITY_LEVEL_LABEL, type ActivityLevel } from "@/store/onboarding-slice";

export default function MyDetailsSection({
  age,
  height,
  weight,
  activityLevel,
}: {
  age: string;
  height: string;
  weight: string;
  activityLevel: ActivityLevel;
}) {
  const colors = useThemeColors();

  return (
    <>
      <Text className="mb-2 mt-6 font-semibold text-sm text-text">My Details</Text>
      <View className="overflow-hidden rounded-[28px] border border-border">
        <LinearGradient
          colors={[colors.surfaceAlt, colors.surface]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        <View className="flex-row flex-wrap">
          <DetailCell icon={Calendar} label="Age" value={`${age} yrs`} borderRight borderBottom />
          <DetailCell icon={Ruler} label="Height" value={`${height} cm`} borderBottom />
          <DetailCell icon={Scale} label="Weight" value={`${weight} kg`} borderRight />
          <DetailCell
            icon={Activity}
            label="Activity"
            value={ACTIVITY_LEVEL_LABEL[activityLevel].split(" — ")[0]}
          />
        </View>
      </View>
    </>
  );
}

function DetailCell({
  icon: Icon,
  label,
  value,
  borderRight,
  borderBottom,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  borderRight?: boolean;
  borderBottom?: boolean;
}) {
  const colors = useThemeColors();
  return (
    <View
      className="w-1/2 gap-2 p-4"
      style={{
        borderRightWidth: borderRight ? 1 : 0,
        borderBottomWidth: borderBottom ? 1 : 0,
        borderColor: colors.border,
      }}
    >
      <View className="flex-row items-center gap-2">

      <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/15">
        <Icon size={16} color={colors.primary} />
      </View>
      <View>
        <Text className="font-bold text-sm text-text" numberOfLines={1}>
          {value}
        </Text>
        <Text className="font-regular text-[11px] text-text-faint">{label}</Text>
      </View>
      </View>
    </View>
  );
}
