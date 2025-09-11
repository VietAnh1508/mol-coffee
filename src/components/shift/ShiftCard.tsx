import { useState } from "react";
import { FaClock, FaEdit, FaTrash } from "react-icons/fa";
import { useScheduleMutations, useToast } from "../../hooks";
import type { ScheduleShift } from "../../types";
import { formatTime } from "../../utils/dateUtils";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { CurrentUserBadge } from "../CurrentUserBadge";

interface ShiftCardProps {
  shift: ScheduleShift;
  isAdmin: boolean;
  onEdit?: (shift: ScheduleShift) => void;
}

export function ShiftCard({ shift, isAdmin, onEdit }: ShiftCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const { deleteShift } = useScheduleMutations();
  const { showToast } = useToast();
  const getActivityBadgeColor = (activityName: string) => {
    // Generate consistent colors based on activity name
    const colors = [
      "bg-blue-100 text-blue-800",
      "bg-green-100 text-green-800",
      "bg-purple-100 text-purple-800",
      "bg-yellow-100 text-yellow-800",
      "bg-pink-100 text-pink-800",
      "bg-indigo-100 text-indigo-800",
    ];

    // Simple hash function to get consistent color for same activity
    let hash = 0;
    for (let i = 0; i < activityName.length; i++) {
      hash = activityName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteShift.mutateAsync(shift.id);
      showToast("Đã xóa ca làm việc thành công", "success");
      setShowDeleteConfirm(false);
    } catch (error) {
      showToast("Có lỗi xảy ra khi xóa ca làm việc", "error");
      console.error("Failed to delete shift:", error);
    }
  };

  const handleDeleteCancel = () => {
    setShowDeleteConfirm(false);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-1">
            <span className="font-medium text-gray-900">
              {shift.user?.name || "Không xác định"}
            </span>
            {shift.user && <CurrentUserBadge user={shift.user} />}
          </div>
          {shift.activity?.name && (
            <span
              className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getActivityBadgeColor(shift.activity.name)}`}
            >
              {shift.activity.name}
            </span>
          )}
        </div>
        {isAdmin && (
          <div className="flex space-x-1">
            <button
              onClick={() => onEdit?.(shift)}
              className="p-1 hover:bg-white/50 rounded"
            >
              <FaEdit className="text-sm" />
            </button>
            <button
              onClick={handleDeleteClick}
              className="p-1 hover:bg-white/50 rounded text-red-600"
            >
              <FaTrash className="text-sm" />
            </button>
          </div>
        )}
      </div>
      <div className="flex items-center text-sm text-gray-600">
        <FaClock className="mr-1" />
        {formatTime(shift.start_ts)} - {formatTime(shift.end_ts)}
      </div>
      {shift.note && (
        <div className="text-xs mt-1 text-gray-500">Ghi chú: {shift.note}</div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={showDeleteConfirm}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Xác nhận xóa ca làm việc"
        message={`Bạn có chắc chắn muốn xóa ca làm việc của ${shift.user?.name || "nhân viên này"} không? Hành động này không thể hoàn tác.`}
        confirmText="Xóa"
        cancelText="Hủy"
        isLoading={deleteShift.isPending}
      />
    </div>
  );
}
