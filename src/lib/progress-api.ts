import { apiRequest } from "@/lib/api-client";

export type ProgressPeriod = "weekly" | "monthly" | "yearly";

export interface ProgressBar {
  day: string;
  label: string;
  value: number;
}

export type ProgressStats = {
  currentStreak: number;
  totalWorkouts: number;
  avgCaloriesPerDay: number;
};

export type WeightPoint = {
  label: string;
  value: number;
};

export type ProgressWeight = {
  current: number;
  delta: number;
  points: WeightPoint[];
};

export type ProgressActivity = {
  activeCount: number;
  total: number;
  unitLabel: string;
  bars: ProgressBar[];
};

export type ProgressCalories = {
  total: number;
  average: number;
  bars: ProgressBar[];
};

export interface ProgressRewardHistory {
  event_type: string;
  xp: number;
  event_key: string;
  created_at: string;
}

export interface ProgressRewards {
  totalXp: number;
  totalRewards: number;
  history: ProgressRewardHistory[];
}

export type ProgressData = {
  period: ProgressPeriod;
  stats: ProgressStats;
  weight: ProgressWeight;
  activity: ProgressActivity;
  calories: ProgressCalories;
  rewards: ProgressRewards;
};

export async function getProgress(period: ProgressPeriod): Promise<ProgressData> {
  const result = await apiRequest<{ success: boolean; data: ProgressData; error?: string }>(
    "/progress",
    { params: { period } },
  );

  if (!result.success) {
    throw new Error(result.error ?? "Failed to fetch progress");
  }

  return result.data;
}
