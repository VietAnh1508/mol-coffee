import { Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { FaArrowLeft, FaCalendarAlt } from "react-icons/fa";
import { PageTitle } from "../components/PageTitle";
import { PayrollDailyBreakdown } from "../components/payroll/PayrollDailyBreakdown";
import { Spinner } from "../components/Spinner";
import { USER_ROLES } from "../constants/userRoles";
import {
  useAuth,
  usePayrollCalculations,
  usePayrollDailyBreakdown,
  usePayrollPeriod,
} from "../hooks";
import {
  formatMoney,
  formatMonthName,
  generateMonthOptions,
} from "../utils/payrollUtils";

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

  const { data: payrollData, isLoading: isLoadingPayroll } =
    usePayrollCalculations(selectedPeriod, employeeId);

  const { data: dailyData } = usePayrollDailyBreakdown(
    selectedPeriod,
    employeeId
  );

  const { data: periodInfo, isLoading: isLoadingPeriod } =
    usePayrollPeriod(selectedPeriod);

  if (!user) return null;

  const isLoading = isLoadingPayroll || isLoadingPeriod;
  const isAdmin = user.role === USER_ROLES.ADMIN;
  const isOwnData = user.id === employeeId;
  const employeeData = payrollData?.[0];

  // Calculate total working days
  const totalWorkingDays = dailyData
    ? new Set(dailyData.map((entry) => entry.date)).size
    : 0;

  // Get month options for period selector
  const monthOptions = generateMonthOptions();

  return (
    <div className="px-4 py-6 sm:px-0">
      {/* Back Button */}
      {isAdmin && (
        <div className="mb-4">
          <Link
            to="/payroll"
            className="inline-flex items-center text-gray-600 hover:text-gray-900 transition-colors"
          >
            <FaArrowLeft className="w-4 h-4 mr-2" />
            Quay lại danh sách
          </Link>
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
              : employeeData?.employee.email || "Chi tiết bảng lương nhân viên"
          }
        />
      </div>

      <div className="space-y-6">
        {/* Period Selector */}
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center justify-between">
            <label
              htmlFor="period-select"
              className="flex items-center text-sm font-medium text-gray-700"
            >
              <FaCalendarAlt className="w-4 h-4 mr-2" />
              Chọn kỳ lương
            </label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
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
            className={`rounded-lg p-4 ${
              periodInfo.status === "closed"
                ? "bg-orange-50 border border-orange-200"
                : "bg-green-50 border border-green-200"
            }`}
          >
            <div className="flex items-center">
              <div
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  periodInfo.status === "closed"
                    ? "bg-orange-100 text-orange-800"
                    : "bg-green-100 text-green-800"
                }`}
              >
                {periodInfo.status === "closed" ? "Đã khóa" : "Đang mở"}
              </div>
              <span className="ml-3 text-sm text-gray-600">
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
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-center">
              <Spinner />
              <span className="ml-3 text-gray-600">
                Đang tải thông tin lương...
              </span>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && (!payrollData || payrollData.length === 0) && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium mb-2">
                Chưa có dữ liệu lương
              </h3>
              <p>
                {isOwnData
                  ? "Bạn chưa có lịch làm việc nào trong kỳ này."
                  : "Nhân viên này chưa có lịch làm việc nào trong kỳ này."}
              </p>
            </div>
          </div>
        )}

        {/* Employee Payroll Details */}
        {!isLoading && employeeData && (
          <div className="bg-white rounded-lg shadow">
            {/* Employee Header */}
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-center">
                <div className="text-center space-y-4">
                  <div>
                    <div className="text-sm text-gray-500 mb-1">Tổng lương</div>
                    <div className="text-3xl font-bold text-gray-900">
                      {formatMoney(Math.round(employeeData.totalSalary))}
                    </div>
                  </div>
                  <div className="flex items-center justify-center space-x-8">
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        Tổng giờ làm
                      </div>
                      <div className="text-lg font-medium text-gray-700">
                        {employeeData.totalHours.toFixed(1)} giờ
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-xs text-gray-500 mb-1">
                        Tổng ngày làm
                      </div>
                      <div className="text-lg font-medium text-gray-700">
                        {totalWorkingDays} ngày
                      </div>
                    </div>
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
                {employeeData.activities.map((activity) => (
                  <div
                    key={activity.activity.id}
                    className="py-2 px-3 bg-gray-50 rounded-md"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        {activity.activity.name}
                      </span>
                      <div className="text-sm font-medium text-gray-900">
                        {formatMoney(Math.round(activity.subtotal))}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
                      ({activity.hours.toFixed(1)} giờ × {formatMoney(activity.rate)}/giờ)
                    </div>
                  </div>
                ))}

                {/* Lunch Allowance Summary */}
                {(employeeData.lunchAllowanceDays ?? 0) > 0 && (
                  <div className="py-2 px-3 bg-gray-50 rounded-md">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-900">
                        Phụ cấp ăn trưa
                      </span>
                      <div className="text-sm font-medium text-gray-900">
                        {formatMoney(
                          Math.round(employeeData.lunchAllowanceTotal || 0)
                        )}
                      </div>
                    </div>
                    <div className="text-sm text-gray-500 mt-1">
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
  );
}
