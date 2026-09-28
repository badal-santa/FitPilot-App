import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import {
  AlertCircle,
  Bell,
  BellOff,
  CheckCheck,
  ChevronRight,
  Clock3,
  Sparkles,
  X,
} from "lucide-react-native";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  RefreshControl,
  Text,
  View,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "@/constants/colors";
import { useNotifications } from "@/hooks/use-notifications";
import { formatRelativeTime } from "@/lib/format";
import type { AppNotification } from "@/lib/notifications-api";
import type { RootStackParamList } from "@/navigation/types";

type Props = NativeStackScreenProps<
  RootStackParamList,
  "Notifications"
>;

export default function NotificationsScreen({
  navigation,
}: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const {
    notifications,
    status,
    hasNextPage,
    loadingMore,
    refreshing,
    unreadCount,
    isRead,
    refresh,
    retry,
    loadMore,
    markAsRead,
    markAllAsRead,
  } = useNotifications();

  const header = (
    <View>
      {/* =================================================
          HEADER
      ================================================= */}

      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center">
          <Pressable
            onPress={() => navigation.goBack()}
            className="mr-3 h-10 w-10 items-center justify-center rounded-full border border-border bg-surface active:opacity-70"
          >
            <X
              size={18}
              color={colors.text}
            />
          </Pressable>

          <View>
            <Text className="text-[28px] font-extrabold tracking-[-0.6px] text-text">
              Notifications
            </Text>

            <Text className="mt-1 text-[12px] text-text-muted">
              Stay up to date with your fitness journey.
            </Text>
          </View>
        </View>
      </View>

      {status === "success" && notifications.length > 0 ? (
        <>
          {/* =================================================
              SUMMARY CARD
          ================================================= */}

          <View className="mt-6 overflow-hidden rounded-[28px] border border-primary/15">
            <LinearGradient
              colors={[
                colors.surfaceAlt,
                colors.surface,
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={{
                position: "absolute",
                inset: 0,
              }}
            />

            {/* Glow */}

            <View
              pointerEvents="none"
              className="absolute -right-12 -top-14 h-36 w-36 rounded-full"
              style={{
                backgroundColor: `${colors.primary}0A`,
              }}
            />

            <View className="flex-row items-center p-5">
              <View
                className="h-12 w-12 items-center justify-center rounded-2xl"
                style={{
                  backgroundColor: `${colors.primary}14`,
                }}
              >
                <Bell
                  size={21}
                  color={colors.primary}
                />
              </View>

              <View className="ml-3 flex-1">
                <Text className="text-[14px] font-bold text-text">
                  {unreadCount > 0
                    ? `${unreadCount} new ${unreadCount === 1 ? "notification" : "notifications"}`
                    : "You're all caught up"}
                </Text>

                <Text className="mt-1 text-[11px] leading-[17px] text-text-muted">
                  {unreadCount > 0
                    ? "You have updates waiting for you."
                    : "No new notifications right now."}
                </Text>
              </View>

              {unreadCount > 0 ? (
                <Pressable
                  onPress={markAllAsRead}
                  className="flex-row items-center rounded-full px-3 py-2"
                  style={{
                    backgroundColor: `${colors.primary}12`,
                  }}
                >
                  <CheckCheck
                    size={13}
                    color={colors.primary}
                  />

                  <Text
                    className="ml-1 text-[9px] font-bold"
                    style={{
                      color: colors.primary,
                    }}
                  >
                    Read all
                  </Text>
                </Pressable>
              ) : null}
            </View>
          </View>

          {/* =================================================
              SECTION HEADER
          ================================================= */}

          <View className="mb-4 mt-7 flex-row items-center justify-between">
            <View>
              <Text className="text-[17px] font-extrabold text-text">
                Recent
              </Text>

              <Text className="mt-1 text-[11px] text-text-muted">
                Your latest FitPilot updates
              </Text>
            </View>

            {unreadCount > 0 ? (
              <View
                className="rounded-full px-3 py-1.5"
                style={{
                  backgroundColor: `${colors.primary}10`,
                }}
              >
                <Text
                  className="text-[10px] font-bold"
                  style={{
                    color: colors.primary,
                  }}
                >
                  {unreadCount} unread
                </Text>
              </View>
            ) : null}
          </View>
        </>
      ) : null}
    </View>
  );

  const footer =
    status !== "success" || notifications.length === 0 ? null : loadingMore || hasNextPage ? (
      <View className="mt-4 items-center py-4">
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    ) : (
      /* =================================================
          FOOTER
      ================================================= */
      <View className="mt-6 items-center">
        <View
          className="h-8 w-8 items-center justify-center rounded-full"
          style={{
            backgroundColor: `${colors.primary}10`,
          }}
        >
          <Sparkles
            size={14}
            color={colors.primary}
          />
        </View>

        <Text className="mt-2 text-[10px] font-medium text-text-faint">
          You&apos;re all caught up for now
        </Text>
      </View>
    );

  const empty =
    status === "loading" ? (
      <StateMessage>
        <ActivityIndicator size="small" color={colors.primary} />
        <Text className="mt-3 text-[12px] font-medium text-text-muted">
          Loading notifications...
        </Text>
      </StateMessage>
    ) : status === "error" ? (
      <StateMessage>
        <AlertCircle size={22} color={colors.danger} />
        <Text className="mt-3 text-[13px] font-semibold text-text">
          Couldn&apos;t load notifications
        </Text>
        <Pressable
          onPress={retry}
          className="mt-4 rounded-full border border-border px-4 py-2 active:opacity-70"
        >
          <Text className="text-[11px] font-semibold text-text-muted">
            Try Again
          </Text>
        </Pressable>
      </StateMessage>
    ) : (
      <StateMessage>
        <View
          className="h-14 w-14 items-center justify-center rounded-2xl"
          style={{ backgroundColor: `${colors.primary}12` }}
        >
          <BellOff size={22} color={colors.primary} />
        </View>
        <Text className="mt-4 text-[14px] font-bold text-text">
          No notifications yet
        </Text>
        <Text className="mt-1 text-center text-[11px] leading-[17px] text-text-muted">
          Updates from FitPilot will show up here.
        </Text>
      </StateMessage>
    );

  return (
    <View className="flex-1 bg-bg">
      <FlatList
        data={status === "success" ? notifications : []}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <NotificationCard
            notification={item}
            unread={!isRead(item.id)}
            onPress={() => markAsRead(item.id)}
            isLast={index === notifications.length - 1}
          />
        )}
        ListHeaderComponent={header}
        ListFooterComponent={footer}
        ListEmptyComponent={empty}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={refresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressViewOffset={insets.top}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 8,
          paddingBottom: insets.bottom + 30,
          paddingHorizontal: 20,
        }}
      />
    </View>
  );
}

