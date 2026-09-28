import { useState } from "react";

import AdBanner from "@/components/common/AdBanner";
import Screen from "@/components/common/Screen";
import CaloriesTrendCard from "@/components/progress/CaloriesTrendCard";
import LevelProgressCard from "@/components/progress/LevelProgressCard";
import MotivationCard from "@/components/progress/MotivationCard";
import PeriodSelector from "@/components/progress/PeriodSelector";
import ProgressHeader from "@/components/progress/ProgressHeader";
import ProgressStatsRow from "@/components/progress/ProgressStatsRow";
import RewardsCard from "@/components/progress/RewardsCard";
import WeeklyActivityCard from "@/components/progress/WeeklyActivityCard";
import { useProgress } from "@/hooks/useProgress";
import type { ProgressPeriod } from "@/lib/progress-api";

export function ProgressScreen() {
  const [period, setPeriod] = useState<ProgressPeriod>("weekly");
  const { progress, loading } = useProgress(period);

  const totalXp = progress?.rewards?.totalXp ?? 0;

  return (
    <Screen scroll contentContainerStyle={{ paddingBottom: 150 }}>
      <ProgressHeader />

      <PeriodSelector value={period} onChange={setPeriod} />

      <ProgressStatsRow stats={progress?.stats ?? null} loading={loading} />

      <RewardsCard
        totalXp={totalXp}
        currentStreak={progress?.stats?.currentStreak ?? 0}
        history={progress?.rewards?.history ?? []}
        loading={loading}
      />

      <LevelProgressCard totalXp={totalXp} loading={loading} />

      {/* WeightTrendCard (progress.weight) is built but hidden for now. */}

      <WeeklyActivityCard activity={progress?.activity ?? null} loading={loading} />

      <CaloriesTrendCard calories={progress?.calories ?? null} loading={loading} />

      <MotivationCard />

      <AdBanner />
    </Screen>
  );
}
