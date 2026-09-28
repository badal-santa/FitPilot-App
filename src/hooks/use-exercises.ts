import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";

import { useRegisterRefresh } from "@/hooks/use-refresh-registry";
import { type Exercise, fetchExercises } from "@/lib/exercise-api";

type Status = "loading" | "success" | "error";

export function useExercises(options: { muscleGroup?: string; search?: string }) {
  const { muscleGroup, search } = options;
  const [reloadToken, setReloadToken] = useState(0);
  const requestKey = `${muscleGroup ?? ""}|${reloadToken}`;

  // "loading" is derived (true until a result/error lands for the *current*
  // requestKey) rather than set explicitly, so the effect only ever calls
  // setState from inside its async .then/.catch — not synchronously at the
  // top, which React Compiler's linter flags as a cascading-render risk.
  const [result, setResult] = useState<{ key: string; data: Exercise[] } | null>(null);
  const [errorKey, setErrorKey] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    fetchExercises({ muscleGroup })
      .then((data) => {
        if (cancelled) return;
        setResult({ key: requestKey, data });
      })
      .catch(() => {
        if (cancelled) return;
        setErrorKey(requestKey);
      });

    return () => {
      cancelled = true;
    };
  }, [requestKey, muscleGroup]);

  const status: Status =
    errorKey === requestKey ? "error" : result?.key === requestKey ? "success" : "loading";

  const retry = useCallback(() => setReloadToken((token) => token + 1), []);

  // Quiet refetch under the current requestKey: the list stays on screen
  // (no loading state) and swaps when the new data lands. Used for
  // pull-to-refresh and when the screen regains focus, so exercises added
  // in the admin panel show up without restarting the app.
  const refresh = useCallback(async () => {
    try {
      const data = await fetchExercises({ muscleGroup });
      setResult({ key: requestKey, data });
    } catch {
      // Keep the current list; the error state has its own retry.
    }
  }, [muscleGroup, requestKey]);

  useRegisterRefresh(refresh);

  // Skip the first focus — the effect above already loads on mount.
  const hasFocused = useRef(false);
  useFocusEffect(
    useCallback(() => {
      if (!hasFocused.current) {
        hasFocused.current = true;
        return;
      }
      refresh();
    }, [refresh]),
  );

  const all = result?.key === requestKey ? result.data : [];
  const query = search?.trim().toLowerCase() ?? "";
  const exercises = query ? all.filter((ex) => ex.name.toLowerCase().includes(query)) : all;

  return {
    exercises,
    status,
    retry,
    refresh,
  };
}
