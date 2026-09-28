import { useCallback, useEffect, useState } from "react";

import { generateWorkoutPlan, getTodayWorkout, type TodayWorkout } from "@/lib/workout-api";
import { useRegisterRefresh } from "@/hooks/use-refresh-registry";
import { useAppSelector } from "@/store/hooks";

type Status = "loading" | "success" | "error";

export function useTodayWorkout() {
  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");
  const [reloadToken, setReloadToken] = useState(0);
  const requestKey = `${isAuthenticated}|${reloadToken}`;

  // "loading" is derived (true until a result/error lands for the *current*
  // requestKey) rather than set explicitly, so the effect only ever calls
  // setState from inside its async .then/.catch — not synchronously at the
  // top, which React Compiler's linter flags as a cascading-render risk.
  const [result, setResult] = useState<{ key: string; data: TodayWorkout } | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    getTodayWorkout()
      .then((workout) =>
        // No active plan yet — the API says it's safe to call generate
        // unconditionally (returns the existing plan if one already exists),
        // so this only ever creates one the first time a user lands here.
        workout ? workout : generateWorkoutPlan().then(() => getTodayWorkout()),
      )
      .then((workout) => {
        if (cancelled) return;
        if (workout) {
          setResult({ key: requestKey, data: workout });
        } else {
          setErrorKey(requestKey);
        }
      })
      .catch(() => {
        if (cancelled) return;
        setErrorKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, isAuthenticated]);

  const status: Status =
    errorKey === requestKey ? "error" : result?.key === requestKey ? "success" : "loading";

  const retry = useCallback(() => setReloadToken((token) => token + 1), []);

  // Pull-to-refresh: re-fetch under the *current* requestKey so the card
  // keeps showing today's workout (no loading state) until the new data lands.
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const workout = await getTodayWorkout();
      if (workout) setResult({ key: requestKey, data: workout });
    } catch {
      // Keep what's on screen; the card's own retry covers hard failures.
    }
  }, [isAuthenticated, requestKey]);

  useRegisterRefresh(refresh);

  return {
    workout: result?.key === requestKey ? result.data : null,
    status,
    retry,
  };
}
