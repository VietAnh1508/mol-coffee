import type { ShiftTemplate } from "../../constants/shifts";
import type { ShiftRegistration } from "../../types";
import { getInitials } from "../../utils/nameUtils";
import {
  getHeatLevel,
  HEAT_STYLES,
  slotKey,
} from "../../utils/shiftRegistrationUtils";

const AVATAR_COLORS = [
  "#7F77DD",
  "#3BAF87",
  "#F5A623",
  "#E8819A",
  "#4AADDB",
  "#A67BC8",
];

function avatarColor(userId: string): string {
  let hash = 0;
  for (let i = 0; i < userId.length; i++) hash += userId.charCodeAt(i);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

interface Props {
  dayDate: string;
  template: ShiftTemplate;
  registrations: ShiftRegistration[];
  isSelected: boolean;
  isReadOnly: boolean;
  onToggle: (key: string) => void;
}

export function RegistrationCell({
  dayDate,
  template,
  registrations,
  isSelected,
  isReadOnly,
  onToggle,
}: Props) {
  const count = registrations.length;
  const heat = getHeatLevel(count, template, isSelected);
  const styles = HEAT_STYLES[heat];
  const key = slotKey(dayDate, template);

  const visibleAvatars = count <= 4 ? registrations : registrations.slice(0, 3);
  const overflow = count > 4 ? count - 3 : 0;

  function handleClick() {
    if (isReadOnly) return;
    onToggle(key);
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (isReadOnly) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onToggle(key);
    }
  }

  return (
    <div
      role="button"
      tabIndex={isReadOnly ? -1 : 0}
      aria-pressed={isSelected}
      aria-disabled={isReadOnly}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      style={{
        backgroundColor: styles.backgroundColor,
        borderColor: styles.borderColor,
        color: styles.color,
        cursor: isReadOnly ? "default" : "pointer",
        opacity: isReadOnly ? 0.8 : 1,
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
            {visibleAvatars.map((r) => (
              <span
                key={r.id}
                title={r.user?.name}
                style={{
                  backgroundColor: avatarColor(r.user_id),
                  color: "#fff",
                }}
                className="flex h-6 w-6 items-center justify-center rounded-full text-[9px] font-bold leading-none"
              >
                {getInitials(r.user?.name ?? "")}
              </span>
            ))}
            {overflow > 0 && (
              <span
                style={{ backgroundColor: "#888", color: "#fff" }}
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

