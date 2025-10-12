import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { HiPause, HiPlay, HiPlus } from "react-icons/hi2";
import { useActivities, useToast, useToggleActivity } from "../../hooks";
import type { Activity } from "../../types";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { Spinner } from "../Spinner";
import { ActivityForm } from "./ActivityForm";

export function ActivityList() {
  const { data: activities = [], isLoading } = useActivities();
  const toggleActivityMutation = useToggleActivity();
  const { showToast } = useToast();

  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingToggleActivity, setPendingToggleActivity] =
    useState<Activity | null>(null);

  const handleRequestToggleActivity = (activity: Activity) => {
    setPendingToggleActivity(activity);
  };

  const handleEdit = (activity: Activity) => {
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleAdd = () => {
    setEditingActivity(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingActivity(null);
    setShowForm(false);
  };

  const handleConfirmToggleActivity = async () => {
    if (!pendingToggleActivity) return;

    const toggledActivity = pendingToggleActivity;

    try {
      await toggleActivityMutation.mutateAsync(toggledActivity);
      showToast(
        toggledActivity.is_active
          ? `Đã vô hiệu hóa hoạt động "${toggledActivity.name}"`
          : `Đã kích hoạt hoạt động "${toggledActivity.name}"`,
        "success"
      );
      setPendingToggleActivity(null);
    } catch (error) {
      showToast("Có lỗi xảy ra khi cập nhật trạng thái hoạt động", "error");
      console.error("Failed to toggle activity:", error);
    }
  };

  const handleCancelToggleActivity = () => {
    if (toggleActivityMutation.isPending) return;
    setPendingToggleActivity(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Spinner />
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          Quản lý hoạt động
        </h2>
        <button
          onClick={handleAdd}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center gap-2"
        >
          <HiPlus className="w-4 h-4" />
          Thêm hoạt động
        </button>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <ul className="divide-y divide-gray-200">
          {activities.map((activity) => (
            <li key={activity.id} className="px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h3 className="text-lg font-medium text-gray-900">
                    {activity.name}
                  </h3>
                  <span
                    className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      activity.is_active
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {activity.is_active ? "Hoạt động" : "Ngừng hoạt động"}
                  </span>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(activity)}
                    className="p-1 hover:bg-white/50 rounded"
                  >
                    <FaEdit className="text-sm" />
                  </button>
                  <button
                    onClick={() => handleRequestToggleActivity(activity)}
                    disabled={toggleActivityMutation.isPending}
                    aria-label={
                      activity.is_active
                        ? "Vô hiệu hóa hoạt động"
                        : "Kích hoạt hoạt động"
                    }
                    className={`p-1 rounded hover:bg-white/50 disabled:opacity-50 ${
                      activity.is_active
                        ? "text-red-600 hover:text-red-900"
                        : "text-green-600 hover:text-green-900"
                    }`}
                  >
                    {toggleActivityMutation.isPending ? (
                      <Spinner size="sm" className="h-4 w-4" />
                    ) : activity.is_active ? (
                      <HiPause className="w-4 h-4" />
                    ) : (
                      <HiPlay className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {(showForm || editingActivity) && (
        <ActivityForm activity={editingActivity} onClose={handleCloseForm} />
      )}

      <ConfirmationDialog
        isOpen={Boolean(pendingToggleActivity)}
        onClose={handleCancelToggleActivity}
        onConfirm={handleConfirmToggleActivity}
        title="Xác nhận cập nhật trạng thái"
        message={
          pendingToggleActivity
            ? `Bạn có chắc chắn muốn ${
                pendingToggleActivity.is_active ? "vô hiệu hóa" : "kích hoạt"
              } hoạt động "${pendingToggleActivity.name}" không?`
            : ""
        }
        confirmText={
          pendingToggleActivity?.is_active ? "Vô hiệu hóa" : "Kích hoạt"
        }
        cancelText="Hủy"
        isLoading={toggleActivityMutation.isPending}
        loadingText="Đang cập nhật..."
        actionType={pendingToggleActivity?.is_active ? "warning" : "success"}
      />
    </div>
  );
}
