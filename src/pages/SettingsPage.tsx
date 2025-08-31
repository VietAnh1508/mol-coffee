import { useState } from "react";
import { 
  useAuth, 
  useActivities, 
  useRates, 
  useCreateActivity, 
  useUpdateActivity, 
  useToggleActivity,
  useCreateRate,
  useUpdateRate
} from "../hooks";
import type { Activity, Rate } from "../types";

export function SettingsPage() {
  const { user } = useAuth();
  
  // TanStack Query hooks
  const { data: activities = [], isLoading: activitiesLoading } = useActivities();
  const { data: rates = [], isLoading: ratesLoading } = useRates();
  
  // Mutation hooks
  const createActivityMutation = useCreateActivity();
  const updateActivityMutation = useUpdateActivity();
  const toggleActivityMutation = useToggleActivity();
  const createRateMutation = useCreateRate();
  const updateRateMutation = useUpdateRate();
  
  // Local state
  const [activeTab, setActiveTab] = useState<"activities" | "rates">("activities");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showRateForm, setShowRateForm] = useState(false);
  
  const loading = activitiesLoading || ratesLoading;

  // Redirect non-admin users
  if (!user || user.role !== "admin") {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Không có quyền truy cập</h2>
        <p className="text-gray-600 mt-2">Chỉ quản trị viên mới có thể truy cập trang này.</p>
      </div>
    );
  }


  const handleSaveActivity = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const isActive = formData.get("is_active") === "true";

    if (editingActivity) {
      // Update existing activity
      updateActivityMutation.mutate({
        id: editingActivity.id,
        name,
        is_active: isActive
      }, {
        onSuccess: () => {
          setEditingActivity(null);
          setShowActivityForm(false);
        },
        onError: () => {
          alert("Lỗi khi cập nhật hoạt động");
        }
      });
    } else {
      // Create new activity
      createActivityMutation.mutate({
        name,
        is_active: isActive
      }, {
        onSuccess: () => {
          setEditingActivity(null);
          setShowActivityForm(false);
        },
        onError: () => {
          alert("Lỗi khi tạo hoạt động");
        }
      });
    }
  };

  const handleSaveRate = async (formData: FormData) => {
    const activityId = formData.get("activity_id") as string;
    const hourlyVnd = parseInt(formData.get("hourly_vnd") as string);
    const effectiveFrom = formData.get("effective_from") as string;

    if (editingRate) {
      // Update existing rate
      updateRateMutation.mutate({
        id: editingRate.id,
        activity_id: activityId,
        hourly_vnd: hourlyVnd,
        effective_from: effectiveFrom,
      }, {
        onSuccess: () => {
          setEditingRate(null);
          setShowRateForm(false);
        },
        onError: () => {
          alert("Lỗi khi cập nhật mức lương");
        }
      });
    } else {
      // Create new rate
      createRateMutation.mutate({
        activity_id: activityId,
        hourly_vnd: hourlyVnd,
        effective_from: effectiveFrom,
      }, {
        onSuccess: () => {
          setEditingRate(null);
          setShowRateForm(false);
        },
        onError: () => {
          alert("Lỗi khi tạo mức lương");
        }
      });
    }
  };

  const handleToggleActivity = (activity: Activity) => {
    toggleActivityMutation.mutate(activity, {
      onError: () => {
        alert("Lỗi khi cập nhật trạng thái hoạt động");
      }
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Cài đặt</h1>
        <p className="mt-2 text-gray-600">
          Quản lý hoạt động và mức lương theo giờ
        </p>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab("activities")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "activities"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Hoạt động
          </button>
          <button
            onClick={() => setActiveTab("rates")}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === "rates"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            Mức lương
          </button>
        </nav>
      </div>

      {activeTab === "activities" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quản lý hoạt động</h2>
            <button
              onClick={() => setShowActivityForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Thêm hoạt động
            </button>
          </div>

          {/* Activities List */}
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
                        onClick={() => setEditingActivity(activity)}
                        className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                      >
                        Sửa
                      </button>
                      <button
                        onClick={() => handleToggleActivity(activity)}
                        disabled={toggleActivityMutation.isPending}
                        className={`text-sm font-medium disabled:opacity-50 ${
                          activity.is_active
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {toggleActivityMutation.isPending 
                          ? "Đang xử lý..." 
                          : activity.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {activeTab === "rates" && (
        <div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Quản lý mức lương</h2>
            <button
              onClick={() => setShowRateForm(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Thêm mức lương
            </button>
          </div>

          {/* Rates List */}
          <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {rates.map((rate) => (
                <li key={rate.id} className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {rate.activity?.name}
                      </h3>
                      <div className="mt-1 text-sm text-gray-600">
                        <span className="font-medium">
                          {rate.hourly_vnd.toLocaleString("vi-VN")} VND/giờ
                        </span>
                        {" • "}
                        <span>
                          Có hiệu lực từ:{" "}
                          {new Date(rate.effective_from).toLocaleDateString("vi-VN")}
                        </span>
                        {rate.effective_to && (
                          <>
                            {" • "}
                            <span>
                              Đến:{" "}
                              {new Date(rate.effective_to).toLocaleDateString("vi-VN")}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => setEditingRate(rate)}
                      className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                    >
                      Sửa
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Activity Form Modal */}
      {(showActivityForm || editingActivity) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingActivity ? "Sửa hoạt động" : "Thêm hoạt động mới"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveActivity(new FormData(e.target as HTMLFormElement));
              }}
            >
              <div className="mb-4">
                <label htmlFor="activity-name" className="block text-sm font-medium text-gray-700 mb-1">
                  Tên hoạt động
                </label>
                <input
                  id="activity-name"
                  type="text"
                  name="name"
                  required
                  defaultValue={editingActivity?.name || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    value="true"
                    defaultChecked={editingActivity?.is_active ?? true}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-2 text-sm text-gray-700">Hoạt động</span>
                </label>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingActivity(null);
                    setShowActivityForm(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createActivityMutation.isPending || updateActivityMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(createActivityMutation.isPending || updateActivityMutation.isPending) ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Rate Form Modal */}
      {(showRateForm || editingRate) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {editingRate ? "Sửa mức lương" : "Thêm mức lương mới"}
            </h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSaveRate(new FormData(e.target as HTMLFormElement));
              }}
            >
              <div className="mb-4">
                <label htmlFor="rate-activity" className="block text-sm font-medium text-gray-700 mb-1">
                  Hoạt động
                </label>
                <select
                  id="rate-activity"
                  name="activity_id"
                  required
                  defaultValue={editingRate?.activity_id || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Chọn hoạt động</option>
                  {activities
                    .filter((a) => a.is_active)
                    .map((activity) => (
                      <option key={activity.id} value={activity.id}>
                        {activity.name}
                      </option>
                    ))}
                </select>
              </div>
              <div className="mb-4">
                <label htmlFor="rate-hourly" className="block text-sm font-medium text-gray-700 mb-1">
                  Mức lương theo giờ (VND)
                </label>
                <input
                  id="rate-hourly"
                  type="number"
                  name="hourly_vnd"
                  required
                  min="0"
                  step="1000"
                  defaultValue={editingRate?.hourly_vnd || ""}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="rate-effective" className="block text-sm font-medium text-gray-700 mb-1">
                  Có hiệu lực từ
                </label>
                <input
                  id="rate-effective"
                  type="date"
                  name="effective_from"
                  required
                  defaultValue={
                    editingRate
                      ? new Date(editingRate.effective_from)
                          .toISOString()
                          .split("T")[0]
                      : new Date().toISOString().split("T")[0]
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setEditingRate(null);
                    setShowRateForm(false);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={createRateMutation.isPending || updateRateMutation.isPending}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(createRateMutation.isPending || updateRateMutation.isPending) ? "Đang lưu..." : "Lưu"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}