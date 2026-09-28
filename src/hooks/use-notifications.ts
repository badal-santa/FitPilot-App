import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState } from "react-native";

import { useRegisterRefresh } from "@/hooks/use-refresh-registry";
import { type AppNotification, getNotifications } from "@/lib/notifications-api";
import { useAppSelector } from "@/store/hooks";

const PAGE_SIZE = 20;

// The API has no per-user read state (notifications are broadcasts), so
// which ones this device has seen is kept locally. Capped so it can't grow
// forever — the oldest ids fall off first.
const READ_IDS_KEY = "fitpilot_read_notifications";
const MAX_READ_IDS = 500;

type Status = "loading" | "success" | "error";

async function loadReadIds(): Promise<Set<string>> {
  try {
    const raw = await AsyncStorage.getItem(READ_IDS_KEY);
    return new Set(raw ? (JSON.parse(raw) as string[]) : []);
  } catch {
    return new Set();
  }
}

function saveReadIds(ids: Set<string>) {
  const list = [...ids].slice(-MAX_READ_IDS);
  AsyncStorage.setItem(READ_IDS_KEY, JSON.stringify(list)).catch(() => {});
}

export function useNotifications() {
  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");

  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [hasNextPage, setHasNextPage] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const pageRef = useRef(1);
  // Ignores responses from a request that was superseded (e.g. refresh
  // while a load-more is still in flight).
  const requestIdRef = useRef(0);

  const fetchFirstPage = useCallback(() => {
    const requestId = ++requestIdRef.current;
    return Promise.all([getNotifications(1, PAGE_SIZE), loadReadIds()]).then(
      ([page, ids]) => {
        if (requestId !== requestIdRef.current) return;
        pageRef.current = 1;
        setNotifications(page.notifications);
        setHasNextPage(page.hasNextPage);
        setReadIds(ids);
        setStatus("success");
      },
      () => {
        if (requestId !== requestIdRef.current) return;
        setStatus("error");
      },
    );
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    fetchFirstPage();
  }, [isAuthenticated, fetchFirstPage]);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchFirstPage();
    setRefreshing(false);
  }, [fetchFirstPage]);

  const retry = useCallback(() => {
    setStatus("loading");
    fetchFirstPage();
  }, [fetchFirstPage]);

  const loadMore = useCallback(async () => {
    if (!hasNextPage || loadingMore || status !== "success") return;

    const requestId = ++requestIdRef.current;
    const nextPage = pageRef.current + 1;
    setLoadingMore(true);

    try {
      const page = await getNotifications(nextPage, PAGE_SIZE);
      if (requestId !== requestIdRef.current) return;
      pageRef.current = nextPage;
      // De-dupe: a notification sent since page 1 loaded shifts every
      // later page by one, repeating the last item.
      setNotifications((current) => {
        const seen = new Set(current.map((item) => item.id));
        return [...current, ...page.notifications.filter((item) => !seen.has(item.id))];
      });
      setHasNextPage(page.hasNextPage);
    } catch {
      // Keep what's loaded; onEndReached will try again on the next scroll.
    } finally {
      if (requestId === requestIdRef.current) setLoadingMore(false);
    }
  }, [hasNextPage, loadingMore, status]);

  const markAsRead = useCallback((id: string) => {
    setReadIds((current) => {
      if (current.has(id)) return current;
      const next = new Set(current).add(id);
      saveReadIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(() => {
    setReadIds((current) => {
      const next = new Set(current);
      for (const item of notifications) next.add(item.id);
      saveReadIds(next);
      return next;
    });
  }, [notifications]);

  const unreadCount = notifications.filter((item) => !readIds.has(item.id)).length;

  return {
    notifications,
    status,
    hasNextPage,
    loadingMore,
    refreshing,
    unreadCount,
    isRead: (id: string) => readIds.has(id),
    refresh,
    retry,
    loadMore,
    markAsRead,
    markAllAsRead,
  };
}

/**
 * Whether any of the latest notifications is unread on this device — drives
 * the dot on the Home bell. Re-checks whenever the screen comes into focus
 * (e.g. back from Notifications after reading them) and when the app
 * returns to the foreground (a push may have arrived).
 */
export function useHasUnreadNotifications(): boolean {
  const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");
  const [hasUnread, setHasUnread] = useState(false);

  const check = useCallback(async () => {
    if (!isAuthenticated) return;
    try {
      const [page, readIds] = await Promise.all([getNotifications(1, PAGE_SIZE), loadReadIds()]);
      setHasUnread(page.notifications.some((item) => !readIds.has(item.id)));
    } catch {
      // Offline etc. — keep the last known state rather than flicker.
    }
  }, [isAuthenticated]);

  useRegisterRefresh(check);

  useFocusEffect(
    useCallback(() => {
      check();
      const subscription = AppState.addEventListener("change", (state) => {
        if (state === "active") check();
      });
      return () => subscription.remove();
    }, [check]),
  );

  return hasUnread;
}
