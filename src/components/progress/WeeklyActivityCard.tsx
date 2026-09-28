import { Activity } from "lucide-react-native";
import { Text, View } from "react-native";

import BarChart from "@/components/common/BarChart";
import { useThemeColors } from "@/constants/colors";

type ActivityBar = {
  day: string;
  label: string;
  value: number;
};

type ActivityData = {
  activeCount: number;
  total: number;
  unitLabel: string;
  bars: ActivityBar[];
};

type Props = {
  activity: ActivityData | null;
  loading?: boolean;
};

export default function WeeklyActivityCard({
  activity,
  loading = false,
}: Props) {
  const colors = useThemeColors();

  if (loading) {
    return <ActivitySkeleton />;
  }

  const activeCount = activity?.activeCount ?? 0;
  const total = activity?.total ?? 0;
  const unitLabel = activity?.unitLabel ?? "days";
  const bars = activity?.bars ?? [];

  return (
    <View className="mt-4 rounded-[24px] border border-border bg-surface p-5">
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className="h-10 w-10 items-center justify-center rounded-xl"
            style={{
              backgroundColor: `${colors.primary}12`,
            }}
          >
            <Activity
              size={18}
              color={colors.primary}
            />
          </View>

          <View className="ml-3">
            <Text className="text-[14px] font-bold text-text">
              Activity
            </Text>

            <Text className="mt-0.5 text-[11px] text-text-muted">
              Your training activity
            </Text>
          </View>
        </View>

        {/* =================================================
            ACTIVE COUNT
        ================================================= */}

        <View className="items-end">
          <Text
            className="text-[18px] font-extrabold"
            style={{
              color: colors.primary,
            }}
          >
            {activeCount}/{total}
          </Text>

          <Text className="text-[10px] text-text-muted">
            {unitLabel}
          </Text>
        </View>
      </View>

      {/* =====================================================
          CHART
      ===================================================== */}

      <View className="mt-5">
        {bars.length > 0 ? (
          <BarChart data={bars} />
        ) : (
          <View className="h-[100px] items-center justify-center">
            <Text className="text-[12px] text-text-muted">
              No activity data available
            </Text>
          </View>
        )}
      </View>
    </View>
  );
}

/* ============================================================
   LOADING
============================================================ */

function ActivitySkeleton() {
  const colors = useThemeColors();

  return (
    <View className="mt-4 rounded-[24px] border border-border bg-surface p-5">
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <View
            className="h-10 w-10 rounded-xl"
            style={{
              backgroundColor: colors.border,
            }}
          />

          <View className="ml-3">
            <View
              className="h-4 w-20 rounded-md"
              style={{
                backgroundColor: colors.border,
              }}
            />

            <View
              className="mt-2 h-3 w-28 rounded-md"
              style={{
                backgroundColor: colors.border,
              }}
            />
          </View>
        </View>

        <View className="items-end">
          <View
            className="h-5 w-10 rounded-md"
            style={{
              backgroundColor: colors.border,
            }}
          />

          <View
            className="mt-1 h-3 w-10 rounded-md"
            style={{
              backgroundColor: colors.border,
            }}
          />
        </View>
      </View>

      <View
        className="mt-5 h-[100px] rounded-xl"
        style={{
          backgroundColor: colors.border,
        }}
      />
    </View>
  );
}