import { Flame } from "lucide-react-native";
import { Text, View } from "react-native";

import BarChart from "@/components/common/BarChart";
import { useThemeColors } from "@/constants/colors";

type CaloriesBar = {
  label: string;
  value: number;
};

type CaloriesData = {
  total: number;
  average: number;
  bars: CaloriesBar[];
};

type Props = {
  calories: CaloriesData | null;
  loading?: boolean;
};

export default function CaloriesTrendCard({
  calories,
  loading = false,
}: Props) {
  const colors = useThemeColors();

  if (loading) {
    return <CaloriesSkeleton />;
  }

  const total = calories?.total ?? 0;
  const average = calories?.average ?? 0;
  const bars = calories?.bars ?? [];

  /*
   * BarChart expects values between 0 and 1.
   *
   * Backend gives actual calorie values:
   *
   * 0, 0, 0, 250, 0, 0, 0
   *
   * So normalize against the highest calorie value.
   */
  const maxCalories = Math.max(
    ...bars.map((bar) => bar.value),
    1,
  );

  const chartData = bars.map((bar) => ({
    day: bar.label,
    label: bar.label,
    value: bar.value / maxCalories,
  }));

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
            <Flame
              size={18}
              color={colors.primary}
            />
          </View>

          <View className="ml-3">
            <Text className="text-[14px] font-bold text-text">
              Calories
            </Text>

            <Text className="mt-0.5 text-[11px] text-text-muted">
              Calories burned
            </Text>
          </View>
        </View>

        {/* =================================================
            TOTAL
        ================================================= */}

        <View className="items-end">
          <Text
            className="text-[18px] font-extrabold"
            style={{
              color: colors.primary,
            }}
          >
            {total}
          </Text>

          <Text className="text-[10px] text-text-muted">
            kcal
          </Text>
        </View>
      </View>

      {/* =====================================================
          AVERAGE
      ===================================================== */}

      <View className="mt-4 flex-row items-center justify-between">
        <Text className="text-[11px] text-text-muted">
          Average
        </Text>

        <Text className="text-[12px] font-bold text-text">
          {average} kcal/day
        </Text>
      </View>

      {/* =====================================================
          CHART
      ===================================================== */}

      <View className="mt-4">
        {chartData.length > 0 ? (
          <BarChart data={chartData} />
        ) : (
          <View className="h-[100px] items-center justify-center">
            <Text className="text-[12px] text-text-muted">
              No calorie data available
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

function CaloriesSkeleton() {
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
            className="h-5 w-12 rounded-md"
            style={{
              backgroundColor: colors.border,
            }}
          />

          <View
            className="mt-1 h-3 w-8 rounded-md"
            style={{
              backgroundColor: colors.border,
            }}
          />
        </View>
      </View>

      <View className="mt-4 flex-row justify-between">
        <View
          className="h-3 w-14 rounded-md"
          style={{
            backgroundColor: colors.border,
          }}
        />

        <View
          className="h-3 w-20 rounded-md"
          style={{
            backgroundColor: colors.border,
          }}
        />
      </View>

      <View
        className="mt-4 h-[100px] rounded-xl"
        style={{
          backgroundColor: colors.border,
        }}
      />
    </View>
  );
}