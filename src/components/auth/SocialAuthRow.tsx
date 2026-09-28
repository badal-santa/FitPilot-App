
import { Globe } from "lucide-react-native";
import { ActivityIndicator, Image, Platform, Pressable, Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";

type Props = {
  onGooglePress: () => void;
  googleLoading?: boolean;
  disabled?: boolean;
};

export default function SocialAuthRow({ onGooglePress, googleLoading, disabled }: Props) {
  const colors = useThemeColors();

  return (
    <>
      <View className="mt-6 flex-row items-center gap-3">
        <View className="h-px flex-1 bg-border" />

        <Text className="text-xs font-medium text-text-faint">
          or continue with
        </Text>

        <View className="h-px flex-1 bg-border" />
      </View>

      <View className="mt-4 flex-row gap-3">
        <SocialButton
          icon={
            <Image
              source={require("../../../assets/images/google.png")}
              style={{ width: 20, height: 20 }}
              resizeMode="contain"
            />
          }
          label={googleLoading ? "Connecting..." : "Google"}
          loading={googleLoading}
          disabled={disabled || googleLoading}
          onPress={onGooglePress}
        />

        {/* {Platform.OS === "ios" && (
          <SocialButton
            icon={
              <Text style={{ fontSize: 20, color: colors.text }}>
                {""}
              </Text>
            }
            label="Apple"
          />
        )} */}
      </View>
    </>
  );
}

function SocialButton({
  icon,
  label,
  onPress,
  loading,
  disabled,
}: {
  icon: React.ReactNode;
  label: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
}) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      className="h-12 flex-1 flex-row items-center justify-center gap-2 rounded-2xl border border-border bg-surface active:opacity-70"
      style={{
        borderColor: colors.border,
        backgroundColor: colors.surface,
        opacity: disabled && !loading ? 0.6 : 1,
      }}
    >
      {loading ? <ActivityIndicator size="small" color={colors.primary} /> : icon}

      <Text
        className="text-sm font-semibold"
        style={{ color: colors.text }}
      >
        {label}
      </Text>
    </Pressable>
  );
}