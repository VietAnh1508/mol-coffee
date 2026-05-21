import { formatSelectedSlots } from "../../utils/shiftRegistrationUtils";

interface Props {
  selectedSlots: Set<string>;
  isDirty: boolean;
  isReadOnly: boolean;
  isAdmin: boolean;
  isLocked: boolean;
  isSubmitting: boolean;
  isTogglingLock: boolean;
  onSubmit: () => void;
  onToggleLock: () => void;
}

export function SummaryBar({
  selectedSlots,
  isDirty,
  isReadOnly,
  isAdmin,
  isLocked,
  isSubmitting,
  isTogglingLock,
  onSubmit,
  onToggleLock,
}: Props) {
  const count = selectedSlots.size;
  const slotsLabel =
    count > 0 ? formatSelectedSlots(selectedSlots) : "Chưa chọn ca nào";

  return (
    <div className="bg-surface sticky bottom-0 z-40 border-t border-subtle px-4 py-3">
      <div className="flex items-center gap-3">
        {/* slot summary — employees only, spacer otherwise to keep buttons right-aligned */}
        {!isReadOnly ? (
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-primary">
              {count > 0 ? `${count} ca đã chọn` : "Chưa chọn ca nào"}
            </p>
            {count > 0 && (
              <p className="line-clamp-2 text-[11px] leading-relaxed text-muted">
                {slotsLabel}
              </p>
            )}
          </div>
        ) : (
          <div className="flex-1" />
        )}

        {/* admin lock/unlock */}
        {isAdmin && (
          <button
            type="button"
            onClick={onToggleLock}
            disabled={isTogglingLock}
            className="shrink-0 rounded-lg border border-subtle px-3 py-2 text-xs font-medium text-primary disabled:opacity-50"
          >
            {isTogglingLock ? "..." : isLocked ? "Mở khoá" : "Khoá"}
          </button>
        )}

        {/* employee submit */}
        {!isReadOnly && (
          <button
            type="button"
            onClick={onSubmit}
            disabled={!isDirty || isSubmitting}
            className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white disabled:opacity-40"
          >
            {isSubmitting ? "Đang lưu..." : "Đăng ký"}
          </button>
        )}
      </div>
    </div>
  );
}
