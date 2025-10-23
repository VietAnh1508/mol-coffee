import { useState } from "react";
import { FaEdit } from "react-icons/fa";
import { HiPause, HiPlay, HiPlus } from "react-icons/hi2";
import { useActivities, useToast, useToggleActivity } from "../../hooks";
import type { Activity } from "../../types";
import { ConfirmationDialog } from "../ConfirmationDialog";
import { Spinner } from "../Spinner";
import { ActivityForm } from "./ActivityForm";

interface ActivityListProps {
  readonly canManage?: boolean;
}

export function ActivityList({ canManage = true }: ActivityListProps) {
  const { data: activities = [], isLoading } = useActivities();
  const toggleActivityMutation = useToggleActivity();
  const { showToast } = useToast();

  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [pendingToggleActivity, setPendingToggleActivity] =
    useState<Activity | null>(null);

  const handleRequestToggleActivity = (activity: Activity) => {
    if (!canManage) return;
    setPendingToggleActivity(activity);
  };

  const handleEdit = (activity: Activity) => {
    if (!canManage) return;
    setEditingActivity(activity);
    setShowForm(true);
  };

  const handleAdd = () => {
    if (!canManage) return;
    setEditingActivity(null);
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setEditingActivity(null);
    setShowForm(false);
  };

  const handleConfirmToggleActivity = async () => {
    if (!pendingToggleActivity) return;
    if (!canManage) {
      setPendingToggleActivity(null);
      return;
    }

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
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-xl font-semibold text-primary">
          Quản lý hoạt động
        </h2>
        {canManage && (
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
          >
            <HiPlus className="w-4 h-4" />
            Thêm hoạt động
          </button>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-subtle bg-surface shadow-lg shadow-black/5">
        <ul>
          {activities.map((activity, index) => (
            <li
              key={activity.id}
              className={`px-6 py-4 ${index < activities.length - 1 ? "border-b border-subtle" : ""}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <h3 className="text-lg font-semibold text-primary">
                    {activity.name}
                  </h3>
                  <span
                    className={`ml-3 inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                      activity.is_active
                        ? "bg-emerald-500/15 text-emerald-400"
                        : "bg-rose-500/15 text-rose-300"
                    }`}
                  >
                    {activity.is_active ? "Hoạt động" : "Ngừng hoạt động"}
                  </span>
                </div>
                {canManage && (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleEdit(activity)}
                      className="rounded-md p-1 text-muted transition hover:bg-surface-muted hover:text-primary focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
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
                      className={`rounded-md p-1 transition disabled:opacity-50 ${
                        activity.is_active
                          ? "text-rose-400 hover:bg-rose-500/10 hover:text-rose-300"
                          : "text-emerald-400 hover:bg-emerald-500/10 hover:text-emerald-300"
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
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {canManage && (showForm || editingActivity) && (
        <ActivityForm activity={editingActivity} onClose={handleCloseForm} />
      )}

      {canManage && (
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
      )}
    </div>
  );
}
