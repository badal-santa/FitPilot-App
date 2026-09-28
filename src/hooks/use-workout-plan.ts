import { useCallback, useEffect, useState } from "react";

import {
  generateWorkoutPlan,
  getWorkoutPlanDetail,
  getWorkoutPlans,
  regenerateWorkoutPlan,
  type WorkoutPlanDetail,
} from "@/lib/workout-api";
import { useRegisterRefresh } from "@/hooks/use-refresh-registry";
import { useAppSelector } from "@/store/hooks";

type Status = "loading" | "success" | "error";

async function loadActivePlanDetail(): Promise<WorkoutPlanDetail> {
  const plans = await getWorkoutPlans();
  let active = plans.find((p) => p.status === "active") ?? plans[0];

  if (!active) {
    // No plan yet — generate is safe to call unconditionally (returns the
    // existing plan if one already exists) and this only ever creates one
    // the first time a user lands on a plan-driven screen.
    await generateWorkoutPlan();
    const regenerated = await getWorkoutPlans();
    active = regenerated.find((p) => p.status === "active") ?? regenerated[0];
    if (!active) throw new Error("Unable to build a workout plan");
  }

  return getWorkoutPlanDetail(active.id);
}

export function useWorkoutPlan() {
  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");
  const [reloadToken, setReloadToken] = useState(0);
  const requestKey = `${isAuthenticated}|${reloadToken}`;

  const [result, setResult] = useState<{ key: string; data: WorkoutPlanDetail } | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;

    loadActivePlanDetail()
      .then((detail) => {
        if (cancelled) return;
        setResult({ key: requestKey, data: detail });
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

  // Pull-to-refresh: re-fetch under the current requestKey so the plan
  // stays on screen until the new data lands.
  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const detail = await loadActivePlanDetail();
      setResult({ key: requestKey, data: detail });
    } catch {
      // Keep what's on screen.
    }
  }, [isAuthenticated, requestKey]);

  useRegisterRefresh(refresh);

  // Callers are expected to catch — this only reflects errors up so a
  // button press can show them, unlike the initial-load failure above.
  const regenerate = useCallback(async () => {
    if (!isAuthenticated) throw new Error("You're not signed in.");
    await regenerateWorkoutPlan();
    setReloadToken((token) => token + 1);
  }, [isAuthenticated]);

  return {
    plan: result?.key === requestKey ? result.data : null,
    status,
    retry,
    regenerate,
  };
}
