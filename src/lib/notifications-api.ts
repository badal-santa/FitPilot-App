import { apiRequest } from "@/lib/api-client";

export type AppNotification = {
  id: string;
  title: string;
  message: string;
  /** ISO timestamp (UTC). */
  createdAt: string;
};

export type NotificationsPage = {
  notifications: AppNotification[];
  page: number;
  total: number;
  hasNextPage: boolean;
};

// Raw shape returned by GET /notifications (see /openapi.json).
type RawNotification = {
  id: string;
  title: string;
  message: string;
  created_at: string;
};

type RawNotificationsResponse = {
  success: true;
  data: {
    notifications: RawNotification[];
    pagination: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
      hasNextPage: boolean;
    };
  };
};

// D1's CURRENT_TIMESTAMP is "YYYY-MM-DD HH:MM:SS" in UTC with no zone
// marker — Date would parse that as local time, so make it explicit ISO/UTC.
function toIsoUtc(timestamp: string): string {
  return /[zZ]|[+-]\d\d:?\d\d$/.test(timestamp)
    ? timestamp
    : `${timestamp.replace(" ", "T")}Z`;
}

/** Broadcast notifications for the in-app inbox, newest first. */
export async function getNotifications(page = 1, limit = 20): Promise<NotificationsPage> {
  const { data } = await apiRequest<RawNotificationsResponse>("/notifications", {
    params: { page, limit },
  });

  return {
    notifications: data.notifications.map((raw) => ({
      id: raw.id,
      title: raw.title,
      message: raw.message,
      createdAt: toIsoUtc(raw.created_at),
    })),
    page: data.pagination.page,
    total: data.pagination.total,
    hasNextPage: data.pagination.hasNextPage,
  };
}
