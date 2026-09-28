import {
  Bike,
  Dumbbell,
  Flame,
  Footprints,
  Hand,
  HeartPulse,
  LayoutGrid,
  Layers,
  type LucideIcon,
  PersonStanding,
  Shirt,
  Target,
  User,
} from "lucide-react-native";
import { Pressable, ScrollView, Text } from "react-native";

import { useThemeColors } from "@/constants/colors";
import { toTitleCase } from "@/lib/format";

const MUSCLE_GROUPS: { label: string; icon: LucideIcon }[] = [
  { label: "back", icon: Layers },
  { label: "biceps", icon: Dumbbell },
  { label: "cardio", icon: HeartPulse },
  { label: "chest", icon: Shirt },
  { label: "core", icon: Target },
  { label: "full-body", icon: User },
  { label: "glutes", icon: Flame },
  { label: "hamstrings", icon: Footprints },
  { label: "legs", icon: Bike },
  { label: "quadriceps", icon: PersonStanding },
  { label: "shoulders", icon: Hand },
  { label: "triceps", icon: Dumbbell },
];

export default function BodyPartChips({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (muscleGroup: string | null) => void;
}) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={{ gap: 10, paddingRight: 8 }}
    >
      <Chip label="All" icon={LayoutGrid} active={selected === null} onPress={() => onSelect(null)} />
      {MUSCLE_GROUPS.map((group) => (
        <Chip
          key={group.label}
          label={toTitleCase(group.label.replace("-", " "))}
          icon={group.icon}
          active={selected === group.label}
          onPress={() => onSelect(group.label)}
        />
      ))}
    </ScrollView>
  );
}

function Chip({
  label,
  icon: Icon,
  active,
  onPress,
}: {
  label: string;
  icon: LucideIcon;
  active: boolean;
  onPress: () => void;
}) {
  const colors = useThemeColors();
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-1.5 rounded-full border px-4 py-2.5"
      style={{
        borderColor: active ? colors.primary : colors.border,
        backgroundColor: active ? colors.primary : colors.surface,
      }}
    >
      <Icon size={14} color={active ? colors.bg : colors.textMuted} />
      <Text
        className="font-semibold text-xs"
        style={{ color: active ? colors.bg : colors.textMuted }}
      >
        {label}
      </Text>
    </Pressable>
  );
}
