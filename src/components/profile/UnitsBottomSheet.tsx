import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { Check } from "lucide-react-native";
import { forwardRef, useCallback } from "react";
import { Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useThemeColors } from "@/constants/colors";
import { type Units, UNITS_LABEL } from "@/store/onboarding-slice";

const OPTIONS: { id: Units; description: string }[] = [
  { id: "metric", description: "Weight in kilograms, height in centimeters" },
  { id: "imperial", description: "Weight in pounds, height in feet & inches" },
];

const UnitsBottomSheet = forwardRef<
  BottomSheetModal,
  { selected: Units; onSelect: (units: Units) => void }
>(({ selected, onSelect }, ref) => {
  const colors = useThemeColors();
  const insets = useSafeAreaInsets();

  const renderBackdrop = useCallback(
    (props: BottomSheetBackdropProps) => (
      <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
    ),
    [],
  );

  return (
    <BottomSheetModal
      ref={ref}
      enableDynamicSizing
      backdropComponent={renderBackdrop}
      backgroundStyle={{ backgroundColor: colors.surface }}
      handleIndicatorStyle={{ backgroundColor: colors.border }}
    >
      <BottomSheetView
        style={{ paddingHorizontal: 24, paddingBottom: 24 + insets.bottom, paddingTop: 4 }}
      >
        <Text className="mb-4 font-bold text-lg text-text">Units</Text>

        {OPTIONS.map((option) => {
          const isSelected = selected === option.id;
          return (
            <Pressable
              key={option.id}
              onPress={() => onSelect(option.id)}
              className="mb-3 flex-row items-center rounded-2xl border p-4"
              style={{
                borderColor: isSelected ? colors.primary : colors.border,
                backgroundColor: isSelected ? colors.surfaceAlt : "transparent",
              }}
            >
              <View className="flex-1">
                <Text className="font-semibold text-sm text-text">{UNITS_LABEL[option.id]}</Text>
                <Text className="mt-0.5 font-regular text-xs text-text-muted">
                  {option.description}
                </Text>
              </View>
              {isSelected ? <Check size={18} color={colors.primary} /> : null}
            </Pressable>
          );
        })}
      </BottomSheetView>
    </BottomSheetModal>
  );
});

UnitsBottomSheet.displayName = "UnitsBottomSheet";

export default UnitsBottomSheet;
