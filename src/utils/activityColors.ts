/**
 * Generate consistent colors for activity badges based on activity name
 * Uses a simple hash function to ensure the same activity always gets the same color
 */
export function getActivityBadgeColor(activityName: string): string {
  // Color palette — for activity badges
  const colors = [
    "bg-sky-500/20 text-sky-400",
    "bg-emerald-500/20 text-emerald-400",
    "bg-violet-500/20 text-violet-400",
    "bg-amber-500/20 text-amber-500",
    "bg-rose-500/20 text-rose-400",
    "bg-teal-500/20 text-teal-400",
  ];

  // Simple hash function to get consistent color for same activity
  let hash = 0;
  for (let i = 0; i < activityName.length; i++) {
    hash = activityName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}

