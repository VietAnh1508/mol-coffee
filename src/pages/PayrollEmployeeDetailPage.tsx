import { useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { FaCalendarAlt } from "react-icons/fa";
import { BackLink } from "../components/common/BackLink";
import { PageTitle } from "../components/PageTitle";
import { PayrollConfirmationStatus } from "../components/payroll/PayrollConfirmationStatus";
import { PayrollDailyBreakdown } from "../components/payroll/PayrollDailyBreakdown";
import { PayrollPaymentStatus } from "../components/payroll/PayrollPaymentStatus";
import { Spinner } from "../components/Spinner";
import {
  canAccessManagement,
  isAdmin,
  isEmployee,
} from "../constants/userRoles";
import { useAuth } from "../hooks/useAuth";
import {
  usePayrollCalculations,
  usePayrollDailyBreakdown,
} from "../hooks/usePayrollCalculations";
import {
  usePayrollPeriod,
  usePayrollPeriods,
} from "../hooks/usePayrollPeriods";
import { formatMoney, formatMonthName } from "../utils/payrollUtils";

interface PayrollEmployeeDetailPageProps {
  readonly employeeId: string;
  readonly period: string;
}

export function PayrollEmployeeDetailPage({
  employeeId,
  period,
}: PayrollEmployeeDetailPageProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedPeriod, setSelectedPeriod] = useState(period);

  const handlePeriodChange = (newPeriod: string) => {
    setSelectedPeriod(newPeriod);
    navigate({
      to: "/payroll/employee/$employeeId",
      params: { employeeId },
      search: { period: newPeriod },
      replace: true,
    });
  };

  const { data: payrollPeriods, isLoading: isLoadingPeriods } =
    usePayrollPeriods();
  const { data: payrollData, isLoading: isLoadingPayroll } =
    usePayrollCalculations(selectedPeriod, employeeId);

  const { data: dailyData } = usePayrollDailyBreakdown(
    selectedPeriod,
    employeeId,
  );

  const { data: periodInfo, isLoading: isLoadingPeriod } =
    usePayrollPeriod(selectedPeriod);
  const payrollPeriodId = periodInfo?.id ?? null;

  useEffect(() => {
    if (!payrollPeriods || payrollPeriods.length === 0) return;

    const hasSelectedPeriod = payrollPeriods.some(
      (payrollPeriod) => payrollPeriod.year_month === selectedPeriod,
    );

    if (!hasSelectedPeriod) {
      // Guard against stale deep links or recently deleted periods by falling back to the latest
      const latestPeriod = payrollPeriods[0].year_month;
      setSelectedPeriod(latestPeriod);
      navigate({
        to: "/payroll/employee/$employeeId",
        params: { employeeId },
        search: { period: latestPeriod },
        replace: true,
      });
    }
  }, [employeeId, navigate, payrollPeriods, selectedPeriod]);

  if (!user) return null;

  const isLoading = isLoadingPayroll || isLoadingPeriod || isLoadingPeriods;
  const canAccess = canAccessManagement(user.role);
  const isAdminUser = isAdmin(user.role);
  const isEmployeeUser = isEmployee(user.role);
  const isOwnData = user.id === employeeId;
  const employeeData = payrollData?.[0];

  // Calculate total working days
  const totalWorkingDays = dailyData
    ? new Set(dailyData.map((entry) => entry.date)).size
    : 0;

  // Get month options for period selector
  const monthOptions =
    payrollPeriods?.map((payrollPeriod) => ({
      value: payrollPeriod.year_month,
      label: formatMonthName(payrollPeriod.year_month),
    })) ?? [];

  return (
    <>
      <div className="px-4 py-6 sm:px-0">
        {/* Back Button */}
        {canAccess && (
          <div className="mb-4">
            <BackLink to="/payroll" label="Quay lại danh sách" />
          </div>
        )}

        {/* Page Title */}
        <div className="mb-6">
          <PageTitle
            title={
              employeeData
                ? `Bảng lương - ${employeeData.employee.name}`
                : "Bảng lương"
            }
            subtitle={
              isOwnData
                ? "Xem thông tin lương của bạn"
                : employeeData?.employee.email ||
                  "Chi tiết bảng lương nhân viên"
            }
          />
        </div>

        <div className="space-y-6">
          {/* Period Selector */}
          <div className="rounded-2xl border border-subtle bg-surface p-4 shadow-lg shadow-black/5">
            <div className="flex items-center justify-between">
              <label
                htmlFor="period-select"
                className="flex items-center text-sm font-medium text-subtle"
              >
                <FaCalendarAlt className="mr-2 h-4 w-4" />
                Chọn kỳ lương
              </label>
              <select
                id="period-select"
                value={selectedPeriod}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-primary focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
                disabled={isLoadingPeriods || monthOptions.length === 0}
              >
                {isLoadingPeriods && selectedPeriod && (
                  <option value={selectedPeriod}>
                    {formatMonthName(selectedPeriod)}
                  </option>
                )}
                {isLoadingPeriods && (
                  <option value="">Đang tải kỳ lương...</option>
                )}
                {!isLoadingPeriods && monthOptions.length === 0 && (
                  <option value="">Chưa có kỳ lương khả dụng</option>
                )}
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Period Status Banner */}
          {periodInfo && (
            <div
              className={`rounded-2xl border p-4 ${
                periodInfo.status === "closed"
                  ? "border-amber-400/40 bg-amber-500/10"
                  : "border-emerald-400/40 bg-emerald-500/10"
              }`}
            >
              <div className="flex flex-wrap items-center gap-3">
                <div
                  className={`inline-flex min-w-[5.5rem] items-center justify-center rounded-full px-3 py-1 text-xs font-semibold ${
                    periodInfo.status === "closed"
                      ? "bg-amber-500/25 text-amber-500"
                      : "bg-emerald-500/25 text-emerald-500"
                  }`}
                >
                  {periodInfo.status === "closed" ? "Đã khóa" : "Đang mở"}
                </div>
                <div className="text-sm text-subtle">
                  <div>Kỳ lương {formatMonthName(selectedPeriod)}</div>
                  {periodInfo.status === "closed" &&
                    periodInfo.closed_by_user && (
                      <div>Khóa bởi {periodInfo.closed_by_user.name}</div>
                    )}
                </div>
              </div>
            </div>
          )}

          {/* Loading State */}
          {isLoading && (
            <div className="rounded-2xl border border-subtle bg-surface p-8 shadow-lg shadow-black/5">
              <div className="flex items-center justify-center text-subtle">
                <Spinner />
                <span className="ml-3">Đang tải thông tin lương...</span>
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
                <p>
                  {isOwnData || isEmployeeUser
                    ? "Bạn chưa có lịch làm việc nào trong kỳ này."
                    : "Nhân viên này chưa có lịch làm việc nào trong kỳ này."}
                </p>
              </div>
            </div>
          )}

          {/* Employee Payroll Details */}
          {!isLoading && employeeData && (
            <div className="overflow-hidden rounded-2xl border border-subtle bg-surface shadow-lg shadow-black/5">
              {/* Employee Header */}
              <div className="border-b border-subtle p-6">
                <div className="flex items-center justify-center">
                  <div className="space-y-6 text-center">
                    <div>
                      <div className="mb-1 text-sm text-subtle">Tổng lương</div>
                      <div className="text-3xl font-semibold text-primary">
                        {formatMoney(Math.round(employeeData.totalSalary))}
                      </div>
                    </div>
                    <div className="flex items-center justify-center space-x-8 text-subtle">
                      <div className="text-center">
                        <div className="mb-1 text-xs uppercase tracking-wide">
                          Tổng giờ làm
                        </div>
                        <div className="text-lg font-semibold text-primary">
                          {employeeData.totalHours.toFixed(1)} giờ
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="mb-1 text-xs uppercase tracking-wide">
                          Tổng ngày làm
                        </div>
                        <div className="text-lg font-semibold text-primary">
                          {totalWorkingDays} ngày
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 grid w-full gap-4 sm:grid-cols-2">
                      <PayrollConfirmationStatus
                        payrollPeriodId={payrollPeriodId}
                        employeeId={employeeId}
                        isOwnData={isOwnData}
                        isAdmin={isAdminUser}
                        period={selectedPeriod}
                      />
                      <PayrollPaymentStatus
                        payrollPeriodId={payrollPeriodId}
                        employeeId={employeeId}
                        isAdmin={isAdminUser}
                        period={selectedPeriod}
                      />
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
                  {employeeData.activities.map((activity) => (
                    <div
                      key={activity.activity.id}
                      className="rounded-xl border border-subtle bg-surface-muted px-3 py-2"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          {activity.activity.name}
                        </span>
                        <div className="text-sm font-semibold text-primary">
                          {formatMoney(Math.round(activity.subtotal))}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-subtle">
                        ({activity.hours.toFixed(1)} giờ ×{" "}
                        {formatMoney(activity.rate)}/giờ)
                      </div>
                    </div>
                  ))}

                  {/* Lunch Allowance Summary */}
                  {(employeeData.lunchAllowanceDays ?? 0) > 0 && (
                    <div className="rounded-xl border border-subtle bg-surface-muted px-3 py-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-primary">
                          Phụ cấp ăn trưa
                        </span>
                        <div className="text-sm font-semibold text-primary">
                          {formatMoney(
                            Math.round(employeeData.lunchAllowanceTotal || 0),
                          )}
                        </div>
                      </div>
                      <div className="mt-1 text-sm text-subtle">
                        ({employeeData.lunchAllowanceDays} ngày)
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Daily Breakdown */}
              <PayrollDailyBreakdown
                yearMonth={selectedPeriod}
                userId={employeeId}
              />
            </div>
          )}
        </div>
      </div>
    </>
  );
}
