import { Flame, Trophy, Zap } from "lucide-react-native";
import { Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";

type ProgressStats = {
  currentStreak: number;
  totalWorkouts: number;
  avgCaloriesPerDay: number;
};

type Props = {
  stats: ProgressStats | null;
  loading?: boolean;
};

export default function ProgressStatsRow({
  stats,
  loading = false,
}: Props) {
  const colors = useThemeColors();

  const currentStreak = stats?.currentStreak ?? 0;
  const totalWorkouts = stats?.totalWorkouts ?? 0;
  const avgCaloriesPerDay = stats?.avgCaloriesPerDay ?? 0;

  if (loading) {
    return (
      <View className="mt-4 flex-row gap-3">
        <StatSkeleton />
        <StatSkeleton />
        <StatSkeleton />
      </View>
    );
  }

  return (
    <View className="mt-4 flex-row gap-3">
      {/* =====================================================
          STREAK
      ===================================================== */}

      <StatCard
        icon={
          <Flame
            size={17}
            color={colors.primary}
          />
        }
        value={currentStreak}
        label="Day Streak"
        colors={colors}
      />

      {/* =====================================================
          WORKOUTS
      ===================================================== */}

      <StatCard
        icon={
          <Trophy
            size={17}
            color={colors.primary}
          />
        }
        value={totalWorkouts}
        label="Workouts"
        colors={colors}
      />

      {/* =====================================================
          CALORIES
      ===================================================== */}

      <StatCard
        icon={
          <Zap
            size={17}
            color={colors.primary}
          />
        }
        value={avgCaloriesPerDay}
        label="Avg. Cal"
        colors={colors}
      />
    </View>
  );
}

/* ============================================================
   STAT CARD
============================================================ */

function StatCard({
  icon,
  value,
  label,
  colors,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  colors: ReturnType<typeof useThemeColors>;
}) {
  return (
    <View className="flex-1 rounded-[18px] border border-border bg-surface p-3">
      <View
        className="h-8 w-8 items-center justify-center rounded-xl"
        style={{
          backgroundColor: `${colors.primary}12`,
        }}
      >
        {icon}
      </View>

      <Text className="mt-3 text-[20px] font-extrabold text-text">
        {value}
      </Text>

      <Text className="mt-0.5 text-[10px] font-medium text-text-muted">
        {label}
      </Text>
    </View>
  );
}

/* ============================================================
   SKELETON
============================================================ */

function StatSkeleton() {
  const colors = useThemeColors();

  return (
    <View className="flex-1 rounded-[18px] border border-border bg-surface p-3">
      <View
        className="h-8 w-8 rounded-xl"
        style={{
          backgroundColor: colors.border,
        }}
      />

      <View
        className="mt-3 h-6 w-12 rounded-md"
        style={{
          backgroundColor: colors.border,
        }}
      />

      <View
        className="mt-2 h-3 w-16 rounded-md"
        style={{
          backgroundColor: colors.border,
        }}
      />
    </View>
  );
}