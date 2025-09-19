/**
 * Generate consistent colors for activity badges based on activity name
 * Uses a simple hash function to ensure the same activity always gets the same color
 */
export function getActivityBadgeColor(activityName: string): string {
  // Color palette for activity badges
  const colors = [
    "bg-blue-100 text-blue-800",
    "bg-green-100 text-green-800",
    "bg-purple-100 text-purple-800",
    "bg-yellow-100 text-yellow-800",
    "bg-pink-100 text-pink-800",
    "bg-indigo-100 text-indigo-800",
  ];

  // Simple hash function to get consistent color for same activity
  let hash = 0;
  for (let i = 0; i < activityName.length; i++) {
    hash = activityName.charCodeAt(i) + ((hash << 5) - hash);
  }

  return colors[Math.abs(hash) % colors.length];
}
