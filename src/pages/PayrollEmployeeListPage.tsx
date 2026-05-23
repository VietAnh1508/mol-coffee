import { Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { PageTitle } from "../components/PageTitle";
import { PayrollEmployeeCard } from "../components/payroll/PayrollEmployeeCard";
import { PayrollPeriodManager } from "../components/payroll/PayrollPeriodManager";
import { Spinner } from "../components/Spinner";
import { canManageResources } from "../constants/userRoles";
import {
  useAuth,
  usePayrollCalculations,
  usePayrollConfirmations,
  usePayrollPeriod,
} from "../hooks";
import type { PayrollConfirmation } from "../types";
import { formatMonthName } from "../utils/payrollUtils";

export function PayrollEmployeeListPage() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState<string | null>(null);

  const { data: payrollData, isLoading: isLoadingPayroll } =
    usePayrollCalculations(selectedPeriod);

  const { data: periodInfo, isLoading: isLoadingPeriod } =
    usePayrollPeriod(selectedPeriod);
  const periodId = periodInfo?.id ?? null;
  const { data: payrollConfirmations } = usePayrollConfirmations(periodId);

  const payrollConfirmationByUserId = useMemo(() => {
    const map: Record<string, PayrollConfirmation> = {};
    (payrollConfirmations ?? []).forEach((confirmation) => {
      map[confirmation.user_id] = confirmation;
    });
    return map;
  }, [payrollConfirmations]);

  if (!user) return null;

  const hasSelectedPeriod = Boolean(selectedPeriod);
  const isLoading =
    hasSelectedPeriod && (isLoadingPayroll || isLoadingPeriod);
  const canManage = canManageResources(user.role);

  // Calculate summary data for admin cards
  const totalEmployees = payrollData?.length || 0;
  const totalHours =
    payrollData?.reduce((sum, emp) => sum + emp.totalHours, 0) || 0;
  const totalSalary =
    payrollData?.reduce((sum, emp) => sum + emp.totalSalary, 0) || 0;

  return (
    <div className="px-4 py-6 text-primary sm:px-0">
      <PageTitle
        title="Bảng lương"
        subtitle="Quản lý bảng lương tất cả nhân viên"
      />

      <div className="space-y-6">
        {/* Period Manager */}
        <PayrollPeriodManager
          onPeriodSelect={setSelectedPeriod}
          selectedPeriod={selectedPeriod}
          canManage={canManage}
        />

        {/* Period Status Banner */}
        {hasSelectedPeriod && periodInfo && (
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
                    ? "bg-amber-500/25 text-amber-400"
                    : "bg-emerald-500/25 text-emerald-400"
                }`}
              >
                {periodInfo.status === "closed" ? "Đã khóa" : "Đang mở"}
              </div>
              <span className="ml-3 text-sm text-subtle">
                Kỳ lương {selectedPeriod && formatMonthName(selectedPeriod)}
                {periodInfo.status === "closed" &&
                  periodInfo.closed_by_user && (
                    <> - Khóa bởi {periodInfo.closed_by_user.name}</>
                  )}
              </span>
            </div>
          </div>
        )}

        {/* Summary Cards */}
        {hasSelectedPeriod && (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-lg shadow-black/5">
              <div className="text-sm font-medium text-subtle">
                Tổng nhân viên
              </div>
              <div className="text-2xl font-semibold text-primary">
                {totalEmployees}
              </div>
            </div>
            <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-lg shadow-black/5">
              <div className="text-sm font-medium text-subtle">
                Tổng giờ làm
              </div>
              <div className="text-2xl font-semibold text-primary">
                {totalHours.toFixed(1)}
              </div>
            </div>
            <div className="rounded-2xl border border-subtle bg-surface p-6 shadow-lg shadow-black/5">
              <div className="text-sm font-medium text-subtle">
                Tổng tiền lương
              </div>
              <div className="text-2xl font-semibold text-primary">
                {Math.round(totalSalary).toLocaleString("vi-VN")} ₫
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {hasSelectedPeriod && isLoading && (
          <div className="rounded-2xl border border-subtle bg-surface p-8 shadow-lg shadow-black/5">
            <div className="flex items-center justify-center text-subtle">
              <Spinner />
              <span className="ml-3">Đang tải danh sách nhân viên...</span>
            </div>
          </div>
        )}

        {/* No Data State */}
        {hasSelectedPeriod &&
          !isLoading &&
          (!payrollData || payrollData.length === 0) && (
            <div className="rounded-2xl border border-subtle bg-surface p-8 text-center text-subtle shadow-lg shadow-black/5">
              <div>
                <div className="mb-4 text-4xl">📊</div>
                <h3 className="mb-2 text-lg font-semibold text-primary">
                  Chưa có dữ liệu lương
              </h3>
              <p>Chưa có lịch làm việc nào trong kỳ này.</p>
              </div>
            </div>
          )}

        {/* Employee List */}
        {hasSelectedPeriod &&
          !isLoading &&
          payrollData &&
          payrollData.length > 0 && (
            <div>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-semibold text-primary">
                  Danh sách nhân viên
                </h3>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {payrollData.map((employee) => (
                <Link
                  key={employee.employee.id}
                  to="/payroll/employee/$employeeId"
                  params={{ employeeId: employee.employee.id }}
                  {...(selectedPeriod ? { search: { period: selectedPeriod } } : {})}
                  className="block"
                >
                    <PayrollEmployeeCard
                      employee={employee}
                      confirmation={
                        payrollConfirmationByUserId[employee.employee.id]
                      }
                    />
                  </Link>
                ))}
              </div>
            </div>
          )}
      </div>
    </div>
  );
}
