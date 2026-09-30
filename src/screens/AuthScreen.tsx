
import type { NativeStackScreenProps } from "@react-navigation/native-stack";
import { LinearGradient } from "expo-linear-gradient";
import {
  ChevronLeft,
  Lock,
  Mail,
  Shield,
  User,
  Sparkles,
} from "lucide-react-native";
import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import AuthInput from "@/components/auth/AuthInput";
import SocialAuthRow from "@/components/auth/SocialAuthRow";
import { useThemeColors } from "@/constants/colors";
import { getOnboardingRoute } from "@/lib/profile-api";
import type { RootStackParamList } from "@/navigation/types";
import { store } from "@/store";
import {
  signIn as signInThunk,
  signInWithGoogle,
  signUp as signUpThunk,
} from "@/store/auth-slice";
import { useAppDispatch, useAppSelector } from "@/store/hooks";

type Mode = "signIn" | "signUp";
type Props = NativeStackScreenProps<RootStackParamList, "Auth">;

type FormValues = {
  name: string;
  email: string;
  password: string;
};

export default function AuthScreen({ navigation }: Props) {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const [mode, setMode] = useState<Mode>("signIn");
  const isSignIn = mode === "signIn";

  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);
  const authError = useAppSelector((state) => state.auth.error);

  const {
    control,
    handleSubmit,
    clearErrors,
    trigger,
    formState: { errors, isValid, dirtyFields },
  } = useForm<FormValues>({
    mode: "onChange",
    defaultValues: { name: "", email: "", password: "" },
  });

  const [googleLoading, setGoogleLoading] = useState(false);
  const busy = status === "loading" || googleLoading;

  // Read fresh state directly rather than a `profile` selector — the thunk
  // just populated it and a stale closure would still see the old value.
  const goToNextScreen = () => {
    const target = getOnboardingRoute(store.getState().auth.profile) ?? "Main";
    navigation.reset({
      index: 0,
      routes: [{ name: target }],
    });
  };

  const handleGoogle = async () => {
    if (busy) return;
    setGoogleLoading(true);
    try {
      await dispatch(signInWithGoogle()).unwrap();
      goToNextScreen();
    } catch {
      // Error (if any — cancelling shows none) is displayed from the auth store.
    } finally {
      setGoogleLoading(false);
    }
  };

  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    clearErrors("name");
    trigger("name");
  }, [mode, clearErrors, trigger]);

  const onSubmit = async (values: FormValues) => {
    try {
      if (isSignIn) {
        await dispatch(
          signInThunk({
            email: values.email,
            password: values.password,
          }),
        ).unwrap();
      } else {
        await dispatch(
          signUpThunk({
            name: values.name,
            email: values.email,
            password: values.password,
          }),
        ).unwrap();
      }

      goToNextScreen();
    } catch {
      // Error is displayed from the auth store.
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: colors.bg }}>
      <LinearGradient
        colors={[colors.bg, colors.surface, colors.bg]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Ambient accent */}
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          top: -110,
          right: -100,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: colors.primary,
          opacity: 0.07,
        }}
      />

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          className="flex-1"
          keyboardDismissMode="interactive"
          contentContainerStyle={{
            paddingTop: insets.top + 12,
            paddingBottom: insets.bottom + 28,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View className="px-5">
            {/* Back button */}
            <Pressable
              onPress={() => navigation.goBack()}
              className="h-11 w-11 items-center justify-center rounded-2xl border active:opacity-70"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <ChevronLeft size={21} color={colors.text} />
            </Pressable>

            {/* Brand */}
            <View className="mt-8 items-center">
              <View
                className="h-[76px] w-[76px] items-center justify-center overflow-hidden rounded-[26px]"
                style={{
                  shadowColor: colors.primary,
                  shadowOffset: { width: 0, height: 10 },
                  shadowOpacity: 0.3,
                  shadowRadius: 20,
                  elevation: 8,
                }}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Image source={require("../../assets/images/icon.png")} style={{width: 100, height: 100, resizeMode: "contain"}}/>
              </View>

              <View className="mt-5 flex-row items-center gap-2">
                <Text className="text-[27px] font-extrabold tracking-tight text-text">
                  FitPilot
                </Text>
                <Sparkles size={19} color={colors.primary} />
              </View>

              <Text className="mt-2 text-center text-sm leading-6 text-text-muted">
                {isSignIn
                  ? "Your fitness journey continues here."
                  : "Build your account. Start your transformation."}
              </Text>
            </View>

            {/* Auth card */}
            <View
              className="mt-8 rounded-[28px] border p-5"
              style={{
                backgroundColor: colors.surface,
                borderColor: colors.border,
              }}
            >
              <Text className="text-[22px] font-extrabold text-text text-center">
                {isSignIn ? "Welcome back" : "Create your account"}
              </Text>
              <Text className="mt-1.5 text-sm leading-5 text-text-muted text-center">
                {isSignIn
                  ? "Sign in to pick up where you left off."
                  : "A few details and you're ready to go."}
              </Text>

              {/* Mode switch */}
              <View
                className="mt-6 flex-row rounded-2xl p-1.5"
                style={{ backgroundColor: colors.bg }}
              >
                <ModeTab
                  label="Sign In"
                  active={isSignIn}
                  onPress={() => setMode("signIn")}
                />
                <ModeTab
                  label="Sign Up"
                  active={!isSignIn}
                  onPress={() => setMode("signUp")}
                />
              </View>

              {/* Form fields */}
              <View className="mt-6" style={{ gap: 16 }}>
                {!isSignIn && (
                  <View>
                    <Controller
                      control={control}
                      name="name"
                      rules={{
                        validate: (value) =>
                          isSignIn ||
                          value.trim().length > 0 ||
                          "Name is required",
                      }}
                      render={({ field: { value, onChange } }) => (
                        <AuthInput
                          icon={User}
                          value={value}
                          onChangeText={onChange}
                          placeholder="Full name"
                          autoCapitalize="words"
                          autoComplete="name"
                        />
                      )}
                    />
                    {dirtyFields.name && errors.name && (
                      <FieldError message={errors.name.message} />
                    )}
                  </View>
                )}

                <View>
                  <Controller
                    control={control}
                    name="email"
                    rules={{
                      required: "Email is required",
                      pattern: {
                        value: /^\S+@\S+\.\S+$/,
                        message: "Enter a valid email",
                      },
                    }}
                    render={({ field: { value, onChange } }) => (
                      <AuthInput
                        icon={Mail}
                        value={value}
                        onChangeText={onChange}
                        placeholder="Email address"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                      />
                    )}
                  />
                  {dirtyFields.email && errors.email && (
                    <FieldError message={errors.email.message} />
                  )}
                </View>

                <View>
                  <Controller
                    control={control}
                    name="password"
                    rules={{
                      required: "Password is required",
                      minLength: {
                        value: 6,
                        message: "Use at least 6 characters",
                      },
                    }}
                    render={({ field: { value, onChange } }) => (
                      <AuthInput
                        icon={Lock}
                        value={value}
                        onChangeText={onChange}
                        placeholder="Password"
                        secureTextEntry
                        secureToggle
                        autoCapitalize="none"
                        autoComplete="password"
                      />
                    )}
                  />
                  {dirtyFields.password && errors.password && (
                    <FieldError message={errors.password.message} />
                  )}
                </View>
              </View>

              {isSignIn && (
                <Pressable className="mt-4 self-end">
                  <Text
                    className="text-sm font-semibold"
                    style={{ color: colors.primary }}
                  >
                    Forgot password?
                  </Text>
                </Pressable>
              )}

              {authError ? (
                <Text
                  className="mt-4 text-center text-xs font-semibold"
                  style={{ color: colors.danger }}
                >
                  {authError}
                </Text>
              ) : null}

              {/* Primary CTA */}
              <Pressable
                onPress={handleSubmit(onSubmit)}
                disabled={!isValid || busy}
                className="mt-6 overflow-hidden rounded-2xl active:opacity-85"
                style={{
                  height: 50,
                  opacity: isValid || status === "loading" ? 1 : 0.65,
                  backgroundColor: colors.primary,
                }}
              >
                <LinearGradient
                  colors={[colors.primary, colors.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 8,
                  }}
                >
                  {status === "loading" && (
                    <ActivityIndicator color={colors.bg} size="small" />
                  )}

                  <Text
                    className="text-base font-bold"
                    style={{ color: colors.bg }}
                  >
                    {status === "loading"
                      ? isSignIn
                        ? "Signing in..."
                        : "Creating account..."
                      : isSignIn
                        ? "Sign In"
                        : "Create Account"}
                  </Text>
                </LinearGradient>
              </Pressable>

              {/* Social login */}
              <View className="mt-6">
                <SocialAuthRow
                  onGooglePress={handleGoogle}
                  googleLoading={googleLoading}
                  disabled={status === "loading"}
                />
              </View>
            </View>
            <Text className="mt-5 text-center text-[11px] tracking-wide text-text-muted">
              YOUR GOALS. YOUR PACE. YOUR FITPILOT.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {busy ? (
        <AuthLoadingOverlay
          label={
            googleLoading
              ? "Signing in with Google..."
              : isSignIn
                ? "Signing you in..."
                : "Creating your account..."
          }
        />
      ) : null}
    </View>
  );
}

