import { useState } from "react";
import { useActivities, useToggleActivity } from "../hooks";
import type { Activity } from "../types";
import { ActivityForm } from "./ActivityForm";
import { HiPencil, HiPlay, HiPause, HiPlus } from "react-icons/hi2";

export function ActivityList() {
  const { data: activities = [], isLoading } = useActivities();
  const toggleActivityMutation = useToggleActivity();

  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [showForm, setShowForm] = useState(false);

  const handleToggleActivity = (activity: Activity) => {
    toggleActivityMutation.mutate(activity, {
      onError: () => {
        alert("Lỗi khi cập nhật trạng thái hoạt động");
      },
    });
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium flex items-center gap-1"
                  >
                    <HiPencil className="w-4 h-4" />
                    Sửa
                  </button>
                  <button
                    onClick={() => handleToggleActivity(activity)}
                    disabled={toggleActivityMutation.isPending}
                    className={`text-sm font-medium disabled:opacity-50 flex items-center gap-1 ${
                      activity.is_active
                        ? "text-red-600 hover:text-red-900"
                        : "text-green-600 hover:text-green-900"
                    }`}
                  >
                    {toggleActivityMutation.isPending ? (
                      "Đang xử lý..."
                    ) : activity.is_active ? (
                      <>
                        <HiPause className="w-4 h-4" />
                        Vô hiệu hóa
                      </>
                    ) : (
                      <>
                        <HiPlay className="w-4 h-4" />
                        Kích hoạt
                      </>
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
    </div>
  );
}
