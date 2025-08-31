import { useState } from "react";
import { ActivityList } from "../components/ActivityList";
import { RateList } from "../components/RateList";
import { useAuth } from "../hooks";

export function SettingsPage() {
  const { user } = useAuth();

  // Local state
  const [activeTab, setActiveTab] = useState<"activities" | "rates">(
    "activities"
  );

  // Redirect non-admin users
  if (!user || user.role !== "admin") {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">
          Không có quyền truy cập
        </h2>
        <p className="text-gray-600 mt-2">
          Chỉ quản trị viên mới có thể truy cập trang này.
        </p>
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

      {activeTab === "activities" && <ActivityList />}

      {activeTab === "rates" && <RateList />}
    </div>
  );
}