/**
 * Covers the form while a sign-in / sign-up request (and the profile load
 * that follows) is running, so it's obvious something is happening and the
 * form can't be submitted twice. Stays up until AuthScreen navigates away.
 */
function AuthLoadingOverlay({ label }: { label: string }) {
  const colors = useThemeColors();

  return (
    <View
      style={[StyleSheet.absoluteFill, { backgroundColor: `${colors.bg}CC` }]}
      className="items-center justify-center"
      // Swallow touches so nothing underneath can be pressed.
      onStartShouldSetResponder={() => true}
      accessibilityRole="progressbar"
      accessibilityLabel={label}
    >
      <View
        className="items-center rounded-[24px] border px-8 py-7"
        style={{
          backgroundColor: colors.surface,
          borderColor: colors.border,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 10 },
          shadowOpacity: 0.12,
          shadowRadius: 24,
          elevation: 10,
        }}
      >
        <ActivityIndicator size="large" color={colors.primary} />
        <Text className="mt-4 text-sm font-semibold text-text">{label}</Text>
        <Text className="mt-1 text-xs text-text-muted">This only takes a moment</Text>
      </View>
    </View>
  );
}

function FieldError({ message }: { message?: string }) {
  const colors = useThemeColors();
  if (!message) return null;

  return (
    <Text
      className="ml-1 mt-1.5 text-xs font-medium"
      style={{ color: colors.danger }}
    >
      {message}
    </Text>
  );
}

function ModeTab({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      className="flex-1 items-center justify-center rounded-xl py-3"
      style={{
        backgroundColor: active ? colors.primary : "transparent",
      }}
    >
      <Text
        className={active ? "text-sm font-bold" : "text-sm font-medium"}
        style={{
          color: active ? colors.bg : colors.textMuted,
        }}
      >
        {label}
      </Text>
    </Pressable>
  );
}