import { useCallback, useEffect, useState } from "react";
import {
  getProgress,
  type ProgressData,
  type ProgressPeriod,
} from "@/lib/progress-api";
import { useAppSelector } from "@/store/hooks";

export function useProgress(period: ProgressPeriod) {
  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");

  const [progress, setProgress] = useState<ProgressData | null>(null);
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

      const data = await getProgress(period);

      setProgress(data);
    } catch (error) {
      console.error("Failed to fetch progress:", error);
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, period]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return {
    progress,
    loading,
    error,
    refresh: fetchProgress,
  };
}