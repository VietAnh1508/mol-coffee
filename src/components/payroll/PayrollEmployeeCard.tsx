import {
  FaCheckCircle,
  FaChevronRight,
  FaMoneyBillWave,
  FaUser,
} from "react-icons/fa";
import type { PayrollEmployeeSummary } from "../../hooks/usePayrollCalculations";
import type { PayrollConfirmation } from "../../types";
import { formatDateTime } from "../../utils/dateUtils";
import { formatMoney } from "../../utils/payrollUtils";
import { getActivityBadgeColor } from "../../utils/activityColors";

interface PayrollEmployeeCardProps {
  readonly employee: PayrollEmployeeSummary;
  readonly confirmation?: PayrollConfirmation | null;
}

export function PayrollEmployeeCard({
  employee,
  confirmation,
}: PayrollEmployeeCardProps) {
  const confirmedAt = confirmation
    ? formatDateTime(confirmation.confirmed_at)
    : null;
  const paidAt = confirmation?.paid_at
    ? formatDateTime(confirmation.paid_at)
    : null;

  return (
    <div className="rounded-2xl border border-subtle bg-surface shadow-sm shadow-black/5 transition hover:shadow-lg">
      <div className="p-6">
        {/* Employee Info */}
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-muted text-muted">
                <FaUser className="h-5 w-5" />
              </div>
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-lg font-semibold text-primary">
                {employee.employee.name}
              </h3>
              <p className="truncate text-sm text-subtle">
                {employee.employee.email}
              </p>
            </div>
          </div>
          <FaChevronRight className="mt-2 h-4 w-4 flex-shrink-0 text-subtle" />
        </div>

        {/* Salary Summary */}
        <div className="space-y-3">
          <div className="flex flex-wrap gap-2">
            {confirmation && (
              <span
                className="inline-flex items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold text-emerald-600"
                title={confirmedAt ? `Xác nhận lúc ${confirmedAt}` : undefined}
              >
                <FaCheckCircle className="h-3.5 w-3.5" />
                <span className="truncate">Đã xác nhận</span>
              </span>
            )}
            {confirmation?.paid_at ? (
              <span
                className="inline-flex items-center gap-2 rounded-full bg-sky-500/10 px-3 py-1 text-xs font-semibold text-sky-600"
                title={paidAt ? `Đánh dấu thanh toán lúc ${paidAt}` : undefined}
              >
                <FaMoneyBillWave className="h-3.5 w-3.5" />
                <span className="truncate">Đã thanh toán</span>
              </span>
            ) : (
              confirmation && (
                <span className="inline-flex items-center gap-2 rounded-full bg-slate-500/10 px-3 py-1 text-xs font-semibold text-slate-500">
                  <FaMoneyBillWave className="h-3.5 w-3.5" />
                  <span className="truncate">Chưa thanh toán</span>
                </span>
              )
            )}
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-subtle">Tổng lương:</span>
            <span className="text-lg font-semibold text-primary">
              {formatMoney(Math.round(employee.totalSalary))}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm text-subtle">Tổng giờ:</span>
            <span className="text-sm font-semibold text-primary">
              {employee.totalHours.toFixed(1)} giờ
            </span>
          </div>
        </div>

        {/* Activity Summary */}
        {employee.activities.length > 0 && (
          <div className="mt-4 border-t border-subtle pt-4">
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-subtle">
              Hoạt động chính:
            </div>
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
                <span className="inline-flex items-center rounded-full bg-surface-muted px-2 py-1 text-xs font-semibold text-subtle">
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
