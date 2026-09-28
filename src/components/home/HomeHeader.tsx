import { LinearGradient } from "expo-linear-gradient";
import {
  Bell,
  Flame,
} from "lucide-react-native";
import {
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { useThemeColors } from "@/constants/colors";
import { useHasUnreadNotifications } from "@/hooks/use-notifications";
import { useWorkoutStats } from "@/hooks/use-workout-stats";
import { useAppSelector } from "@/store/hooks";
import { useNavigation } from "@react-navigation/native";

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) return "Good Morning";
  if (hour < 18) return "Good Afternoon";

  return "Good Evening";
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export default function HomeHeader() {
  const colors = useThemeColors();
  const navigation = useNavigation<any>();
  const authUser = useAppSelector((state) => state.auth.user);
  const displayName = authUser?.name?.trim() || authUser?.email?.split("@")[0] || "there";
  const hasUnreadNotifications = useHasUnreadNotifications();
  const { stats } = useWorkoutStats();
  const streak = stats?.currentStreak ?? 0;

  return (
    <View className="relative pt-2">
      {/* =====================================================
          AMBIENT GLOW
      ===================================================== */}

      <View
        pointerEvents="none"
        className="absolute -right-16 -top-20 h-44 w-44 rounded-full"
        style={{
          backgroundColor: `${colors.primary}07`,
        }}
      />

      <View className="flex-row items-center justify-between">
        {/* =================================================
            PROFILE
        ================================================= */}

        <View className="flex-row items-center">
          <View
            className="h-[42px] w-[42px] items-center justify-center overflow-hidden rounded-full border border-primary/30"
          >
            <LinearGradient
              colors={[
                colors.primary,
                colors.primaryDark,
              ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={StyleSheet.absoluteFill}
            />

            <Text className="text-[17px] font-extrabold text-bg">
              {getInitials(displayName)}
            </Text>
          </View>

          <View className="ml-3">
            <Text className="text-[11px] font-medium uppercase tracking-[1.2px] text-text-muted">
              {getGreeting()}
            </Text>

            <Text className="mt-0.5 text-[21px] font-extrabold tracking-[-0.4px] text-text">
              {displayName}
            </Text>
          </View>
        </View>

        {/* =================================================
            RIGHT ACTIONS
        ================================================= */}

        <View className="flex-row items-center gap-2">
          {/* Streak */}

          <View
            className="flex-row items-center overflow-hidden rounded-full"
            style={{
              shadowColor: colors.primary,
              shadowOffset: {
                width: 0,
                height: 4,
              },
              shadowOpacity: 0.18,
              shadowRadius: 9,
              elevation: 4,
            }}
          >
            <LinearGradient
              colors={[
                "#A7FFD0",
                colors.primaryDark,
              ]}
              start={{
                x: 0,
                y: 0,
              }}
              end={{
                x: 1,
                y: 1,
              }}
              style={{
                flexDirection: "row",
                alignItems: "center",
                paddingHorizontal: 11,
                paddingVertical: 8,
              }}
            >
              <Flame
                size={15}
                color="#06100B"
                fill="#06100B"
              />

              <Text className="ml-1.5 text-[13px] font-extrabold text-[#06100B]">
                {streak}
              </Text>
            </LinearGradient>
          </View>

          {/* Notification */}

          <Pressable onPress={() => {
            navigation.navigate("Notifications");
          }} className="h-10 w-10 items-center justify-center rounded-full border border-border bg-surface active:opacity-70">
            <Bell
              size={17}
              color={colors.text}
              strokeWidth={1.8}
            />

            {/* Notification dot — only while something is unread */}

            {hasUnreadNotifications ? (
              <View
                className="absolute right-[9px] top-[8px] h-1.5 w-1.5 rounded-full"
                style={{
                  backgroundColor: colors.primary,
                }}
              />
            ) : null}
          </Pressable>
        </View>
      </View>

      {/* =====================================================
          SUBTITLE
      ===================================================== */}

      <View className="mt-3">
        <Text className="text-[13px] leading-[19px] text-text-muted">
          Let&apos;s make today count.
          {" "}
          <Text
            className="font-semibold"
            style={{
              color: colors.primary,
            }}
          >
            One workout at a time.
          </Text>
        </Text>
      </View>
    </View>
  );
}