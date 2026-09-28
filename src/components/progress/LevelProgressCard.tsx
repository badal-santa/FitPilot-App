import { Trophy } from "lucide-react-native";
import { Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";
import { getXpLevel } from "@/lib/xp";

/** Current fitness level from total XP, with progress to the next level. */
export default function LevelProgressCard({
  totalXp,
  loading,
}: {
  totalXp: number;
  loading: boolean;
}) {
  const colors = useThemeColors();
  const level = getXpLevel(totalXp);

  return (
    <View className="mt-4 overflow-hidden rounded-[28px] border border-primary/20 bg-surface p-5">
      {/* Header */}
      <View className="flex-row items-center justify-between">
        <View>
          <Text className="text-[12px] font-semibold text-text-muted">YOUR FITNESS LEVEL</Text>
          <Text className="mt-2 text-[26px] font-extrabold text-text">Level {level.level}</Text>
          <Text className="mt-1 text-[14px] font-bold" style={{ color: colors.primary }}>
            {level.title}
          </Text>
        </View>

        <View
          className="h-16 w-16 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${colors.primary}15` }}
        >
          <Trophy size={30} color={colors.primary} />
        </View>
      </View>

      {/* XP progress */}
      <View className="mt-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-[12px] font-semibold text-text-muted">
            {loading ? "Loading XP..." : `${totalXp.toLocaleString()} XP`}
          </Text>
          <Text className="text-[12px] font-bold text-primary">
            {level.nextLevel ? `${level.nextLevel.xp.toLocaleString()} XP` : "MAX LEVEL"}
          </Text>
        </View>

        <View className="mt-3 h-3 overflow-hidden rounded-full bg-border">
          <View
            className="h-full rounded-full"
            style={{ width: `${level.progress}%`, backgroundColor: colors.primary }}
          />
        </View>

        <Text className="mt-3 text-[12px] text-text-muted">
          {level.nextLevel
            ? `${level.xpRemaining.toLocaleString()} XP remaining to reach Level ${level.nextLevel.level}`
            : "You've reached the highest level!"}
        </Text>
      </View>
    </View>
  );
}
