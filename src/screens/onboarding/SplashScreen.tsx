import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  ImageBackground,
  Pressable,
  Text,
  View,
} from "react-native";

import Screen from "@/components/common/Screen";
import { getOnboardingRoute } from "@/lib/profile-api";
import type { RootStackParamList } from "@/navigation/types";
import { useAppSelector } from "@/store/hooks";

type Props = NativeStackScreenProps<RootStackParamList, "Welcome">;

// Keeps the splash on screen briefly for signed-in users even when the
// session check is instant, so launch doesn't flash straight past it.
const MIN_VISIBLE_MS = 1200;

const splashBackground = require("../../../assets/images/men.png");

/**
 * First route on every launch (and where sign-out lands). While
 * initializeAuth checks the stored session a spinner sits where the buttons
 * go; a signed-in user is then sent on to Main / onboarding, otherwise the
 * Get Started / Sign In buttons fade in.
 */
export default function SplashScreen({ navigation }: Props) {
  const initialized = useAppSelector((state) => state.auth.initialized);
  const isAuthenticated = useAppSelector(
    (state) => state.auth.status === "authenticated",
  );
  const profile = useAppSelector((state) => state.auth.profile);

  const [minTimeElapsed, setMinTimeElapsed] = useState(false);
  // useState initializer rather than useRef().current — React Compiler's
  // lint rejects reading ref values during render.
  const [contentOpacity] = useState(() => new Animated.Value(0));
  const [contentTranslateY] = useState(() => new Animated.Value(20));
  const [actionsOpacity] = useState(() => new Animated.Value(0));

  const showActions = initialized && !isAuthenticated;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 900,
        useNativeDriver: true,
      }),
      Animated.timing(contentTranslateY, {
        toValue: 0,
        duration: 900,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => setMinTimeElapsed(true), MIN_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [contentOpacity, contentTranslateY]);

  useEffect(() => {
    if (!initialized || !isAuthenticated || !minTimeElapsed) return;
    navigation.reset({
      index: 0,
      routes: [{ name: getOnboardingRoute(profile) ?? "Main" }],
    });
  }, [initialized, isAuthenticated, minTimeElapsed, profile, navigation]);

  useEffect(() => {
    if (!showActions) return;
    Animated.timing(actionsOpacity, {
      toValue: 1,
      duration: 400,
      useNativeDriver: true,
    }).start();
  }, [showActions, actionsOpacity]);

  const handleGetStarted = () => {
    navigation.navigate("Auth");
  };

  const handleSignIn = () => {
    navigation.navigate("Auth");
  };

  return (
    <ImageBackground
      source={splashBackground}
      resizeMode="cover"
      className="flex-1 bg-[#050807]"
    >
      {/* Dark gradient-like overlay */}
      <View className="flex-1 bg-black/25">
        <Screen transparent>
          <Animated.View
            style={{
              opacity: contentOpacity,
              transform: [
                {
                  translateY: contentTranslateY,
                },
              ],
            }}
            className="flex-1 px-6"
          >
            {/* Content */}
            <View className="flex-1 justify-end pb-8">
              {/* Heading */}
              <View className="mb-4">
                <Text className="text-[45px] font-extrabold leading-[48px] text-white">
                  Stronger Healthier
                </Text>
                <View className="flex-row items-baseline">
                  <Text className="text-[45px] font-extrabold leading-[48px] text-[#62F2A2]">
                    Happier
                  </Text>

                  <Text className="ml-2 text-[45px] font-extrabold leading-[48px] text-white">
                    You
                  </Text>
                </View>
              </View>

              {/* Description */}
              <Text className="mb-8 text-[16px] leading-[24px] text-white/80">
                Your AI powered fitness coach{"\n"}
                for a better tomorrow.
              </Text>

              {showActions ? (
                <Animated.View style={{ opacity: actionsOpacity }}>
                  {/* Get Started */}
                  <Pressable
                    onPress={handleGetStarted}
                    className="h-[60px] w-full flex-row items-center justify-center rounded-[20px] bg-[#62F2A2] active:opacity-80"
                  >
                    <Text className="text-[17px] font-bold text-[#06100B]">
                      Get Started
                    </Text>

                    <Text className="ml-3 text-[25px] font-semibold text-[#06100B]">
                      →
                    </Text>
                  </Pressable>
                </Animated.View>
              ) : (
                // Same height as the buttons so the heading doesn't jump
                // when they replace the spinner.
                <View className="h-[100px] items-center justify-center">
                  <ActivityIndicator size="small" color="#62F2A2" />
                </View>
              )}
            </View>
          </Animated.View>
        </Screen>
      </View>
    </ImageBackground>
  );
}
