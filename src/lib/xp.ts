// XP levels and streak milestones for the Progress screen's rewards cards.
// Pure functions — no React — so they're easy to reuse and test.

export const XP_LEVELS = [
  { level: 1, xp: 0, title: "Beginner" },
  { level: 2, xp: 100, title: "Starter" },
  { level: 3, xp: 300, title: "Active" },
  { level: 4, xp: 700, title: "Dedicated" },
  { level: 5, xp: 1500, title: "Pro" },
  { level: 6, xp: 3000, title: "Elite" },
  { level: 7, xp: 5000, title: "Champion" },
  { level: 8, xp: 10000, title: "Legend" },
] as const;

export type XpLevel = (typeof XP_LEVELS)[number];

/** Current level for `totalXp`, the next one, and progress between them (0–100). */
export function getXpLevel(totalXp: number) {
  const currentLevel =
    [...XP_LEVELS].reverse().find((item) => totalXp >= item.xp) ?? XP_LEVELS[0];

  const nextLevel: XpLevel | null =
    XP_LEVELS.find((item) => item.level === currentLevel.level + 1) ?? null;

  const xpIntoLevel = totalXp - currentLevel.xp;
  const xpNeeded = nextLevel ? nextLevel.xp - currentLevel.xp : 0;
  const progress = nextLevel ? Math.min(100, (xpIntoLevel / xpNeeded) * 100) : 100;

  return {
    ...currentLevel,
    nextLevel,
    xpIntoLevel,
    xpNeeded,
    progress,
    xpRemaining: nextLevel ? Math.max(0, nextLevel.xp - totalXp) : 0,
  };
}

/** Streak lengths that award bonus XP, and how much each is worth. */
export const STREAK_MILESTONES = [
  { days: 3, xp: 50 },
  { days: 7, xp: 150 },
  { days: 30, xp: 500 },
  { days: 100, xp: 2000 },
] as const;

/**
 * The next streak milestone to aim for and progress toward it (0–100),
 * measured from the last milestone reached. `next` is null once every
 * milestone is done.
 */
export function getStreakMilestone(currentStreak: number) {
  const next = STREAK_MILESTONES.find((milestone) => currentStreak < milestone.days) ?? null;

  const previousDays =
    [...STREAK_MILESTONES].reverse().find((milestone) => currentStreak >= milestone.days)
      ?.days ?? 0;

  const progress = next
    ? Math.min(100, ((currentStreak - previousDays) / (next.days - previousDays)) * 100)
    : 100;

  return { next, progress };
}
