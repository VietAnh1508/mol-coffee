import type { PayrollEmployeeSummary } from "../../hooks/usePayrollCalculations";
import { formatMoney } from "../../utils/payrollUtils";
import { PayrollDailyBreakdown } from "./PayrollDailyBreakdown";

interface PayrollDataDisplayProps {
  payrollData: PayrollEmployeeSummary[];
  selectedPeriod: string;
  canViewSummary: boolean;
}

export function PayrollDataDisplay({
  payrollData,
  selectedPeriod,
  canViewSummary,
}: PayrollDataDisplayProps) {
  return (
    <div className="space-y-4 text-primary">
      {/* Summary Cards - Only show for admins */}
      {canViewSummary && (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-lg shadow-black/5">
            <div className="text-sm font-medium text-subtle">
              Tổng nhân viên
            </div>
            <div className="text-2xl font-semibold text-primary">
              {payrollData.length}
            </div>
          </div>
          <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-lg shadow-black/5">
            <div className="text-sm font-medium text-subtle">Tổng giờ làm</div>
            <div className="text-2xl font-semibold text-primary">
              {payrollData
                .reduce((sum, emp) => sum + emp.totalHours, 0)
                .toFixed(1)}
            </div>
          </div>
          <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-lg shadow-black/5">
            <div className="text-sm font-medium text-subtle">
              Tổng tiền lương
            </div>
            <div className="text-2xl font-semibold text-primary">
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
            className="overflow-hidden rounded-2xl border border-subtle bg-surface shadow-lg shadow-black/5"
          >
            <div className="border-b border-subtle p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-primary">
                    {employee.employee.name}
                  </h3>
                  <p className="text-sm text-subtle">
                    {employee.employee.email}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-semibold text-primary">
                    {formatMoney(Math.round(employee.totalSalary))}
                  </div>
                  <div className="text-sm text-subtle">
                    {employee.totalHours.toFixed(1)} giờ
                  </div>
                </div>
              </div>
            </div>

            {/* Activity Breakdown */}
            <div className="p-6">
              <h4 className="mb-3 text-sm font-semibold text-subtle">
                Chi tiết theo hoạt động
              </h4>
              <div className="space-y-2">
                {employee.activities.map((activity) => (
                  <div
                    key={activity.activity.id}
                    className="flex items-center justify-between rounded-xl border border-subtle bg-surface-muted px-3 py-2"
                  >
                    <div>
                      <span className="text-sm font-semibold text-primary">
                        {activity.activity.name}
                      </span>
                      <span className="text-sm text-subtle ml-2">
                        ({activity.hours.toFixed(1)} giờ ×{" "}
                        {formatMoney(activity.rate)}/giờ)
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-primary">
                      {formatMoney(Math.round(activity.subtotal))}
                    </div>
                  </div>
                ))}

                {/* Lunch Allowance Summary */}
                {(employee.lunchAllowanceDays ?? 0) > 0 && (
                  <div className="flex items-center justify-between rounded-xl border border-subtle bg-surface-muted px-3 py-2">
                    <div>
                      <span className="text-sm font-semibold text-primary">
                        Phụ cấp ăn trưa
                      </span>
                      <span className="text-sm text-subtle ml-2">
                        ({employee.lunchAllowanceDays} ngày)
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-primary">
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
