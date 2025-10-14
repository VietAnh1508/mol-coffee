import { useState } from "react";
import { ActivityList } from "../components/activity/ActivityList";
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
    <div className="px-4 py-6 sm:px-0 text-primary">
      <header className="mb-8 space-y-2">
        <h1 className="text-3xl font-semibold text-primary sm:text-4xl">
          Cài đặt
        </h1>
        <p className="text-sm text-subtle">
          Quản lý hoạt động và mức lương theo giờ.
        </p>
      </header>

      {/* Tab Navigation */}
      <div className="mb-6 border-b border-subtle">
        <nav className="-mb-px flex gap-6">
          <button
            onClick={() => setActiveTab("activities")}
            className={`relative py-2 text-sm font-semibold transition-colors ${
              activeTab === "activities"
                ? "text-blue-500"
                : "text-subtle hover:text-primary"
            }`}
          >
            Hoạt động
            {activeTab === "activities" && (
              <span className="absolute inset-x-0 -bottom-[1px] h-0.5 rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-blue-500" />
            )}
          </button>
          <button
            onClick={() => setActiveTab("rates")}
            className={`relative py-2 text-sm font-semibold transition-colors ${
              activeTab === "rates"
                ? "text-blue-500"
                : "text-subtle hover:text-primary"
            }`}
          >
            Mức lương
            {activeTab === "rates" && (
              <span className="absolute inset-x-0 -bottom-[1px] h-0.5 rounded-full bg-gradient-to-r from-blue-500 via-sky-500 to-blue-500" />
            )}
          </button>
        </nav>
      </div>

      {activeTab === "activities" && <ActivityList />}

      {activeTab === "rates" && <RateList />}
    </div>
  );
}
