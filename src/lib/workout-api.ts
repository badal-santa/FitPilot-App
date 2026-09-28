import { ApiError, apiRequest } from "@/lib/api-client";

export type Goal = "lose-weight" | "build-muscle" | "stay-fit";

export type WorkoutPlan = {
  id: string;
  name: string;
  description: string | null;
  goal: Goal;
  daysPerWeek: number;
  durationWeeks: number | null;
  status: string;
};

export type PlanExercise = {
  id: string;
  exerciseOrder: number;
  sets: number | null;
  reps: number | null;
  durationSeconds: number | null;
  restSeconds: number | null;
  targetWeightKg: number | null;
  notes: string | null;
  exerciseId: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  muscleGroup: string;
  equipment: string | null;
  difficulty: string;
  instructions: string | null;
  imageUrl: string | null;
  videoUrl: string | null;
};

export type WorkoutStatus = "not_started" | "started" | "completed";

export type SessionSummary = {
  id: string;
  startedAt: string;
  completedAt: string | null;
  status: "started" | "completed";
  durationSeconds: number | null;
  caloriesBurned: number | null;
  notes: string | null;
};

export type TodayWorkout = {
  plan: WorkoutPlan;
  isRestDay: boolean;
  day: {
    id: string;
    dayNumber: number;
    dayName: string;
    title: string | null;
    description: string | null;
  } | null;
  session: SessionSummary | null;
  workoutStatus: WorkoutStatus;
  exercises: PlanExercise[];
};

export type PlanDay = {
  id: string;
  dayNumber: number;
  dayName: string;
  title: string | null;
  description: string | null;
  restDay: boolean;
  exercises: PlanExercise[];
};

export type WorkoutPlanDetail = WorkoutPlan & { days: PlanDay[] };

// Raw shapes returned by the API (snake_case, see /openapi.json).
type RawWorkoutPlan = {
  id: string;
  name: string;
  description: string | null;
  goal: Goal;
  days_per_week: number;
  duration_weeks: number | null;
  status: string;
};

type RawPlanExercise = {
  id: string;
  exercise_order: number;
  sets: number | null;
  reps: number | null;
  duration_seconds: number | null;
  rest_seconds: number | null;
  target_weight_kg: number | null;
  notes: string | null;
  exercise_id: string;
  name: string;
  slug: string;
  description: string | null;
  category: string;
  muscle_group: string;
  equipment: string | null;
  difficulty: string;
  instructions: string | null;
  image_url: string | null;
  video_url: string | null;
};

type RawTodayWorkout = {
  plan: RawWorkoutPlan;
  isRestDay: boolean;
  day: {
    id: string;
    dayNumber: number;
    dayName: string;
    title: string | null;
    description: string | null;
  } | null;
  // Both already camelCase from the API (unlike plan/exercises above).
  session: SessionSummary | null;
  workoutStatus: WorkoutStatus;
  exercises: RawPlanExercise[];
};

type RawPlanDay = {
  id: string;
  day_number: number;
  day_name: string;
  title: string | null;
  description: string | null;
  rest_day: boolean;
  exercises: RawPlanExercise[];
};

function normalizePlan(raw: RawWorkoutPlan): WorkoutPlan {
  return {
    id: raw.id,
    name: raw.name,
    description: raw.description,
    goal: raw.goal,
    daysPerWeek: raw.days_per_week,
    durationWeeks: raw.duration_weeks,
    status: raw.status,
  };
}

function normalizeExercise(raw: RawPlanExercise): PlanExercise {
  return {
    id: raw.id,
    exerciseOrder: raw.exercise_order,
    sets: raw.sets,
    reps: raw.reps,
    durationSeconds: raw.duration_seconds,
    restSeconds: raw.rest_seconds,
    targetWeightKg: raw.target_weight_kg,
    notes: raw.notes,
    exerciseId: raw.exercise_id,
    name: raw.name,
    slug: raw.slug,
    description: raw.description,
    category: raw.category,
    muscleGroup: raw.muscle_group,
    equipment: raw.equipment,
    difficulty: raw.difficulty,
    instructions: raw.instructions,
    imageUrl: raw.image_url,
    videoUrl: raw.video_url,
  };
}

function normalizeDay(raw: RawPlanDay): PlanDay {
  return {
    id: raw.id,
    dayNumber: raw.day_number,
    dayName: raw.day_name,
    title: raw.title,
    description: raw.description,
    restDay: raw.rest_day,
    exercises: (raw.exercises ?? []).map(normalizeExercise),
  };
}

