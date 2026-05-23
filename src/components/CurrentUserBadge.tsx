import { useAuth } from "../hooks/useAuth";
import type { User } from "../types";

interface CurrentUserBadgeProps {
  user: User;
  className?: string;
}

export function CurrentUserBadge({
  user,
  className = "",
}: CurrentUserBadgeProps) {
  const { user: currentUser } = useAuth();
  const isCurrentUser = currentUser && user.id === currentUser.id;

  if (!isCurrentUser) {
    return null;
  }

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-amber-500/15 text-amber-400 ${className}`}
    >
      Bạn
    </span>
  );
}
