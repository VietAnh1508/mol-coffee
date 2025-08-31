import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";
import type { Activity, Rate } from "../types";

export function SettingsPage() {
  const { user } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"activities" | "rates">("activities");
  const [editingActivity, setEditingActivity] = useState<Activity | null>(null);
  const [editingRate, setEditingRate] = useState<Rate | null>(null);
  const [showActivityForm, setShowActivityForm] = useState(false);
  const [showRateForm, setShowRateForm] = useState(false);

  useEffect(() => {
    if (user && user.role === "admin") {
      fetchActivities();
      fetchRates();
    }
  }, [user]);

  // Redirect non-admin users
  if (!user || user.role !== "admin") {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Không có quyền truy cập</h2>
        <p className="text-gray-600 mt-2">Chỉ quản trị viên mới có thể truy cập trang này.</p>
      </div>
    );
  }

  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from("activities")
        .select("*")
        .order("name");

      if (error) throw error;
      setActivities(data || []);
    } catch (error) {
      console.error("Error fetching activities:", error);
    }
  };

  const fetchRates = async () => {
    try {
      const { data, error } = await supabase
        .from("rates")
        .select(`
          *,
          activity:activities(name)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setRates(data || []);
    } catch (error) {
      console.error("Error fetching rates:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveActivity = async (formData: FormData) => {
    const name = formData.get("name") as string;
    const isActive = formData.get("is_active") === "true";

    try {
      if (editingActivity) {
        // Update existing activity
        const { error } = await supabase
          .from("activities")
          .update({ name, is_active: isActive })
          .eq("id", editingActivity.id);

        if (error) throw error;
      } else {
        // Create new activity
        const { error } = await supabase
          .from("activities")
          .insert({ name, is_active: isActive });

        if (error) throw error;
      }

      await fetchActivities();
      setEditingActivity(null);
      setShowActivityForm(false);
    } catch (error) {
      console.error("Error saving activity:", error);
      alert("Lỗi khi lưu hoạt động");
    }
  };

  const handleSaveRate = async (formData: FormData) => {
    const activityId = formData.get("activity_id") as string;
    const hourlyVnd = parseInt(formData.get("hourly_vnd") as string);
    const effectiveFrom = formData.get("effective_from") as string;

    try {
      if (editingRate) {
        // Update existing rate
        const { error } = await supabase
          .from("rates")
          .update({
            activity_id: activityId,
            hourly_vnd: hourlyVnd,
            effective_from: effectiveFrom,
          })
          .eq("id", editingRate.id);

        if (error) throw error;
      } else {
        // Create new rate
        const { error } = await supabase
          .from("rates")
          .insert({
            activity_id: activityId,
            hourly_vnd: hourlyVnd,
            effective_from: effectiveFrom,
          });

        if (error) throw error;
      }

      await fetchRates();
      setEditingRate(null);
      setShowRateForm(false);
    } catch (error) {
      console.error("Error saving rate:", error);
      alert("Lỗi khi lưu mức lương");
    }
  };

  const handleToggleActivity = async (activity: Activity) => {
    try {
      const { error } = await supabase
        .from("activities")
        .update({ is_active: !activity.is_active })
        .eq("id", activity.id);

      if (error) throw error;
      await fetchActivities();
    } catch (error) {
      console.error("Error toggling activity:", error);
      alert("Lỗi khi cập nhật trạng thái hoạt động");
    }
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
                        className={`text-sm font-medium ${
                          activity.is_active
                            ? "text-red-600 hover:text-red-900"
                            : "text-green-600 hover:text-green-900"
                        }`}
                      >
                        {activity.is_active ? "Vô hiệu hóa" : "Kích hoạt"}
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Lưu
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
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Lưu
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}