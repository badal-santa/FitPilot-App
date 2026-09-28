import {
  CheckCheck,
  Flame,
  Scale,
  type LucideIcon,
} from "lucide-react-native";
import { Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";
import { useAppSelector } from "@/store/hooks";
import { useWorkoutStats } from "@/hooks/use-workout-stats";

export default function StatsRow() {
  const colors = useThemeColors();

  const weightKg = useAppSelector(
    (state) => state.auth.profile?.weightKg,
  );

  const { stats, loading } = useWorkoutStats();

  // "—" until real numbers arrive (or if they couldn't load) — never
  // placeholder values that look like the user's own data.
  const workoutsCompleted =
    !loading && stats ? String(stats.workoutsCompleted) : "—";

  const caloriesToday =
    !loading && stats ? String(Math.round(stats.caloriesToday)) : "—";

  return (
    <View className="mt-4 flex-row gap-2.5">
      <StatCard
        icon={CheckCheck}
        value={workoutsCompleted}
        label="Workouts"
      />

      <StatCard
        icon={Flame}
        value={caloriesToday}
        label="Calories"
      />

      <StatCard
        icon={Scale}
        value={weightKg != null ? `${weightKg} kg` : "—"}
        label="Weight"
      />
    </View>
  );
}

function StatCard({
  icon: Icon,
  value,
  label,
}: {
  icon: LucideIcon;
  value: string;
  label: string;
}) {
  const colors = useThemeColors();

  return (
    <View className="relative min-h-[96px] flex-1 overflow-hidden rounded-[22px] border border-border bg-surface p-3.5">
      {/* Ambient glow */}

      <View
        pointerEvents="none"
        className="absolute -right-6 -top-6 h-20 w-20 rounded-full"
        style={{
          backgroundColor: `${colors.primary}06`,
        }}
      />

      {/* Icon */}

      <View
        className="h-9 w-9 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `${colors.primary}12`,
        }}
      >
        <Icon
          size={16}
          color={colors.primary}
          strokeWidth={2}
        />
      </View>

      {/* Value */}

      <Text className="mt-2.5 text-[17px] font-extrabold tracking-[-0.2px] text-text">
        {value}
      </Text>

      {/* Label */}

      <Text className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.6px] text-text-muted">
        {label}
      </Text>
    </View>
  );
}