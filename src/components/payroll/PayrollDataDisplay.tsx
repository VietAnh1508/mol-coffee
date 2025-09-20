import type { PayrollEmployeeSummary } from "../../hooks/usePayrollCalculations";
import { formatMoney } from "../../utils/payrollUtils";
import { PayrollDailyBreakdown } from "./PayrollDailyBreakdown";

interface PayrollDataDisplayProps {
  payrollData: PayrollEmployeeSummary[];
  selectedPeriod: string;
  isAdmin: boolean;
}

export function PayrollDataDisplay({
  payrollData,
  selectedPeriod,
  isAdmin,
}: PayrollDataDisplayProps) {
  return (
    <div className="space-y-4">
      {/* Summary Cards - Only show for admins */}
      {isAdmin && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Tổng nhân viên
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {payrollData.length}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Tổng giờ làm
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {payrollData
                .reduce((sum, emp) => sum + emp.totalHours, 0)
                .toFixed(1)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Tổng tiền lương
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {formatMoney(
                Math.round(
                  payrollData.reduce((sum, emp) => sum + emp.totalSalary, 0)
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Employee Details */}
      <div className="space-y-4">
        {payrollData.map((employee) => (
          <div
            key={employee.employee.id}
            className="bg-white rounded-lg shadow"
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-gray-900">
                    {employee.employee.name}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {employee.employee.email}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatMoney(Math.round(employee.totalSalary))}
                  </div>
                  <div className="text-sm text-gray-500">
                    {employee.totalHours.toFixed(1)} giờ
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Breakdown */}
            <div className="p-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">
                Chi tiết theo hoạt động
              </h4>
              <div className="space-y-2">
                {employee.activities.map((activity) => (
                  <div
                    key={activity.activity.id}
                    className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md"
                  >
                    <div>
                      <span className="text-sm font-medium text-gray-900">
                        {activity.activity.name}
                      </span>
                      <span className="text-sm text-gray-500 ml-2">
                        ({activity.hours.toFixed(1)} giờ × {formatMoney(activity.rate)}/giờ)
                      </span>
                    </div>
                    <div className="text-sm font-medium text-gray-900">
                      {formatMoney(Math.round(activity.subtotal))}
                    </div>
                  </div>
                ))}

                {/* Lunch Allowance Summary */}
                {employee.lunchAllowanceDays &&
                  employee.lunchAllowanceDays > 0 && (
                    <div className="flex items-center justify-between py-2 px-3 bg-gray-50 rounded-md">
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          Phụ cấp ăn trưa
                        </span>
                        <span className="text-sm text-gray-500 ml-2">
                          ({employee.lunchAllowanceDays} ngày)
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-900">
                        {formatMoney(
                          Math.round(employee.lunchAllowanceTotal || 0)
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>

            <PayrollDailyBreakdown
              yearMonth={selectedPeriod}
              userId={employee.employee.id}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
