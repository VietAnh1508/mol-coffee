import { useState } from 'react';
import { HiChevronLeft, HiChevronRight, HiTrash } from 'react-icons/hi2';
import { ConfirmationDialog } from '../ConfirmationDialog';
import { addWeeks, formatWeekRangeCompact } from '../../utils/dateUtils';

interface Props {
  weekStart: string;
  nextWeek: string;
  isAdmin: boolean;
  isDeleting: boolean;
  onWeekChange: (weekStart: string) => void;
  onDeleteConfirm: () => Promise<void>;
}

export function WeekNavigator({
  weekStart,
  nextWeek,
  isAdmin,
  isDeleting,
  onWeekChange,
  onDeleteConfirm,
}: Props) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const isPastWeek = weekStart < nextWeek;

  const weekStartDate = new Date(weekStart + 'T00:00:00');
  const weekEndDate = new Date(weekStart + 'T00:00:00');
  weekEndDate.setDate(weekEndDate.getDate() + 5);
  const weekLabel = formatWeekRangeCompact(weekStartDate, weekEndDate);

  function navigate(delta: number) {
    setConfirmingDelete(false);
    onWeekChange(addWeeks(weekStart, delta));
  }

  return (
    <>
      <div className="mb-4 flex items-center gap-2">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-subtle text-primary hover:bg-surface"
          aria-label="Tuần trước"
        >
          <HiChevronLeft className="h-4 w-4" />
        </button>

        <span className="flex-1 text-center text-sm font-medium text-primary">
          {weekLabel}
        </span>

        <button
          type="button"
          onClick={() => navigate(1)}
          disabled={weekStart >= nextWeek}
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-subtle text-primary hover:bg-surface disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Tuần sau"
        >
          <HiChevronRight className="h-4 w-4" />
        </button>

        {isAdmin && isPastWeek && (
          <button
            type="button"
            onClick={() => setConfirmingDelete(true)}
            className="flex h-8 items-center gap-1.5 rounded-lg border border-subtle px-2.5 text-xs font-medium text-red-600 hover:bg-red-50"
          >
            <HiTrash className="h-3.5 w-3.5" />
            Xoá
          </button>
        )}
      </div>

      <ConfirmationDialog
        isOpen={confirmingDelete}
        onClose={() => setConfirmingDelete(false)}
        onConfirm={async () => {
          await onDeleteConfirm();
          setConfirmingDelete(false);
        }}
        title="Xoá bảng đăng ký ca"
        message={`Tất cả dữ liệu đăng ký của tuần ${weekLabel} sẽ bị xoá vĩnh viễn. Hành động này không thể hoàn tác.`}
        confirmText="Xoá"
        cancelText="Huỷ"
        isLoading={isDeleting}
        loadingText="Đang xoá..."
        actionType="danger"
      />
    </>
  );
}
