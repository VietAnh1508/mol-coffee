/**
 * Generate consistent colors for activity badges based on activity name
 * Uses a simple hash function to ensure the same activity always gets the same color
 */
export function getActivityBadgeColor(activityName: string): string {
  // Color palette for activity badges
  const colors = [
    "bg-blue-500/15 text-blue-400",
    "bg-emerald-500/15 text-emerald-400",
    "bg-purple-500/15 text-purple-400",
    "bg-amber-500/15 text-amber-400",
    "bg-pink-500/15 text-pink-400",
    "bg-indigo-500/15 text-indigo-400",
  ];

  // Simple hash function to get consistent color for same activity
  let hash = 0;
  for (let i = 0; i < activityName.length; i++) {
    hash = activityName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
