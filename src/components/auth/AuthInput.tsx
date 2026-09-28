import { Eye, EyeOff, type LucideIcon } from "lucide-react-native";
import { useState } from "react";
import { Pressable, TextInput, View, type TextInputProps } from "react-native";

import { useThemeColors } from "@/constants/colors";

type Props = {
  icon: LucideIcon;
  value: string;
  onChangeText: (text: string) => void;
  secureToggle?: boolean;
} & Omit<TextInputProps, "value" | "onChangeText">;

export default function AuthInput({
  icon: Icon,
  value,
  onChangeText,
  secureToggle,
  secureTextEntry,
  ...inputProps
}: Props) {
  const colors = useThemeColors();
  const [hidden, setHidden] = useState(Boolean(secureTextEntry));

  return (
    <View className="flex-row items-center rounded-2xl border border-border bg-surface px-4">
      <Icon size={17} color={colors.textFaint} />

      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholderTextColor={colors.textFaint}
        secureTextEntry={secureToggle ? hidden : secureTextEntry}
        className="ml-3 flex-1 py-4 font-medium text-sm text-text"
        {...inputProps}
      />

      {secureToggle ? (
        <Pressable onPress={() => setHidden((value) => !value)} hitSlop={8}>
          {hidden ? (
            <EyeOff size={17} color={colors.textFaint} />
          ) : (
            <Eye size={17} color={colors.textFaint} />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}
