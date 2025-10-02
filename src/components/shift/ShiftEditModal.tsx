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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Chỉnh sửa ca làm việc
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Lock Warning */}
          {isLocked && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
              <p className="text-sm text-yellow-800">
                ⚠️ Không thể chỉnh sửa ca làm việc trong kỳ lương đã khóa
              </p>
            </div>
          )}

          {/* Shift Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-1">
              {shift.user?.name}
            </h4>
            <p className="text-sm text-gray-600">
              {formatDate(new Date(shift.start_ts))} • {shift.activity?.name}
            </p>
          </div>

          {/* Time Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaClock className="inline mr-1" />
                Giờ bắt đầu
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FaClock className="inline mr-1" />
                Giờ kết thúc
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Activity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hoạt động
            </label>
            <select
              value={selectedActivityId}
              onChange={(e) => setSelectedActivityId(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
              Giờ kết thúc phải sau giờ bắt đầu
            </div>
          )}

          {/* Note */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ghi chú (tùy chọn)
            </label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              placeholder="Ghi chú về ca làm việc (vd: đến muộn, về sớm)..."
            />
          </div>

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {updateShift.isPending ? "Đang cập nhật..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
