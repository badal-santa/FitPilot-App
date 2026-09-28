import { ChevronRight, type LucideIcon } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";

export function SettingRow({
  icon: Icon,
  label,
  trailingText,
  onPress,
  children,
}: {
  icon: LucideIcon;
  label: string;
  trailingText?: string;
  onPress?: () => void;
  children?: React.ReactNode;
}) {
  const colors = useThemeColors();
  return (
    <Pressable onPress={onPress} className="flex-row items-center px-4 py-3.5">
      <View className="h-9 w-9 items-center justify-center rounded-full bg-primary/15">
        <Icon size={16} color={colors.primary} />
      </View>
      <Text className="ml-3 flex-1 font-medium text-sm text-text">{label}</Text>
      {children ??
        (trailingText ? (
          <View className="flex-row items-center gap-1">
            <Text className="font-regular text-xs text-text-muted">{trailingText}</Text>
            <ChevronRight size={16} color={colors.textFaint} />
          </View>
        ) : (
          <ChevronRight size={16} color={colors.textFaint} />
        ))}
    </Pressable>
  );
}

export function SettingDivider() {
  return <View className="h-px bg-border" style={{ marginLeft: 60 }} />;
}
