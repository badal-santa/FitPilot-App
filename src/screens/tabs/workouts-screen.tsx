import { useNavigation } from "@react-navigation/native";
import {
  AlertCircle,
  ArrowDownAZ,
  ArrowDownZA,
  ArrowRight,
  Dumbbell,
  SearchX,
  Sparkles,
  SlidersHorizontal,
} from "lucide-react-native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  Text,
  View,
  RefreshControl,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";

import AdBanner from "@/components/common/AdBanner";
import Screen from "@/components/common/Screen";
import BodyPartChips from "@/components/workouts/BodyPartChips";
import ExerciseCard from "@/components/workouts/ExerciseCard";
import MyPlanSection from "@/components/workouts/MyPlanSection";
import SearchBar from "@/components/workouts/SearchBar";
import { useThemeColors } from "@/constants/colors";
import { useExercises } from "@/hooks/use-exercises";
import { useRefreshRegistry } from "@/hooks/use-refresh-registry";

export function WorkoutsScreen() {
  const colors = useThemeColors();
  const navigation = useNavigation();

  const [selectedBodyPart, setSelectedBodyPart] =
    useState<string | null>(null);

  const [searchText, setSearchText] = useState("");
  const [debouncedSearch, setDebouncedSearch] =
    useState("");

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(searchText.trim());
    }, 400);

    return () => clearTimeout(timeout);
  }, [searchText]);

  const { exercises, status, retry, refresh: refreshExercises } = useExercises({
    muscleGroup: selectedBodyPart ?? undefined,
    search: debouncedSearch || undefined,
  });

  const hasFilter =
    Boolean(selectedBodyPart) || Boolean(debouncedSearch);

  // Alphabetical by name. localeCompare with sensitivity "base" ignores case
  // and accents (the API's ORDER BY name is case-sensitive, so "abs" would
  // land after "Zottman"); numeric orders "Day 2" before "Day 10".
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const sortedExercises = useMemo(() => {
    const sorted = [...exercises].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: "base", numeric: true }),
    );
    return sortOrder === "asc" ? sorted : sorted.reverse();
  }, [exercises, sortOrder]);

  // Pull-to-refresh: the exercise list (loaded here, outside the provider)
  // plus every registered section below it (My Plan).
  const { refreshAll, RefreshRegistryProvider } = useRefreshRegistry();
  const [refreshing, setRefreshing] = useState(false);
  const handleRefresh = async () => {
    setRefreshing(true);
    await Promise.allSettled([refreshExercises(), refreshAll({ silent: true })]);
    setRefreshing(false);
  };

  return (
    <Screen
      scroll
      className="px-4"
      contentContainerStyle={{
        paddingBottom: 150,
      }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={handleRefresh}
          tintColor={colors.primary}
          colors={[colors.primary]}
          progressBackgroundColor={colors.surface}
        />
      }
    >
      <RefreshRegistryProvider>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <View className="relative overflow-hidden pt-2">
        {/* Ambient glow */}

        <View
          pointerEvents="none"
          className="absolute -right-12 -top-16 h-36 w-36 rounded-full"
          style={{
            backgroundColor: `${colors.primary}08`,
          }}
        />

        <View className="flex-row items-start justify-between">
          <View className="flex-1">
            <View className="flex-row items-center">
              <View
                className="mr-2 h-2 w-2 rounded-full"
                style={{
                  backgroundColor: colors.primary,
                }}
              />

              <Text
                className="text-[10px] font-bold uppercase tracking-[2px]"
                style={{
                  color: colors.primary,
                }}
              >
                Train smarter
              </Text>
            </View>

            <Text className="mt-2 text-[30px] font-extrabold tracking-[-0.8px] text-text">
              Workouts
            </Text>

            <Text className="max-w-[310px] text-[12px] leading-[20px] text-text-muted">
              Explore exercises and build a workout
              that fits your goals.
            </Text>
          </View>

          {/* Exercise count */}

          <View
            className="ml-3 items-center rounded-[18px] border px-3 py-2.5"
            style={{
              backgroundColor: `${colors.primary}08`,
              borderColor: `${colors.primary}18`,
            }}
          >
            <View className="flex-row items-center gap-2">
              <Dumbbell
                size={12}
                color={colors.primary}
              />

              <Text className="mt-1 text-[16px] font-extrabold text-text">
                {exercises.length}
              </Text>
            </View>

            <Text className="text-[8px] font-medium uppercase tracking-[0.5px] text-text-muted">
              Exercises
            </Text>
          </View>
        </View>
      </View>

      {/* =====================================================
          MY PLAN
      ===================================================== */}

      <MyPlanSection />

      {/* =====================================================
          SEARCH
      ===================================================== */}

      <View className="mt-5">
        <View className="flex-row items-center">
          <View className="flex-1">
            <SearchBar
              value={searchText}
              onChangeText={setSearchText}
            />
          </View>
        </View>
      </View>

      {/* =====================================================
          BODY PART FILTER
      ===================================================== */}

      <View className="mt-5">
        <View className="mb-3 flex-row items-center justify-between">
          <Text className="text-[14px] font-bold text-text">
            Explore by muscle
          </Text>

          {selectedBodyPart ? (
            <Pressable
              onPress={() => {
                setSelectedBodyPart(null);
                setSearchText("");
              }}
            >
              <Text
                className="text-[11px] font-semibold"
                style={{
                  color: colors.primary,
                }}
              >
                Clear
              </Text>
            </Pressable>
          ) : null}
        </View>

        <BodyPartChips
          selected={
            debouncedSearch
              ? null
              : selectedBodyPart
          }
          onSelect={(part) => {
            setSearchText("");
            setSelectedBodyPart(part);
          }}
        />
      </View>

      {/* =====================================================
          RESULTS HEADER
      ===================================================== */}

      <View className="mt-6 flex-row items-end justify-between">
        <View>
          <Text className="text-[18px] font-extrabold text-text">
            {debouncedSearch
              ? "Search results"
              : selectedBodyPart
                ? `${selectedBodyPart} exercises`
                : "All exercises"}
          </Text>

          <Text className="mt-1 text-[11px] text-text-muted">
            {status === "loading"
              ? "Finding exercises..."
              : exercises.length > 0
                ? `${exercises.length} exercises available`
                : "No matching exercises"}
          </Text>
        </View>

        {exercises.length > 0 ? (
          <View className="flex-row items-center gap-2">
            <View
              className="rounded-full px-3 py-1.5"
              style={{
                backgroundColor: `${colors.primary}10`,
              }}
            >
              <Text
                className="text-[10px] font-bold"
                style={{
                  color: colors.primary,
                }}
              >
                {exercises.length} results
              </Text>
            </View>

            {/* Sort toggle: A–Z ⇄ Z–A */}
            <Pressable
              onPress={() => setSortOrder((order) => (order === "asc" ? "desc" : "asc"))}
              accessibilityRole="button"
              accessibilityLabel={
                sortOrder === "asc" ? "Sorted A to Z. Tap for Z to A" : "Sorted Z to A. Tap for A to Z"
              }
              hitSlop={6}
              className="flex-row items-center gap-1 rounded-full border border-border bg-surface px-2.5 py-1.5 active:opacity-70"
            >
              {sortOrder === "asc" ? (
                <ArrowDownAZ size={13} color={colors.primary} />
              ) : (
                <ArrowDownZA size={13} color={colors.primary} />
              )}
              <Text className="text-[10px] font-bold" style={{ color: colors.primary }}>
                {sortOrder === "asc" ? "A–Z" : "Z–A"}
              </Text>
            </Pressable>
          </View>
        ) : null}
      </View>

      {/* =====================================================
          EXERCISE GRID
      ===================================================== */}

      {exercises.length > 0 ? (
        <View className="mt-4 flex-row flex-wrap justify-between">
          {sortedExercises.map((exercise) => (
            <View
              key={exercise.id}
              className="mb-1"
              style={{
                width: "49.5%",
              }}
            >
              <ExerciseCard
                exercise={exercise}
                onPress={() =>
                  navigation.navigate(
                    "ExerciseDetail",
                    {
                      exerciseId: exercise.id,
                    }
                  )
                }
              />
            </View>
          ))}

          <AdBanner />
        </View>
      ) : status === "loading" ? (
        <LoadingState />
      ) : status === "error" ? (
        <ErrorState retry={retry} />
      ) : (
        <EmptyState />
      )}
      </RefreshRegistryProvider>
    </Screen>
  );
}

