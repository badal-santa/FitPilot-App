export function toTitleCase(value: string) {
  return value.replace(/\b\w/g, (char) => char.toUpperCase());
}

/** "Just now", "5 min ago", "3 hours ago", "Yesterday", "4 days ago", or a date. */
export function formatRelativeTime(isoDate: string, now = Date.now()) {
  const time = new Date(isoDate).getTime();
  if (Number.isNaN(time)) return "";

  const minutes = Math.floor(Math.max(0, now - time) / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} min ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return hours === 1 ? "1 hour ago" : `${hours} hours ago`;

  const days = Math.floor(hours / 24);
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days} days ago`;

  return new Date(time).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: new Date(time).getFullYear() === new Date(now).getFullYear() ? undefined : "numeric",
  });
}
