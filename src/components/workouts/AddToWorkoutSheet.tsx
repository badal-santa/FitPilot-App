import {
  BottomSheetBackdrop,
  type BottomSheetBackdropProps,
  BottomSheetModal,
  BottomSheetView,
} from "@gorhom/bottom-sheet";
import { AlertCircle, Moon } from "lucide-react-native";
import { forwardRef, useCallback, useState } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useToast } from "@/components/common/Toast";
import { useThemeColors } from "@/constants/colors";
import { useWorkoutPlan } from "@/hooks/use-workout-plan";
import { addExerciseToDay } from "@/lib/workout-api";
import { useAppSelector } from "@/store/hooks";

type Props = {
  exerciseId: string;
  exerciseName: string;
};

const AddToWorkoutSheet = forwardRef<BottomSheetModal, Props>(
  ({ exerciseId, exerciseName }, ref) => {
    const colors = useThemeColors();
    const insets = useSafeAreaInsets();
    const toast = useToast();
    const isAuthenticated = useAppSelector((state) => state.auth.status === "authenticated");
    const { plan, status } = useWorkoutPlan();
    const [addingDayId, setAddingDayId] = useState<string | null>(null);

    const renderBackdrop = useCallback(
      (props: BottomSheetBackdropProps) => (
        <BottomSheetBackdrop {...props} appearsOnIndex={0} disappearsOnIndex={-1} opacity={0.4} />
      ),
      [],
    );

    const handleSelectDay = async (dayId: string, dayName: string) => {
      if (!isAuthenticated || !plan || addingDayId) return;
      setAddingDayId(dayId);
      try {
        await addExerciseToDay(plan.id, dayId, { exerciseId });
        toast.success("Added", `${exerciseName} was added to ${dayName}.`);
      } catch (error) {
        toast.error(
          "Couldn't add exercise",
          error instanceof Error ? error.message : "Something went wrong",
        );
      } finally {
        setAddingDayId(null);
      }
    };

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
          <Text className="mb-1 font-bold text-lg text-text">Add to Workout</Text>
          <Text className="mb-4 font-regular text-xs text-text-muted">
            Choose a day in your plan for {exerciseName}.
          </Text>

          {status === "loading" ? (
            <View className="items-center py-6">
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          ) : status === "error" || !plan ? (
            <View className="items-center py-6">
              <AlertCircle size={20} color={colors.danger} />
              <Text className="mt-2 font-regular text-sm text-text-muted">
                Couldn&apos;t load your plan.
              </Text>
            </View>
          ) : (
            plan.days.map((day) => {
              const isAdding = addingDayId === day.id;
              return (
                <Pressable
                  key={day.id}
                  onPress={() => handleSelectDay(day.id, day.title || day.dayName)}
                  disabled={day.restDay || Boolean(addingDayId)}
                  className="mb-3 flex-row items-center justify-between rounded-2xl border p-4"
                  style={{
                    borderColor: colors.border,
                    opacity: day.restDay ? 0.5 : 1,
                  }}
                >
                  <View className="flex-1 flex-row items-center gap-3">
                    {day.restDay ? <Moon size={16} color={colors.textMuted} /> : null}
                    <View className="flex-1">
                      <Text className="font-semibold text-sm text-text">{day.dayName}</Text>
                      <Text className="mt-0.5 font-regular text-xs text-text-muted">
                        {day.restDay
                          ? "Rest day"
                          : (day.title ?? `${day.exercises.length} exercises`)}
                      </Text>
                    </View>
                  </View>
                  {isAdding ? <ActivityIndicator size="small" color={colors.primary} /> : null}
                </Pressable>
              );
            })
          )}
        </BottomSheetView>
      </BottomSheetModal>
    );
  },
);

AddToWorkoutSheet.displayName = "AddToWorkoutSheet";

export default AddToWorkoutSheet;
