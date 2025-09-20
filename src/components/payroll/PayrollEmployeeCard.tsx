import { FaChevronRight, FaUser } from "react-icons/fa";
import type { PayrollEmployeeSummary } from "../../hooks/usePayrollCalculations";
import { formatMoney } from "../../utils/payrollUtils";
import { getActivityBadgeColor } from "../../utils/activityColors";

interface PayrollEmployeeCardProps {
  readonly employee: PayrollEmployeeSummary;
}

export function PayrollEmployeeCard({ employee }: PayrollEmployeeCardProps) {
  return (
    <div className="bg-white rounded-lg shadow hover:shadow-md transition-shadow duration-200 border border-gray-200 hover:border-gray-300">
      <div className="p-6">
        {/* Employee Info */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                <FaUser className="w-5 h-5 text-gray-500" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="text-lg font-medium text-gray-900 truncate">
                {employee.employee.name}
              </h3>
              <p className="text-sm text-gray-500 truncate">
                {employee.employee.email}
              </p>
            </div>
          </div>
          <FaChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0 mt-2" />
        </div>

        {/* Salary Summary */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tổng lương:</span>
            <span className="text-lg font-bold text-gray-900">
              {formatMoney(Math.round(employee.totalSalary))}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Tổng giờ:</span>
            <span className="text-sm font-medium text-gray-700">
              {employee.totalHours.toFixed(1)} giờ
            </span>
          </div>

        </div>

        {/* Activity Summary */}
        {employee.activities.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-500 mb-2">Hoạt động chính:</div>
            <div className="flex flex-wrap gap-1">
              {employee.activities.slice(0, 3).map((activity) => (
                <span
                  key={activity.activity.id}
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getActivityBadgeColor(activity.activity.name)}`}
                >
                  {activity.activity.name}
                </span>
              ))}
              {employee.activities.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-gray-100 text-gray-700">
                  +{employee.activities.length - 3}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
