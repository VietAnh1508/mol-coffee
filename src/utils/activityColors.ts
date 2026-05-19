const BADGE_COLORS = [
  "bg-sky-500/20 text-sky-400",
  "bg-emerald-500/20 text-emerald-400",
  "bg-violet-500/20 text-violet-400",
  "bg-amber-500/20 text-amber-500",
  "bg-rose-500/20 text-rose-400",
  "bg-teal-500/20 text-teal-400",
];

const ICON_COLORS = [
  "text-sky-400",
  "text-emerald-400",
  "text-violet-400",
  "text-amber-500",
  "text-rose-400",
  "text-teal-400",
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

export function getActivityBadgeColor(activityName: string): string {
  return BADGE_COLORS[hashName(activityName) % BADGE_COLORS.length];
}

export function getActivityIconColor(activityName: string): string {
  return ICON_COLORS[hashName(activityName) % ICON_COLORS.length];
}

