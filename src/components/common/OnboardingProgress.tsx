import { Text, View } from "react-native";

const TOTAL_STEPS = 4;

export default function OnboardingProgress({ step }: { step: number }) {
  return (
    <View className="pt-2">
      <View className="flex-row gap-2">
        {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
          <View
            key={i}
            className={`h-1 flex-1 rounded-full ${i < step ? "bg-primary" : "bg-surface-alt"}`}
          />
        ))}
      </View>
      <Text className="mt-3 font-medium text-xs text-text-faint">
        Step {step} of {TOTAL_STEPS}
      </Text>
    </View>
  );
}