function StateMessage({ children }: { children: React.ReactNode }) {
  return (
    <View className="mt-6 items-center rounded-[24px] border border-border bg-surface px-6 py-10">
      {children}
    </View>
  );
}

/* ============================================================
   NOTIFICATION CARD
============================================================ */

function NotificationCard({
  notification,
  unread,
  onPress,
  isLast,
}: {
  notification: AppNotification;
  unread: boolean;
  onPress: () => void;
  isLast: boolean;
}) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      className={`relative overflow-hidden rounded-[24px] border bg-surface ${
        isLast ? "" : "mb-3"
      } active:opacity-80`}
      style={{
        borderColor: unread
          ? `${colors.primary}28`
          : colors.border,
      }}
    >
      {/* Unread background */}

      {unread ? (
        <LinearGradient
          colors={[
            `${colors.primary}0B`,
            "transparent",
          ]}
          start={{
            x: 0,
            y: 0,
          }}
          end={{
            x: 1,
            y: 0,
          }}
          style={{
            position: "absolute",
            inset: 0,
          }}
        />
      ) : null}

      <View className="flex-row p-4">
        {/* Icon */}

        <View
          className="h-11 w-11 items-center justify-center rounded-2xl"
          style={{
            backgroundColor: unread
              ? `${colors.primary}15`
              : `${colors.primary}09`,
          }}
        >
          <Bell
            size={18}
            color={
              unread
                ? colors.primary
                : colors.textMuted
            }
            strokeWidth={2}
          />
        </View>

        {/* Content */}

        <View className="ml-3 flex-1 pr-2">
          <View className="flex-row items-start">
            <Text
              className="flex-1 text-[13px] font-bold"
              style={{
                color: colors.text,
              }}
              numberOfLines={1}
            >
              {notification.title}
            </Text>

            {unread ? (
              <View
                className="ml-2 mt-1.5 h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: colors.primary,
                }}
              />
            ) : null}
          </View>

          <Text
            className="mt-1 text-[11px] leading-[17px]"
            style={{
              color: colors.textMuted,
            }}
            numberOfLines={2}
          >
            {notification.message}
          </Text>

          <View className="mt-2 flex-row items-center">
            <Clock3
              size={10}
              color={colors.textFaint}
            />

            <Text className="ml-1 text-[9px] font-medium text-text-faint">
              {formatRelativeTime(notification.createdAt)}
            </Text>
          </View>
        </View>

        {/* Arrow */}

        <View className="justify-center">
          <ChevronRight
            size={15}
            color={
              unread
                ? colors.primary
                : colors.textFaint
            }
          />
        </View>
      </View>
    </Pressable>
  );
}
