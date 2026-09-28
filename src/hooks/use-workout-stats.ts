import { useCallback, useEffect, useState } from "react";

import {
  getWorkoutStats,
  type WorkoutStats,
} from "@/lib/workout-api";
import { useRegisterRefresh } from "@/hooks/use-refresh-registry";
import { useAppSelector } from "@/store/hooks";

export function useWorkoutStats() {
  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");

  const [stats, setStats] = useState<WorkoutStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const fetchStats = useCallback(async () => {
    if (!isAuthenticated) {
      setStats(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);

      const data = await getWorkoutStats();

      setStats(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Pull-to-refresh: keep the current numbers on screen (no loading
  // skeleton) and swap them when the new ones arrive.
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      setStats(await getWorkoutStats());
      setError(false);
    } catch {
      setError(true);
    }
  }, [isAuthenticated]);

  useRegisterRefresh(refresh);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refresh,
  };
}