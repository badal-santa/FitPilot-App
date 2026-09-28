import {
  ArrowUpRight,
  ChevronRight,
  Dumbbell,
} from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import BarChart from "@/components/common/BarChart";
import { useThemeColors } from "@/constants/colors";
import { useWeeklyProgress } from "@/hooks/use-weekly-progress";

export default function WeeklyProgressCard() {
  const colors = useThemeColors();

  const {
    progress,
    loading,
    error,
  } = useWeeklyProgress();

  const daysTrained = progress?.daysTrained ?? 0;
  const totalDays = progress?.totalDays ?? 7;
  const chartData = progress?.days ?? [];

  return (
    <View className="mt-7">
      {/* =================================================
          SECTION HEADER
      ================================================= */}

      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[17px] font-extrabold text-text">
            Weekly Progress
          </Text>

          <Text className="mt-1 text-[11px] text-text-muted">
            Your consistency this week
          </Text>
        </View>

        <Pressable className="flex-row items-center rounded-full border border-border bg-surface px-3 py-2 active:opacity-70">
          <Text className="mr-1 text-[10px] font-semibold text-text-muted">
            See All
          </Text>

          <ChevronRight
            size={13}
            color={colors.textMuted}
          />
        </Pressable>
      </View>

      {/* =================================================
          CARD
      ================================================= */}

      <View className="relative mt-4 overflow-hidden rounded-[30px] border border-border bg-surface p-5">
        {/* Glow */}

        <View
          pointerEvents="none"
          className="absolute -right-16 -top-16 h-40 w-40 rounded-full"
          style={{
            backgroundColor: `${colors.primary}07`,
          }}
        />

        {/* =================================================
            TOP METRIC
        ================================================= */}

        <View className="flex-row items-center justify-between">
          <View className="flex-row items-center">
            <View
              className="h-11 w-11 items-center justify-center rounded-2xl"
              style={{
                backgroundColor: `${colors.primary}12`,
              }}
            >
              <Dumbbell
                size={19}
                color={colors.primary}
              />
            </View>

            <View className="ml-3">
              <View className="flex-row items-baseline">
                <Text className="text-[27px] font-extrabold tracking-[-0.6px] text-text">
                  {loading ? "—" : daysTrained}
                </Text>

                <Text className="ml-1.5 text-[11px] text-text-muted">
                  / {totalDays}
                </Text>
              </View>

              <Text className="mt-0.5 text-[10px] font-medium text-text-muted">
                days trained
              </Text>
            </View>
          </View>

          {/* Percentage / Status */}

          <View
            className="flex-row items-center rounded-full px-3 py-2"
            style={{
              backgroundColor: `${colors.primary}10`,
            }}
          >
            <ArrowUpRight
              size={13}
              color={colors.primary}
              strokeWidth={2.5}
            />

            <Text
              className="ml-1 text-[10px] font-bold"
              style={{
                color: colors.primary,
              }}
            >
              {daysTrained > 0 ? "Consistent" : "Start"}
            </Text>
          </View>
        </View>

        {/* =================================================
            CHART
        ================================================= */}

        <View className="mt-5">
          {error ? (
            <View className="h-[120px] items-center justify-center">
              <Text className="text-[11px] text-text-muted">
                Unable to load weekly progress
              </Text>
            </View>
          ) : loading ? (
            <View className="h-[120px] items-center justify-center">
              <Text className="text-[11px] text-text-muted">
                Loading progress...
              </Text>
            </View>
          ) : (
            <BarChart data={chartData} />
          )}
        </View>

        {/* =================================================
            FOOTER
        ================================================= */}

        <View className="mt-3 flex-row items-center justify-between border-t border-border pt-3">
          <Text className="text-[10px] text-text-faint">
            {chartData.length > 0
              ? chartData.map((day) => day.day).join(" ")
              : "M T W T F S S"}
          </Text>

          <View className="flex-row items-center">
            <View
              className="mr-1.5 h-1.5 w-1.5 rounded-full"
              style={{
                backgroundColor: colors.primary,
              }}
            />

            <Text
              className="text-[10px] font-semibold"
              style={{
                color: colors.primary,
              }}
            >
              {daysTrained > 0
                ? "Keep it going"
                : "Start your week"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}