/**
 * Today's workout from the user's active plan. Returns null when there's no
 * active plan yet (404) — call generateWorkoutPlan() and retry in that case.
 */
export async function getTodayWorkout(): Promise<TodayWorkout | null> {
  try {
    const json = await apiRequest<{ success: true; data: RawTodayWorkout }>("/workouts/today");
    return {
      plan: normalizePlan(json.data.plan),
      isRestDay: json.data.isRestDay,
      day: json.data.day,
      session: json.data.session,
      workoutStatus: json.data.workoutStatus,
      exercises: (json.data.exercises ?? []).map(normalizeExercise),
    };
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

/**
 * Builds a plan from the profile's goal/workout_days. If an active plan
 * already exists, the API just returns it — safe to call unconditionally.
 */
export async function generateWorkoutPlan(): Promise<void> {
  await apiRequest("/workouts/generate", { method: "POST" });
}

/**
 * Marks the active plan completed and generates a fresh one from the
 * current profile.
 */
export async function regenerateWorkoutPlan(): Promise<WorkoutPlanDetail> {
  const json = await apiRequest<{ success: true; data: RawWorkoutPlan & { days: RawPlanDay[] } }>(
    "/workouts/regenerate",
    { method: "POST" },
  );
  return {
    ...normalizePlan(json.data),
    days: (json.data.days ?? []).map(normalizeDay),
  };
}

/**
 * All of the user's plans, newest first, without days/exercises.
 */
export async function getWorkoutPlans(): Promise<WorkoutPlan[]> {
  const json = await apiRequest<{ success: true; data: RawWorkoutPlan[] }>("/workouts");
  return json.data.map(normalizePlan);
}

/**
 * A single plan with all of its days and each day's prescribed exercises.
 */
export async function getWorkoutPlanDetail(
  planId: string,
): Promise<WorkoutPlanDetail> {
  const json = await apiRequest<{ success: true; data: RawWorkoutPlan & { days: RawPlanDay[] } }>(`/workouts/${planId}`);
  return {
    ...normalizePlan(json.data),
    days: (json.data.days ?? []).map(normalizeDay),
  };
}

/**
 * Starts (or resumes, if one's already in progress) a session for a plan
 * day. Pass the id from TodayWorkout.day.
 */
export async function startWorkoutSession(
  workoutPlanDayId: string,
): Promise<{ id: string; resumed: boolean; startedAt: string }> {
  const json = await apiRequest<{
    success: true;
    data: { id: string; resumed: boolean; startedAt: string };
  }>("/workouts/sessions", {
    method: "POST",
    body: { workoutPlanDayId },
  });
  return { id: json.data.id, resumed: json.data.resumed, startedAt: json.data.startedAt };
}

/**
 * Registers an exercise on an in-progress session so sets can be recorded
 * against it, returning its sessionExerciseId. If the session was resumed
 * and this exercise is already on it, the 409 body carries the existing id
 * — treated the same as success rather than surfaced as an error.
 */
export async function addSessionExercise(
  sessionId: string,
  exerciseId: string,
  exerciseOrder: number,
): Promise<string> {
  try {
    const json = await apiRequest<{ success: true; data: { id: string } }>(
      `/workouts/sessions/${sessionId}/exercises`,
      { method: "POST", body: { exerciseId, exerciseOrder } },
    );
    return json.data.id;
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) {
      const existingId = (error.body?.data as { id?: string } | undefined)?.id;
      if (existingId) return existingId;
    }
    throw error;
  }
}

export type RecordSetPayload = {
  sessionExerciseId: string;
  setNumber: number;
  reps?: number | null;
  weightKg?: number | null;
  durationSeconds?: number | null;
  distanceMeters?: number | null;
  completed?: boolean;
};

/**
 * Records a completed set. A 409 (set number already recorded — can happen
 * on a resumed session) is treated as success since the data already exists.
 */
export async function recordSet(
  sessionId: string,
  payload: RecordSetPayload,
): Promise<void> {
  try {
    await apiRequest(`/workouts/sessions/${sessionId}/sets`, {
      method: "POST",
      body: payload,
    });
  } catch (error) {
    if (error instanceof ApiError && error.status === 409) return;
    throw error;
  }
}


export type WorkoutReward = {
  type: "workout_completed" | "streak_milestone";
  xp: number;
  streak?: number;
};

export type WorkoutCompletionResult = {
  currentStreak: number;
  rewards: WorkoutReward[];
  totalXpEarned: number;
};

export async function completeWorkoutSession(
  sessionId: string,
  payload?: { caloriesBurned?: number; notes?: string },
): Promise<WorkoutCompletionResult> {
  const json = await apiRequest<{
    success: true;
    data: WorkoutCompletionResult;
  }>(`/workouts/sessions/${sessionId}/complete`, {
    method: "POST",
    body: payload ?? {},
  });

  return json.data;
}

export type WorkoutSet = {
  id: string;
  setNumber: number;
  reps: number | null;
  weightKg: number | null;
  durationSeconds: number | null;
  distanceMeters: number | null;
  completed: boolean;
  createdAt: string;
};

export type SessionExercise = {
  id: string;
  exerciseId: string;
  exerciseOrder: number;
  name: string;
  sets: WorkoutSet[];
};

export type SessionDetail = {
  id: string;
  workoutPlanDayId: string | null;
  startedAt: string;
  completedAt: string | null;
  status: "started" | "completed";
  durationSeconds: number | null;
  caloriesBurned: number | null;
  notes: string | null;
  exercises: SessionExercise[];
};

// The response mixes already-camelCase top-level/nested fields with
// snake_case exercise fields — matches the API's actual (inconsistent) shape.
type RawSessionExercise = {
  id: string;
  exercise_id: string;
  exercise_order: number;
  name: string;
  sets: WorkoutSet[];
};

type RawSessionDetail = {
  id: string;
  workoutPlanDayId: string | null;
  startedAt: string;
  completedAt: string | null;
  status: "started" | "completed";
  durationSeconds: number | null;
  caloriesBurned: number | null;
  notes: string | null;
  exercises: RawSessionExercise[];
};

/**
 * A session's exercises and every set recorded so far — used to figure out
 * exactly where to resume a session that was started earlier and exited.
 */
export async function getWorkoutSessionDetail(
  sessionId: string,
): Promise<SessionDetail> {
  const json = await apiRequest<{ success: true; data: RawSessionDetail }>(`/workouts/sessions/${sessionId}`);
  return {
    id: json.data.id,
    workoutPlanDayId: json.data.workoutPlanDayId,
    startedAt: json.data.startedAt,
    completedAt: json.data.completedAt,
    status: json.data.status,
    durationSeconds: json.data.durationSeconds,
    caloriesBurned: json.data.caloriesBurned,
    notes: json.data.notes,
    exercises: (json.data.exercises ?? []).map((ex) => ({
      id: ex.id,
      exerciseId: ex.exercise_id,
      exerciseOrder: ex.exercise_order,
      name: ex.name,
      sets: ex.sets,
    })),
  };
}

export type AddExerciseToDayPayload = {
  exerciseId: string;
  sets?: number;
  reps?: number;
  durationSeconds?: number;
  restSeconds?: number;
  targetWeightKg?: number;
  notes?: string;
};

/**
 * Appends an exercise from the library to the end of a plan day (the plan
 * must be the user's own active one). A 409 (exercise already on that day)
 * is surfaced as a thrown error with that message, for the caller to show.
 */
export async function addExerciseToDay(
  planId: string,
  dayId: string,
  payload: AddExerciseToDayPayload,
): Promise<void> {
  await apiRequest(`/workouts/${planId}/days/${dayId}/exercises`, {
    method: "POST",
    body: payload,
  });
}


export type WorkoutStats = {
  workoutsCompleted: number;
  caloriesToday: number;
  weeklyWorkouts: number;
  /** Consecutive days with a completed workout (Home header flame). */
  currentStreak: number;
};

export async function getWorkoutStats(): Promise<WorkoutStats> {
  const body = await apiRequest<{ success: boolean; data: WorkoutStats; message?: string }>(
    "/workouts/stats",
  );

  if (!body.success) {
    throw new Error(body.message ?? "Failed to fetch workout stats");
  }

  return body.data;
}

export type WeeklyProgressDay = {
  day: string;
  date: string;
  completed: boolean;
  value: number;
};

export type WeeklyProgress = {
  days: WeeklyProgressDay[];
  daysTrained: number;
  totalDays: number;
};

export async function getWeeklyProgress(): Promise<WeeklyProgress> {
  const body = await apiRequest<{ success: boolean; data: WeeklyProgress; message?: string }>(
    "/workouts/weekly-progress",
  );

  if (!body.success) {
    throw new Error(body.message ?? "Failed to fetch weekly progress");
  }

  return body.data;
}

