import type { ShiftTemplate } from '../../constants/shifts';
import type { ShiftRegistration, SlotAnnotation } from '../../types';
import {
  getHeatLevel,
  hasAnnotation,
  HEAT_STYLES,
  slotKey,
} from '../../utils/shiftRegistrationUtils';
import { ClockIcon } from '../ClockIcon';
import { UserAvatar } from '../UserAvatar';

function serverAnnotated(r: ShiftRegistration): boolean {
  return !!(r.custom_start_time || r.custom_end_time || r.note);
}

interface Props {
  dayDate: string;
  template: ShiftTemplate;
  registrations: ShiftRegistration[];
  isSelected: boolean;
  isReadOnly: boolean;
  onToggle: (key: string) => void;
  // Current user's annotation from local state (for tick icon before submit)
  currentUserId: string | undefined;
  myAnnotation?: SlotAnnotation | null;
  // Admin/supervisor inspect tap handler
  onInspect?: () => void;
}

export function RegistrationCell({
  dayDate,
  template,
  registrations,
  isSelected,
  isReadOnly,
  onToggle,
  currentUserId,
  myAnnotation,
  onInspect,
}: Props) {
  const count = registrations.length;
  const heat = getHeatLevel(count, template, isSelected);
  const styles = HEAT_STYLES[heat];
  const key = slotKey(dayDate, template);

  const visibleAvatars = count <= 4 ? registrations : registrations.slice(0, 3);
  const overflow = count > 4 ? count - 3 : 0;

  function handleClick() {
    if (isReadOnly) {
      if (onInspect) onInspect();
      return;
    }
    onToggle(key);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleClick();
    }
  }

  const isInteractive = !isReadOnly || !!onInspect;

  return (
    <div
      role="button"
      tabIndex={isInteractive ? 0 : -1}
      aria-pressed={isReadOnly ? undefined : isSelected}
      aria-disabled={!isInteractive}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        color: styles.color,
        cursor: isInteractive ? 'pointer' : 'default',
        opacity: isReadOnly && !onInspect ? 0.8 : 1,
      }}
      className="relative flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-lg border px-2 py-2 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
    >
      {/* selected tick — top right */}
      {isSelected && (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 12 12"
          className="pointer-events-none absolute right-2 top-2 h-3 w-3 text-indigo-500"
          aria-hidden="true"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polyline points="2,6 5,9 10,3" />
        </svg>
      )}

      {count === 0 ? (
        <span className="text-sm font-medium opacity-40">—</span>
      ) : (
        <>
          {/* avatar row — centered */}
          <div
            className="pointer-events-none flex flex-wrap justify-center gap-0.5"
            aria-hidden="true"
          >
            {visibleAvatars.map((r) => {
              // For the current user's own avatar, derive annotation from local
              // state (myAnnotation) so unsaved changes are reflected immediately.
              const annotated =
                r.user_id === currentUserId
                  ? hasAnnotation(myAnnotation)
                  : serverAnnotated(r);

              return (
                <span
                  key={r.id}
                  title={r.user?.name}
                  className="relative flex h-6 w-6 shrink-0"
                >
                  <UserAvatar
                    name={r.user?.name ?? ''}
                    avatarUrl={r.user?.avatar_url}
                    userId={r.user_id}
                    size="xs"
                  />
                  {annotated && (
                    <span className="absolute -right-0.5 -top-0.5 flex h-3 w-3 items-center justify-center rounded-full bg-white text-indigo-600">
                      <ClockIcon className="h-2 w-2" />
                    </span>
                  )}
                </span>
              );
            })}
            {overflow > 0 && (
              <span
                style={{ backgroundColor: '#888', color: '#fff' }}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold leading-none"
              >
                +{overflow}
              </span>
            )}
          </div>

          {/* count — centered below avatars */}
          <span className="text-sm font-semibold leading-none">{count}</span>
        </>
      )}
    </div>
  );
}
