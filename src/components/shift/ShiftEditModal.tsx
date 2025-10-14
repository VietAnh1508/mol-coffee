import { useEffect, useState } from "react";
import { FaClock, FaTimes } from "react-icons/fa";
import { useActivities, useScheduleMutations, useToast } from "../../hooks";
import type { ScheduleShift } from "../../types";
import { formatDate, formatTime } from "../../utils/dateUtils";

interface ShiftEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  shift: ScheduleShift | null;
  isLocked?: boolean;
}

export function ShiftEditModal({
  isOpen,
  onClose,
  shift,
  isLocked = false,
}: ShiftEditModalProps) {
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [note, setNote] = useState("");
  const [selectedActivityId, setSelectedActivityId] = useState("");

  const { updateShift } = useScheduleMutations();
  const { showToast } = useToast();
  const { data: activities = [] } = useActivities();

  // Initialize form data when shift changes
  useEffect(() => {
    if (shift) {
      setStartTime(formatTime(shift.start_ts));
      setEndTime(formatTime(shift.end_ts));
      setNote(shift.note || "");
      setSelectedActivityId(shift.activity_id);
    }
  }, [shift]);

  const activeActivities = activities.filter((activity) => activity.is_active);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if period is locked
    if (isLocked) {
      return;
    }

    if (!shift || !startTime || !endTime || !selectedActivityId) return;

    // Basic validation: end time must be after start time
    const [startHours, startMinutes] = startTime.split(":").map(Number);
    const [endHours, endMinutes] = endTime.split(":").map(Number);

    if (startHours * 60 + startMinutes >= endHours * 60 + endMinutes) {
      showToast("Giờ kết thúc phải sau giờ bắt đầu", "error");
      return;
    }

    try {
      // Create datetime strings for update
      const shiftDate = new Date(shift.start_ts);

      const startDateTime = new Date(shiftDate);
      startDateTime.setHours(startHours, startMinutes, 0, 0);

      const endDateTime = new Date(shiftDate);
      endDateTime.setHours(endHours, endMinutes, 0, 0);

      await updateShift.mutateAsync({
        id: shift.id,
        activity_id: selectedActivityId,
        start_ts: startDateTime.toISOString(),
        end_ts: endDateTime.toISOString(),
        // Preserve original template_name (morning/afternoon) instead of marking as custom
        note: note.trim() || undefined,
      });

      showToast("Cập nhật ca làm việc thành công", "success");
      onClose();
    } catch (error) {
      showToast("Có lỗi xảy ra khi cập nhật ca làm việc", "error");
      console.error("Failed to update shift:", error);
    }
  };

  if (!isOpen || !shift) return null;

  const hasTimeError =
    startTime &&
    endTime &&
    startTime
      .split(":")
      .map(Number)
      .reduce((a, b) => a * 60 + b) >=
      endTime
        .split(":")
        .map(Number)
        .reduce((a, b) => a * 60 + b);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-2xl border border-subtle bg-surface shadow-2xl shadow-black/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-subtle px-6 py-4">
          <h3 className="text-lg font-semibold text-primary">
            Chỉnh sửa ca làm việc
          </h3>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-muted transition hover:bg-surface-muted hover:text-primary"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="space-y-6 px-6 py-5">
          {/* Lock Warning */}
          {isLocked && (
            <div className="rounded-xl border border-amber-400/40 bg-amber-500/10 p-3 text-sm text-amber-200">
              ⚠️ Không thể chỉnh sửa ca làm việc trong kỳ lương đã khóa
            </div>
          )}

          {/* Shift Info */}
          <div className="rounded-xl border border-subtle bg-surface-muted p-3">
            <h4 className="mb-1 font-semibold text-primary">
              {shift.user?.name}
            </h4>
            <p className="text-sm text-subtle">
              {formatDate(new Date(shift.start_ts))} • {shift.activity?.name}
            </p>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-medium text-subtle">
                <FaClock className="mr-1 inline" />
                Giờ bắt đầu
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
                required
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium text-subtle">
                <FaClock className="mr-1 inline" />
                Giờ kết thúc
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
                required
              />
            </div>
          </div>

          {/* Activity Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-subtle">
              Hoạt động
            </label>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
              required
            >
              <option value="">-- Chọn hoạt động --</option>
              {activeActivities.map((activity) => (
                <option key={activity.id} value={activity.id}>
                  {activity.name}
                </option>
              ))}
            </select>
          </div>

          {/* Time Error */}
          {hasTimeError && (
            <div className="rounded-xl border border-rose-400/40 bg-rose-500/10 p-3 text-sm text-rose-200">
              Giờ kết thúc phải sau giờ bắt đầu
            </div>
          )}

          {/* Note */}
          <div>
            <label className="mb-2 block text-sm font-medium text-subtle">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
              placeholder="Ghi chú về ca làm việc (vd: đến muộn, về sớm)..."
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 rounded-xl border border-subtle px-4 py-2 text-sm font-semibold text-subtle transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                !startTime ||
                !endTime ||
                !selectedActivityId ||
                hasTimeError ||
                updateShift.isPending ||
                isLocked
              }
              className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateShift.isPending ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
