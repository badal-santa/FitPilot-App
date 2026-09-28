import "@/global.css";

import {
  PlusJakartaSans_400Regular,
  PlusJakartaSans_500Medium,
  PlusJakartaSans_600SemiBold,
  PlusJakartaSans_700Bold,
  PlusJakartaSans_800ExtraBold,
  useFonts,
} from "@expo-google-fonts/plus-jakarta-sans";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { createNavigationContainerRef, NavigationContainer } from "@react-navigation/native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { useColorScheme } from "nativewind";
import { useEffect, useRef } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import mobileAds from "react-native-google-mobile-ads";
import { enableScreens } from "react-native-screens";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Provider } from "react-redux";

// App update sheet is disabled for now — uncomment this import and
// <AppUpdateSheet /> below to turn it back on.
// import AppUpdateSheet from "@/components/common/AppUpdateSheet";
import { ToastProvider } from "@/components/common/Toast";
import { RootNavigator } from "@/navigation/root-navigator";
import { store } from "@/store";
import { initializeAuth } from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import type { RootStackParamList } from "@/navigation/types";
import { ThemeProvider } from "@/theme/theme-provider";
import { preloadInterstitial } from "@/lib/interstitial";
import { loginToOneSignal } from "@/lib/onesignal";

SplashScreen.preventAutoHideAsync();

const navigationRef = createNavigationContainerRef<RootStackParamList>();
enableScreens();

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}

function AppContent() {
  const [fontsLoaded] = useFonts({
    PlusJakartaSans_400Regular,
    PlusJakartaSans_500Medium,
    PlusJakartaSans_600SemiBold,
    PlusJakartaSans_700Bold,
    PlusJakartaSans_800ExtraBold,
  });

  const dispatch = useAppDispatch();
  const authStatus = useAppSelector((state) => state.auth.status);
  const authUser = useAppSelector((state) => state.auth.user);

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    // Preload the "before workout" interstitial once the SDK is up, so it's
    // ready by the time the user taps Start.
    mobileAds()
      .initialize()
      .then(preloadInterstitial)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (authStatus === "authenticated" && authUser?.id) {
      loginToOneSignal(authUser.id);
    }
  }, [authStatus, authUser?.id]);

  // api-client flips status to "unauthenticated" when a token refresh fails
  // mid-session; send the user back to the welcome screen when that happens.
  const wasAuthenticated = useRef(false);
  useEffect(() => {
    if (authStatus === "authenticated") {
      wasAuthenticated.current = true;
    } else if (authStatus === "unauthenticated" && wasAuthenticated.current) {
      wasAuthenticated.current = false;
      if (navigationRef.isReady()) {
        navigationRef.reset({ index: 0, routes: [{ name: "Welcome" }] });
      }
    }
  }, [authStatus]);

  // Native splash only covers font loading; the session check runs behind
  // the in-app LaunchScreen (the navigator's first route).
  useEffect(() => {
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded]);

  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ThemeProvider>
        <SafeAreaProvider>
          <ToastProvider>
            <BottomSheetModalProvider>
              <StatusBarForScheme />
              <NavigationContainer ref={navigationRef}>
                <RootNavigator />
              </NavigationContainer>
              {/* <AppUpdateSheet /> */}
            </BottomSheetModalProvider>
          </ToastProvider>
        </SafeAreaProvider>
      </ThemeProvider>
    </GestureHandlerRootView>
  );
}

function StatusBarForScheme() {
  const { colorScheme } = useColorScheme();
  return <StatusBar style={colorScheme === "light" ? "dark" : "light"} />;
}
