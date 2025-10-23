import { useState } from "react";
import { PageTitle } from "../components/PageTitle";
import { PayrollDataDisplay } from "../components/payroll/PayrollDataDisplay";
import { PayrollPeriodManager } from "../components/payroll/PayrollPeriodManager";
import { Spinner } from "../components/Spinner";
import {
  canAccessManagement,
  canManageResources,
  isEmployee,
} from "../constants/userRoles";
import { useAuth, usePayrollCalculations, usePayrollPeriod } from "../hooks";
import { formatMonthName, getCurrentYearMonth } from "../utils/payrollUtils";

export function PayrollPage() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentYearMonth());

  const canManage = canManageResources(user?.role);
  const canAccess = canAccessManagement(user?.role);
  const isEmployeeUser = isEmployee(user?.role);

  // For employees, only show their own data
  const userId = isEmployeeUser ? user?.id : undefined;

  const { data: payrollData, isLoading: isLoadingPayroll } =
    usePayrollCalculations(selectedPeriod, userId);

  const { data: periodInfo, isLoading: isLoadingPeriod } =
    usePayrollPeriod(selectedPeriod);

  if (!user) return null;

  const isLoading = isLoadingPayroll || isLoadingPeriod;

  return (
    <div className="px-4 py-6 text-primary sm:px-0">
      <PageTitle
        title="Bảng lương"
        subtitle={
          canAccess
            ? "Quản lý bảng lương tất cả nhân viên"
            : "Xem thông tin lương của bạn"
        }
      />

      <div className="space-y-6">
        {/* Period Manager (Admin only) */}
        {canAccess && (
          <PayrollPeriodManager
            onPeriodSelect={setSelectedPeriod}
            selectedPeriod={selectedPeriod}
            canManage={canManage}
          />
        )}

        {/* Period Selector for Employees */}
        {!canAccess && (
          <div className="rounded-2xl border border-subtle bg-surface p-4 shadow-lg shadow-black/5">
            <label
              htmlFor="period-select"
              className="mb-2 block text-sm font-medium text-subtle"
            >
              Chọn kỳ lương
            </label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
            >
              <option value={getCurrentYearMonth()}>
                {formatMonthName(getCurrentYearMonth())}
              </option>
              {/* Add more months as needed */}
            </select>
          </div>
        )}

        {/* Period Status Banner */}
        {periodInfo && (
          <div
            className={`rounded-2xl border p-4 ${
              periodInfo.status === "closed"
                ? "border-amber-400/40 bg-amber-500/10"
                : "border-emerald-400/40 bg-emerald-500/10"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                  periodInfo.status === "closed"
                    ? "bg-amber-500/25 text-amber-200"
                    : "bg-emerald-500/25 text-emerald-200"
                }`}
              >
                {periodInfo.status === "closed" ? "Đã khóa" : "Đang mở"}
              </div>
              <span className="ml-3 text-sm text-subtle">
                Kỳ lương {formatMonthName(selectedPeriod)}
                {periodInfo.status === "closed" &&
                  periodInfo.closed_by_user && (
                    <> - Khóa bởi {periodInfo.closed_by_user.name}</>
                  )}
              </span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-2xl border border-subtle bg-surface p-8 shadow-lg shadow-black/5">
            <div className="flex items-center justify-center text-subtle">
              <Spinner />
              <span className="ml-3">Đang tính toán bảng lương...</span>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && (!payrollData || payrollData.length === 0) && (
          <div className="rounded-2xl border border-subtle bg-surface p-8 text-center text-subtle shadow-lg shadow-black/5">
            <div>
              <div className="mb-4 text-4xl">📊</div>
              <h3 className="mb-2 text-lg font-semibold text-primary">
                Chưa có dữ liệu lương
              </h3>
              <p className="text-sm">
                {canAccess
                  ? "Chưa có lịch làm việc nào trong kỳ này."
                  : "Bạn chưa có lịch làm việc nào trong kỳ này."}
              </p>
            </div>
          </div>
        )}

        {/* Payroll Data */}
        {!isLoading && payrollData && payrollData.length > 0 && (
          <PayrollDataDisplay
            payrollData={payrollData}
            selectedPeriod={selectedPeriod}
            canViewSummary={canAccess}
          />
        )}
      </div>
    </div>
  );
}
