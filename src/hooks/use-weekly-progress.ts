import { useCallback, useEffect, useState } from "react";

import {
  getWeeklyProgress,
  type WeeklyProgress,
} from "@/lib/workout-api";
import { useRegisterRefresh } from "@/hooks/use-refresh-registry";
import { useAppSelector } from "@/store/hooks";

export function useWeeklyProgress() {
  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");

  const [progress, setProgress] =
    useState<WeeklyProgress | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(false);

  const fetchProgress = useCallback(async () => {
    if (!isAuthenticated) {
      setProgress(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(false);

      const data =
        await getWeeklyProgress();

      setProgress(data);
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
      setProgress(await getWeeklyProgress());
      setError(false);
    } catch {
      setError(true);
    }
  }, [isAuthenticated]);

  useRegisterRefresh(refresh);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    refresh,
  };
}