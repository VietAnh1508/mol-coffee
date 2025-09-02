import { useState } from "react";
import { ActivityList } from "../components/activity/ActivityList";
import { PageTitle } from "../components/PageTitle";
import { RateList } from "../components/rates/RateList";
import { useAuth } from "../hooks";

export function SettingsPage() {
  const { user } = useAuth();

  // Local state
  const [activeTab, setActiveTab] = useState<"activities" | "rates">(
    "activities"
  );

  if (!user) return null;

  return (
    <div className="px-4 py-6 sm:px-0">
      <PageTitle
        title="Cài đặt"
        subtitle="Quản lý hoạt động và mức lương theo giờ"
      />

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
