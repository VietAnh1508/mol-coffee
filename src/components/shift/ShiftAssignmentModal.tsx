import { useEffect, useState } from "react";
import { FaCheck, FaTimes, FaUser } from "react-icons/fa";
import { SHIFT_TEMPLATES } from "../../constants/shifts";
import { USER_ROLES } from "../../constants/userRoles";
import {
  useActiveUsers,
  useActivities,
  useScheduleMutations,
  useScheduleShifts,
} from "../../hooks";

interface ShiftAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  shiftTemplate: "morning" | "afternoon";
  selectedDate: Date;
  onSuccess?: () => void;
}

export function ShiftAssignmentModal({
  isOpen,
  onClose,
  shiftTemplate,
  selectedDate,
  onSuccess,
}: ShiftAssignmentModalProps) {
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [selectedActivityId, setSelectedActivityId] = useState<string>("");

  const { data: activeUsers = [] } = useActiveUsers();
  const { data: activities = [] } = useActivities();
  const { createShift } = useScheduleMutations();
  const { data: existingShifts = [] } = useScheduleShifts(selectedDate);

  // Get users already assigned to this shift template on the selected date
  const assignedUserIds = existingShifts
    .filter(shift => shift.template_name === shiftTemplate)
    .map(shift => shift.user_id);

  const employeeUsers = activeUsers.filter(
    (user) => user.role === USER_ROLES.EMPLOYEE && !assignedUserIds.includes(user.id)
  );
  const activeActivities = activities.filter((activity) => activity.is_active);

  // Auto-select employee if there's only one
  useEffect(() => {
    if (employeeUsers.length === 1 && !selectedUserId) {
      setSelectedUserId(employeeUsers[0].id);
    }
  }, [employeeUsers, selectedUserId]);

  const shiftInfo = SHIFT_TEMPLATES[shiftTemplate];

  const getShiftDateTime = (time: string) => {
    const date = new Date(selectedDate);
    const [hours, minutes] = time.split(":").map(Number);
    date.setHours(hours, minutes, 0, 0);
    return date.toISOString();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

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

      onSuccess?.();
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">
            Thêm người vào {shiftInfo.label}
          </h3>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <FaTimes />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 space-y-6">
          {/* Shift Info */}
          <div className="bg-gray-50 rounded-lg p-3">
            <h4 className="font-medium text-gray-900 mb-1">
              {shiftInfo.label}
            </h4>
            <p className="text-sm text-gray-600">
              {shiftInfo.start} - {shiftInfo.end} •{" "}
              {selectedDate.toLocaleDateString("vi-VN")}
            </p>
          </div>

          {/* Employee Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn nhân viên
            </label>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {employeeUsers.map((user) => (
                <label
                  key={user.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedUserId === user.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:bg-gray-50"
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
                  <div className="flex items-center flex-1">
                    <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center mr-3">
                      <FaUser className="text-gray-500 text-sm" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {user.name}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  {selectedUserId === user.id && (
                    <FaCheck className="text-blue-500 ml-2" />
                  )}
                </label>
              ))}
              {employeeUsers.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  {assignedUserIds.length > 0
                    ? "Tất cả nhân viên đã được phân công vào ca này"
                    : "Không có nhân viên nào khả dụng"
                  }
                </div>
              )}
            </div>
          </div>

          {/* Activity Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chọn hoạt động
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

          {/* Actions */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={
                !selectedUserId || !selectedActivityId || createShift.isPending
              }
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {createShift.isPending ? "Đang thêm..." : "Thêm vào ca"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
