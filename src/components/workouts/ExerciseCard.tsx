import { ArrowUpRight, Dumbbell } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";

import { useThemeColors } from "@/constants/colors";
import type { Exercise } from "@/lib/exercise-api";
import { toTitleCase } from "@/lib/format";

export default function ExerciseCard({
  exercise,
  onPress,
}: {
  exercise: Exercise;
  onPress?: () => void;
}) {
  const colors = useThemeColors();

  return (
    <Pressable
      onPress={onPress}
      className="overflow-hidden rounded-[14px] border border-border bg-surface p-1 active:opacity-90"
    >
      {/* ICON PANEL */}
      <View
        className="h-[120px] items-center justify-center overflow-hidden rounded-[14px]"
        style={{ backgroundColor: `${colors.primary}12` }}
      >
        <Dumbbell size={32} color={colors.primary} strokeWidth={1.8} />

        {exercise.isNew ? <NewRibbon /> : null}
      </View>

      {/* CONTENT */}
      <View className="flex-row items-center justify-between overflow-hidden px-2 pb-1 pt-3">
        <View>
          <Text
            className="max-w-[120px] text-[14px] font-bold tracking-[-0.3px] text-text"
            numberOfLines={1}
          >
            {toTitleCase(exercise.name)}
          </Text>
          <Text
            className="mt-0.5 max-w-[120px] text-[10px] font-medium uppercase tracking-[1px] text-text-faint"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {toTitleCase(exercise.muscleGroup.replace("-", " "))}
          </Text>
        </View>

        <View
          className="mt-2 h-8 w-8 items-center justify-center self-end rounded-full"
          style={{ backgroundColor: colors.primary }}
        >
          <ArrowUpRight size={15} color={colors.bg} strokeWidth={2.4} />
        </View>
      </View>
    </Pressable>
  );
}

/**
 * Diagonal "NEW" ribbon across the icon panel's top-right corner, for
 * exercises an admin added in the last few days (see is_new in the API).
 * The panel's overflow-hidden clips the band's ends to the corner.
 */
function NewRibbon() {
  const colors = useThemeColors();

  return (
    <View
      pointerEvents="none"
      accessibilityLabel="New exercise"
      className="absolute items-center justify-center"
      style={{
        top: 14,
        right: -30,
        width: 110,
        paddingVertical: 3,
        backgroundColor: colors.primary,
        transform: [{ rotate: "45deg" }],
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 3,
        elevation: 3,
      }}
    >
      <Text
        className="text-[9px] font-extrabold uppercase tracking-[1.5px]"
        style={{ color: colors.bg }}
      >
        New
      </Text>
    </View>
  );
}
