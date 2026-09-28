import { Flame, Trophy, Zap } from "lucide-react-native";
import { Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";
import type { ProgressRewardHistory } from "@/lib/progress-api";
import { getStreakMilestone } from "@/lib/xp";

const RECENT_REWARDS_LIMIT = 5;

/** Total XP, current streak, progress to the next streak milestone, and recent rewards. */
export default function RewardsCard({
  totalXp,
  currentStreak,
  history,
  loading,
}: {
  totalXp: number;
  currentStreak: number;
  history: ProgressRewardHistory[];
  loading: boolean;
}) {
  const colors = useThemeColors();
  const milestone = getStreakMilestone(currentStreak);

  return (
    <View className="mt-5 overflow-hidden rounded-[28px] border border-border bg-surface">
      {/* Header */}
      <View className="flex-row items-center px-5 pt-5">
        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${colors.primary}18` }}
        >
          <Trophy size={21} color={colors.primary} />
        </View>

        <View className="ml-3">
          <Text className="text-[17px] font-extrabold text-text">Rewards & Streaks</Text>
          <Text className="mt-0.5 text-[12px] text-text-muted">Every workout counts.</Text>
        </View>
      </View>

      {/* XP and streak stats */}
      <View className="mt-5 flex-row gap-3 px-5">
        <StatTile
          icon={<Zap size={20} color={colors.primary} />}
          value={loading ? "—" : totalXp.toLocaleString()}
          label="Total XP"
          backgroundColor={`${colors.primary}10`}
        />
        <StatTile
          icon={<Flame size={20} color="#F97316" />}
          value={loading ? "—" : String(currentStreak)}
          label="Day streak"
          backgroundColor="rgba(249, 115, 22, 0.1)"
        />
      </View>

      {/* Milestone progress */}
      <View className="px-5 pb-5 pt-6">
        <View className="flex-row items-center justify-between">
          <Text className="text-[14px] font-bold text-text">
            {milestone.next ? `${milestone.next.days}-day streak` : "All milestones completed!"}
          </Text>

          {milestone.next ? (
            <Text className="text-[12px] font-bold text-primary">+{milestone.next.xp} XP</Text>
          ) : null}
        </View>

        <ProgressBar percent={milestone.progress} />

        <Text className="mt-2 text-[12px] text-text-muted">
          {milestone.next
            ? `${currentStreak} of ${milestone.next.days} days completed`
            : "You've reached the 100-day milestone. Keep going!"}
        </Text>
      </View>

      {/* Recent rewards */}
      <View className="border-t border-border px-5 py-5">
        <Text className="mb-4 text-[15px] font-bold text-text">Recent Rewards</Text>

        {loading ? (
          <Text className="text-[13px] text-text-muted">Loading rewards...</Text>
        ) : history.length === 0 ? (
          <EmptyRewards />
        ) : (
          <View className="gap-4">
            {history.slice(0, RECENT_REWARDS_LIMIT).map((item) => (
              <RewardRow key={item.event_key} reward={item} />
            ))}
          </View>
        )}
      </View>
    </View>
  );
}

function StatTile({
  icon,
  value,
  label,
  backgroundColor,
}: {
  icon: React.ReactNode;
  value: string;
  label: string;
  backgroundColor: string;
}) {
  return (
    <View className="flex-1 rounded-2xl p-4" style={{ backgroundColor }}>
      {icon}
      <Text className="mt-3 text-[26px] font-extrabold text-text">{value}</Text>
      <Text className="mt-1 text-[12px] font-medium text-text-muted">{label}</Text>
    </View>
  );
}

function ProgressBar({ percent }: { percent: number }) {
  const colors = useThemeColors();

  return (
    <View className="mt-3 h-2 overflow-hidden rounded-full bg-border">
      <View
        className="h-full rounded-full"
        style={{ width: `${percent}%`, backgroundColor: colors.primary }}
      />
    </View>
  );
}

function EmptyRewards() {
  const colors = useThemeColors();

  return (
    <View className="items-center rounded-2xl bg-bg px-4 py-5">
      <Trophy size={24} color={colors.textMuted} />
      <Text className="mt-3 text-[13px] font-semibold text-text">No rewards yet</Text>
      <Text className="mt-1 text-center text-[12px] text-text-muted">
        Complete your first workout to earn XP.
      </Text>
    </View>
  );
}

function RewardRow({ reward }: { reward: ProgressRewardHistory }) {
  const colors = useThemeColors();
  const isMilestone = reward.event_type === "streak_milestone";

  return (
    <View className="flex-row items-center">
      <View
        className="h-10 w-10 items-center justify-center rounded-xl"
        style={{ backgroundColor: `${colors.primary}12` }}
      >
        {isMilestone ? (
          <Trophy size={18} color={colors.primary} />
        ) : (
          <Zap size={18} color={colors.primary} />
        )}
      </View>

      <View className="ml-3 flex-1">
        <Text className="text-[13px] font-semibold text-text">
          {isMilestone ? "Streak milestone" : "Workout completed"}
        </Text>
        <Text className="mt-1 text-[11px] text-text-muted">
          {new Date(reward.created_at).toLocaleDateString()}
        </Text>
      </View>

      <Text className="text-[14px] font-extrabold text-primary">+{reward.xp} XP</Text>
    </View>
  );
}
