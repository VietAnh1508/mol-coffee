import { useState } from 'react';
import { getInitials } from '../utils/nameUtils';
import { avatarColor } from '../utils/shiftRegistrationUtils';

const SIZE_CLASSES = {
  xs: 'h-6 w-6 text-[9px]',
  sm: 'h-8 w-8 text-[10px]',
  md: 'h-12 w-12 text-sm',
  lg: 'h-24 w-24 text-xl',
} as const;

interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null | undefined;
  userId?: string;
  size?: keyof typeof SIZE_CLASSES;
  className?: string;
}

export function UserAvatar({
  name,
  avatarUrl,
  userId,
  size = 'md',
  className = '',
}: UserAvatarProps) {
  const [imgError, setImgError] = useState(false);
  const sizeClass = SIZE_CLASSES[size];
  const initials = getInitials(name || '?');
  const bgColor = userId ? avatarColor(userId) : undefined;

  if (avatarUrl && !imgError) {
    return (
      <img
        src={avatarUrl}
        alt={name}
        onError={() => setImgError(true)}
        className={`rounded-full object-cover ${sizeClass} ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-bold text-white ${sizeClass} ${className}`}
      style={{ backgroundColor: bgColor ?? '#6b7280' }}
      aria-label={name}
    >
      {initials}
    </div>
  );
}
