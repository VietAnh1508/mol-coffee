import { useAuth } from "../hooks";
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
      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800 ${className}`}
    >
      Bạn
    </span>
  );
}
