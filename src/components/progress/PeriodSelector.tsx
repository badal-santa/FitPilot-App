import { Pressable, Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";
import type { ProgressPeriod } from "@/lib/progress-api";

const PERIODS: { label: string; value: ProgressPeriod }[] = [
  { label: "Weekly", value: "weekly" },
  { label: "Monthly", value: "monthly" },
  { label: "Yearly", value: "yearly" },
];

/** Weekly / Monthly / Yearly segmented control. */
export default function PeriodSelector({
  value,
  onChange,
}: {
  value: ProgressPeriod;
  onChange: (period: ProgressPeriod) => void;
}) {
  return (
    <View className="mt-5 flex-row rounded-full border border-border bg-surface p-1">
      {PERIODS.map((period) => (
        <PeriodButton
          key={period.value}
          label={period.label}
          active={value === period.value}
          onPress={() => onChange(period.value)}
        />
      ))}
    </View>
  );
}

function PeriodButton({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="tab"
      accessibilityState={{ selected: active }}
      className="h-10 flex-1 items-center justify-center rounded-full"
      style={{ backgroundColor: active ? colors.primary : "transparent" }}
    >
      <Text
        className="text-[12px] font-bold"
        style={{ color: active ? colors.bg : colors.textMuted }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
