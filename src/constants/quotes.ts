// Motivational lines for the Home "Daily Mindset" card. App content, not
// user data — one is picked per calendar day so it changes daily but stays
// the same all day.
export const DAILY_QUOTES = [
  "Discipline today leads to results tomorrow.",
  "Small steps every day add up to big changes.",
  "You don't have to be extreme, just consistent.",
  "The only bad workout is the one that didn't happen.",
  "Progress, not perfection.",
  "Show up for yourself today.",
  "Strength grows in the moments you think you can't go on.",
  "Your body can stand almost anything. It's your mind you have to convince.",
  "Motivation gets you started. Habit keeps you going.",
  "Every rep is a vote for the person you want to become.",
  "Rest if you must, but don't quit.",
  "Train hard, recover well, repeat.",
  "One workout at a time, one day at a time.",
  "Consistency beats intensity.",
];

/** Same quote for the whole local day, a different one tomorrow. */
export function getDailyQuote(date = new Date()): string {
  const startOfYear = new Date(date.getFullYear(), 0, 0);
  const dayOfYear = Math.floor((date.getTime() - startOfYear.getTime()) / 86_400_000);
  return DAILY_QUOTES[dayOfYear % DAILY_QUOTES.length];
}
