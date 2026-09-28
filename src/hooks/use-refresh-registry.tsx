import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";

type RefreshFn = () => Promise<unknown> | void;

const RefreshRegistryContext = createContext<Set<{ current: RefreshFn }> | null>(null);

/**
 * Pull-to-refresh for a screen whose sections each load their own data.
 * Wrap the sections in <RefreshRegistryProvider>, have each section call
 * useRegisterRefresh(itsRefresh), and pass `refreshing`/`refreshAll` to the
 * screen's RefreshControl — the spinner stops once every section is done.
 */
export function useRefreshRegistry() {
  // useState initializer, not useRef().current, so it's safe to read in render.
  const [registry] = useState(() => new Set<{ current: RefreshFn }>());
  const [refreshing, setRefreshing] = useState(false);

  // `silent` skips the pull-to-refresh spinner — for background refreshes
  // like returning to the screen.
  const refreshAll = useCallback(
    async ({ silent = false }: { silent?: boolean } = {}) => {
      if (!silent) setRefreshing(true);
      try {
        // allSettled: one failing section shouldn't leave the spinner stuck.
        await Promise.allSettled([...registry].map((entry) => entry.current()));
      } finally {
        if (!silent) setRefreshing(false);
      }
    },
    [registry],
  );

  const Provider = useCallback(
    ({ children }: { children: React.ReactNode }) => (
      <RefreshRegistryContext.Provider value={registry}>{children}</RefreshRegistryContext.Provider>
    ),
    [registry],
  );

  return { refreshing, refreshAll, RefreshRegistryProvider: Provider };
}

/** Registers `refresh` with the nearest RefreshRegistryProvider (no-op without one). */
export function useRegisterRefresh(refresh: RefreshFn) {
  const registry = useContext(RefreshRegistryContext);
  // Always call the latest function without re-registering every render.
  const entry = useRef({ current: refresh });

  useEffect(() => {
    entry.current.current = refresh;
  }, [refresh]);

  useEffect(() => {
    if (!registry) return;
    const item = entry.current;
    registry.add(item);
    return () => {
      registry.delete(item);
    };
  }, [registry]);
}
