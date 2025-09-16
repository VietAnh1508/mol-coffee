import { useState } from "react";
import { PageTitle } from "../components/PageTitle";
import { PayrollPeriodManager } from "../components/payroll/PayrollPeriodManager";
import { PayrollDataDisplay } from "../components/payroll/PayrollDataDisplay";
import { USER_ROLES } from "../constants/userRoles";
import { useAuth, usePayrollCalculations, usePayrollPeriod } from "../hooks";
import { getCurrentYearMonth, formatMonthName } from "../utils/payrollUtils";
import { Spinner } from "../components/Spinner";

export function PayrollPage() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentYearMonth());

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  // For employees, only show their own data
  const userId = isAdmin ? undefined : user?.id;

  const { data: payrollData, isLoading: isLoadingPayroll } = usePayrollCalculations(
    selectedPeriod,
    userId
  );

  const { data: periodInfo, isLoading: isLoadingPeriod } = usePayrollPeriod(selectedPeriod);

  if (!user) return null;

  const isLoading = isLoadingPayroll || isLoadingPeriod;

  return (
    <div className="px-4 py-6 sm:px-0">
      <PageTitle
        title="Bảng lương"
        subtitle={
          isAdmin
            ? "Quản lý bảng lương tất cả nhân viên"
            : "Xem thông tin lương của bạn"
        }
      />

      <div className="space-y-6">
        {/* Period Manager (Admin only) */}
        {isAdmin && (
          <PayrollPeriodManager
            onPeriodSelect={setSelectedPeriod}
            selectedPeriod={selectedPeriod}
          />
        )}

        {/* Period Selector for Employees */}
        {!isAdmin && (
          <div className="bg-white rounded-lg shadow p-4">
            <label htmlFor="period-select" className="block text-sm font-medium text-gray-700 mb-2">
              Chọn kỳ lương
            </label>
            <select
              id="period-select"
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
          <div className={`rounded-lg p-4 ${
            periodInfo.status === "closed"
              ? "bg-orange-50 border border-orange-200"
              : "bg-green-50 border border-green-200"
          }`}>
            <div className="flex items-center">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                periodInfo.status === "closed"
                  ? "bg-orange-100 text-orange-800"
                  : "bg-green-100 text-green-800"
              }`}>
                {periodInfo.status === "closed" ? "Đã khóa" : "Đang mở"}
              </div>
              <span className="ml-3 text-sm text-gray-600">
                Kỳ lương {formatMonthName(selectedPeriod)}
                {periodInfo.status === "closed" && periodInfo.closed_by_user && (
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
              <span className="ml-3 text-gray-600">Đang tính toán bảng lương...</span>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && (!payrollData || payrollData.length === 0) && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium mb-2">Chưa có dữ liệu lương</h3>
              <p>
                {isAdmin
                  ? "Chưa có lịch làm việc nào trong kỳ này."
                  : "Bạn chưa có lịch làm việc nào trong kỳ này."
                }
              </p>
            </div>
          </div>
        )}

        {/* Payroll Data */}
        {!isLoading && payrollData && payrollData.length > 0 && (
          <PayrollDataDisplay
            payrollData={payrollData}
            selectedPeriod={selectedPeriod}
          />
        )}
      </div>
    </div>
  );
}
