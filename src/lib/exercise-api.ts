import { apiRequest } from "@/lib/api-client";

export type Exercise = {
  id: string;
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
  /** Recently added by an admin — the card shows a NEW ribbon. */
  isNew: boolean;
};

// Raw shape returned by the API (snake_case, see /openapi.json).
type RawExercise = {
  id: string;
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
  created_at?: string;
  // SQLite has no boolean — 0/1. Optional so an older backend still parses.
  is_new?: number | boolean;
};

function normalizeExercise(raw: RawExercise): Exercise {
  return {
    id: raw.id,
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
    isNew: Boolean(raw.is_new),
  };
}

/**
 * The catalog is small (a few dozen entries) and the API only supports
 * exact-match filters (no free-text search), so callers fetch a large page
 * once and filter by name client-side — see useExercises.
 */
export async function fetchExercises(options: { muscleGroup?: string } = {}): Promise<Exercise[]> {
  const json = await apiRequest<{ success: true; data: RawExercise[] }>("/exercises", {
    params: { muscleGroup: options.muscleGroup, limit: 100 },
    auth: false,
  });
  return json.data.map(normalizeExercise);
}

export async function fetchExerciseById(id: string): Promise<Exercise> {
  const json = await apiRequest<{ success: true; data: RawExercise }>(`/exercises/${id}`, {
    auth: false,
  });
  return normalizeExercise(json.data);
}
