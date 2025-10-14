import { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaUser } from "react-icons/fa";
import { SHIFT_TEMPLATES, type ShiftTemplate } from "../../constants/shifts";
import {
  useActiveUsers,
  useActivities,
  useScheduleMutations,
  useScheduleShifts,
} from "../../hooks";

interface ShiftAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftTemplate: ShiftTemplate;
  selectedDate: Date;
  isLocked?: boolean;
}

export function ShiftAssignmentModal({
  isOpen,
  onClose,
  shiftTemplate,
  selectedDate,
  isLocked = false,
}: ShiftAssignmentModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");

  const { data: activeUsers = [] } = useActiveUsers();
  const { data: activities = [] } = useActivities();
  const { createShift } = useScheduleMutations();
  const { data: existingShifts = [] } = useScheduleShifts(selectedDate);

  // Get users already assigned to this shift template on the selected date
  const assignedUserIds = existingShifts
    .filter((shift) => shift.template_name === shiftTemplate)
    .map((shift) => shift.user_id);

  const assignableUsers = activeUsers.filter(
    (user) => !assignedUserIds.includes(user.id)
  );
  const activeActivities = activities.filter((activity) => activity.is_active);

  // Auto-select user if there's only one option remaining
  useEffect(() => {
    if (assignableUsers.length === 1 && !selectedUserId) {
      setSelectedUserId(assignableUsers[0].id);
    }
  }, [assignableUsers, selectedUserId]);

  const shiftInfo = SHIFT_TEMPLATES[shiftTemplate];

  const getShiftDateTime = (time: string) => {
    const date = new Date(selectedDate);
    const [hours, minutes] = time.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submission if period is locked
    if (isLocked) {
      return;
    }

    if (!selectedUserId || !selectedActivityId) {
      return;
    }

    try {
      await createShift.mutateAsync({
        user_id: selectedUserId,
        activity_id: selectedActivityId,
        start_ts: getShiftDateTime(shiftInfo.start),
        end_ts: getShiftDateTime(shiftInfo.end),
        template_name: shiftTemplate,
      });

      onClose();
      setSelectedUserId("");
      setSelectedActivityId("");
    } catch (error) {
      console.error("Failed to create shift:", error);
    }
  };

  const handleClose = () => {
    onClose();
    setSelectedUserId("");
    setSelectedActivityId("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl border border-subtle bg-surface shadow-2xl shadow-black/30">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-subtle px-6 py-4">
          <h3 className="text-lg font-semibold text-primary">
            Thêm người vào {shiftInfo.label}
          </h3>
          <button
            onClick={handleClose}
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
              ⚠️ Không thể thêm ca làm việc trong kỳ lương đã khóa
            </div>
          )}

          {/* Shift Info */}
          <div className="rounded-xl border border-subtle bg-surface-muted p-3">
            <h4 className="mb-1 font-semibold text-primary">
              {shiftInfo.label}
            </h4>
            <p className="text-sm text-subtle">
              {shiftInfo.start} - {shiftInfo.end} •{" "}
              {selectedDate.toLocaleDateString("vi-VN")}
            </p>
          </div>

          {/* User Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-subtle">
              Chọn người
            </label>
            <div className="max-h-40 space-y-2 overflow-y-auto">
              {assignableUsers.map((user) => (
                <label
                  key={user.id}
                  className={`flex cursor-pointer items-center rounded-xl border px-3 py-2 transition ${
                    selectedUserId === user.id
                      ? "border-blue-400 bg-blue-500/10"
                      : "border-subtle hover:bg-surface-muted"
                  }`}
                >
                  <input
                    type="radio"
                    name="employee"
                    value={user.id}
                    checked={selectedUserId === user.id}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex flex-1 items-center">
                    <div className="mr-3 flex h-8 w-8 items-center justify-center rounded-full bg-surface-muted text-muted">
                      <FaUser className="text-sm" />
                    </div>
                    <div>
                      <div className="font-semibold text-primary">
                        {user.name}
                      </div>
                      <div className="text-sm text-subtle">{user.email}</div>
                    </div>
                  </div>
                  {selectedUserId === user.id && (
                    <FaCheck className="ml-2 text-blue-400" />
                  )}
                </label>
              ))}
              {assignableUsers.length === 0 && (
                <div className="py-8 text-center text-sm text-subtle">
                  {assignedUserIds.length > 0
                    ? "Tất cả nhân sự đủ điều kiện đã được phân công vào ca này"
                    : "Không có nhân sự nào khả dụng"}
                </div>
              )}
            </div>
          </div>

          {/* Activity Selection */}
          <div>
            <label className="mb-2 block text-sm font-medium text-subtle">
              Chọn hoạt động
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

          {/* Actions */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 rounded-xl border border-subtle px-4 py-2 text-sm font-semibold text-subtle transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                !selectedUserId ||
                !selectedActivityId ||
                createShift.isPending ||
                isLocked
              }
              className="flex-1 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createShift.isPending ? "Đang thêm..." : "Thêm vào ca"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
