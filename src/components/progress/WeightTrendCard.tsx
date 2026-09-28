import { ArrowDown, ArrowUp, Minus, Scale } from "lucide-react-native";
import { Text, View } from "react-native";

import LineChart from "@/components/common/LineChart";
import { useThemeColors } from "@/constants/colors";

type WeightPoint = {
  label: string;
  value: number;
};

type WeightData = {
  current: number;
  delta: number;
  points: WeightPoint[];
};

type Props = {
  weight: WeightData | null;
  loading?: boolean;
};

export default function WeightTrendCard({
  weight,
  loading = false,
}: Props) {
  const colors = useThemeColors();

  if (loading) {
    return <WeightSkeleton />;
  }

  const current = weight?.current ?? 0;
  const delta = weight?.delta ?? 0;
  const points = weight?.points ?? [];

  const isUp = delta > 0;

  return (
    <View className="mt-4 overflow-hidden rounded-[24px] border border-border bg-surface p-5">
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
            <Scale
              size={18}
              color={colors.primary}
            />
          </View>

          <View className="ml-3">
            <Text className="text-[14px] font-bold text-text">
              Weight Trend
            </Text>

            <Text className="mt-0.5 text-[11px] text-text-muted">
              {current > 0
                ? `${current.toFixed(1)} kg`
                : "No weight data"}
            </Text>
          </View>
        </View>

        {/* =================================================
            DELTA
        ================================================= */}

        {delta > 0 ? (
          <View className="flex-row items-center">
            <ArrowUp
              size={14}
              color={colors.primary}
            />

            <Text
              className="ml-1 text-[12px] font-bold"
              style={{
                color: colors.primary,
              }}
            >
              {Math.abs(delta).toFixed(1)} kg
            </Text>
          </View>
        ) : delta < 0 ? (
          <View className="flex-row items-center">
            <ArrowDown
              size={14}
              color={colors.primary}
            />

            <Text
              className="ml-1 text-[12px] font-bold"
              style={{
                color: colors.primary,
              }}
            >
              {Math.abs(delta).toFixed(1)} kg
            </Text>
          </View>
        ) : (
          <View className="flex-row items-center">
            <Minus
              size={14}
              color={colors.textMuted}
            />

            <Text className="ml-1 text-[12px] font-bold text-text-muted">
              No change
            </Text>
          </View>
        )}
      </View>

      {/* =====================================================
          WEIGHT CONTENT
      ===================================================== */}

      {points.length < 2 ? (
        <View className="mt-5 h-[90px] items-center justify-center rounded-2xl">
          {/* Current weight */}

          <Text
            className="text-[28px] font-extrabold"
            style={{
              color: colors.primary,
            }}
          >
            {current > 0 ? `${current.toFixed(1)} kg` : "--"}
          </Text>

          <Text className="mt-1 text-[11px] text-text-muted">
            Add another weigh-in to see your trend
          </Text>
        </View>
      ) : (
        <View className="mt-5">
          <LineChart data={points} />
        </View>
      )}
    </View>
  );
}

/* ============================================================
   LOADING
============================================================ */

function WeightSkeleton() {
  const colors = useThemeColors();

  return (
    <View className="mt-4 rounded-[24px] border border-border bg-surface p-5">
      <View className="flex-row items-center">
        <View
          className="h-10 w-10 rounded-xl"
          style={{
            backgroundColor: colors.border,
          }}
        />

        <View className="ml-3">
          <View
            className="h-4 w-24 rounded-md"
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
      </View>

      <View
        className="mt-5 h-[90px] rounded-2xl"
        style={{
          backgroundColor: colors.border,
        }}
      />
    </View>
  );
}