/* ============================================================
   LOADING STATE
============================================================ */

function LoadingState() {
  const colors = useThemeColors();

  return (
    <View className="mt-12 items-center rounded-[28px] border border-border bg-surface px-6 py-10">
      <View
        className="h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: `${colors.primary}10`,
        }}
      >
        <ActivityIndicator
          size="small"
          color={colors.primary}
        />
      </View>

      <Text className="mt-4 text-[15px] font-bold text-text">
        Finding exercises
      </Text>

      <Text className="mt-1 text-center text-[12px] leading-[18px] text-text-muted">
        Searching your exercise library...
      </Text>
    </View>
  );
}

/* ============================================================
   ERROR STATE
============================================================ */

function ErrorState({
  retry,
}: {
  retry: () => void;
}) {
  const colors = useThemeColors();

  return (
    <View className="mt-12 items-center rounded-[28px] border border-border bg-surface px-6 py-10">
      <View
        className="h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: `${colors.danger}12`,
        }}
      >
        <AlertCircle
          size={25}
          color={colors.danger}
        />
      </View>

      <Text className="mt-4 text-[15px] font-bold text-text">
        Couldn&apos;t load exercises
      </Text>

      <Text className="mt-1 text-center text-[12px] leading-[18px] text-text-muted">
        Something went wrong while loading the exercise
        library.
      </Text>

      <Pressable
        onPress={retry}
        className="mt-5 rounded-full px-6 py-3 active:opacity-80"
        style={{
          backgroundColor: colors.primary,
        }}
      >
        <Text
          className="text-[12px] font-bold"
          style={{
            color: colors.bg,
          }}
        >
          Try Again
        </Text>
      </Pressable>
    </View>
  );
}

/* ============================================================
   EMPTY STATE
============================================================ */

function EmptyState() {
  const colors = useThemeColors();

  return (
    <View className="mt-12 items-center rounded-[28px] border border-border bg-surface px-6 py-10">
      <View
        className="h-14 w-14 items-center justify-center rounded-full"
        style={{
          backgroundColor: `${colors.primary}10`,
        }}
      >
        <SearchX
          size={25}
          color={colors.primary}
        />
      </View>

      <Text className="mt-4 text-[15px] font-bold text-text">
        No exercises found
      </Text>

      <Text className="mt-1 max-w-[260px] text-center text-[12px] leading-[18px] text-text-muted">
        Try another search or choose a different muscle
        group.
      </Text>
    </View>
  );
}