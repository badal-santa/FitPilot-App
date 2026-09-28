import { Search, X } from "lucide-react-native";
import { Pressable, TextInput, View } from "react-native";

import { useThemeColors } from "@/constants/colors";

export default function SearchBar({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (text: string) => void;
}) {
  const colors = useThemeColors();

  return (
    <View className="flex-row items-center gap-2 rounded-2xl border border-border bg-surface px-4">
      <Search size={17} color={colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search exercises..."
        placeholderTextColor={colors.textFaint}
        className="flex-1 py-3.5 font-regular text-sm text-text"
      />
      {value.length > 0 ? (
        <Pressable onPress={() => onChangeText("")} hitSlop={8}>
          <X size={16} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </View>
  );
}
