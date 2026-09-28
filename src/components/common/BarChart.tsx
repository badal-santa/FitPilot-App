import { Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";

type Bar = {
  day: string;
  value: number;
};

export default function BarChart({
  data,
  height = 72,
}: {
  data: Bar[];
  height?: number;
}) {
  const colors = useThemeColors();

  return (
    <View>
      {/* =====================================================
          BARS
      ===================================================== */}

      <View
        className="flex-row items-end justify-between"
        style={{ height }}
      >
        {data.map((bar, index) => {
          const fillHeight =
            Math.min(Math.max(bar.value, 0), 1) * height;

          return (
            <View
              key={`${bar.day}-${index}`}
              className="flex-1 items-center justify-end"
              style={{ height }}
            >
              {/* Background track */}

              <View
                className="w-[8px] overflow-hidden rounded-full"
                style={{
                  height,
                  backgroundColor: colors.border,
                }}
              >
                {/* Primary fill */}

                <View
                  className="absolute bottom-0 w-full rounded-full"
                  style={{
                    height: fillHeight,
                    backgroundColor: colors.primary,
                  }}
                />
              </View>
            </View>
          );
        })}
      </View>

      {/* =====================================================
          LABELS
      ===================================================== */}

      <View className="mt-2 flex-row justify-between">
        {data.map((bar, index) => (
          <Text
            key={`${bar.day}-label-${index}`}
            className="flex-1 text-center text-[10px] font-medium"
            style={{
              color: colors.textMuted,
            }}
          >
            {bar.day}
          </Text>
        ))}
      </View>
    </View>
  );
}