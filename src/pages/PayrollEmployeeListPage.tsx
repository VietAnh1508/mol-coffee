import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { PageTitle } from "../components/PageTitle";
import { PayrollPeriodManager } from "../components/payroll/PayrollPeriodManager";
import { PayrollEmployeeCard } from "../components/payroll/PayrollEmployeeCard";
import { useAuth, usePayrollCalculations, usePayrollPeriod } from "../hooks";
import { getCurrentYearMonth, formatMonthName } from "../utils/payrollUtils";
import { Spinner } from "../components/Spinner";

export function PayrollEmployeeListPage() {
  const { user } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState(getCurrentYearMonth());

  const { data: payrollData, isLoading: isLoadingPayroll } = usePayrollCalculations(
    selectedPeriod
  );

  const { data: periodInfo, isLoading: isLoadingPeriod } = usePayrollPeriod(selectedPeriod);

  if (!user) return null;

  const isLoading = isLoadingPayroll || isLoadingPeriod;

  // Calculate summary data for admin cards
  const totalEmployees = payrollData?.length || 0;
  const totalHours = payrollData?.reduce((sum, emp) => sum + emp.totalHours, 0) || 0;
  const totalSalary = payrollData?.reduce((sum, emp) => sum + emp.totalSalary, 0) || 0;

  return (
    <div className="px-4 py-6 sm:px-0">
      <PageTitle
        title="Bảng lương"
        subtitle="Quản lý bảng lương tất cả nhân viên"
      />

      <div className="space-y-6">
        {/* Period Manager */}
        <PayrollPeriodManager
          onPeriodSelect={setSelectedPeriod}
          selectedPeriod={selectedPeriod}
        />

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

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Tổng nhân viên
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {totalEmployees}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">Tổng giờ làm</div>
            <div className="text-2xl font-bold text-gray-900">
              {totalHours.toFixed(1)}
            </div>
          </div>
          <div className="bg-white rounded-lg shadow p-6">
            <div className="text-sm font-medium text-gray-500">
              Tổng tiền lương
            </div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(totalSalary).toLocaleString("vi-VN")} ₫
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-center justify-center">
              <Spinner />
              <span className="ml-3 text-gray-600">Đang tải danh sách nhân viên...</span>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && (!payrollData || payrollData.length === 0) && (
          <div className="bg-white rounded-lg shadow p-8">
            <div className="text-center text-gray-500">
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-medium mb-2">Chưa có dữ liệu lương</h3>
              <p>Chưa có lịch làm việc nào trong kỳ này.</p>
            </div>
          </div>
        )}

        {/* Employee List */}
        {!isLoading && payrollData && payrollData.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Danh sách nhân viên
              </h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {payrollData.map((employee) => (
                <Link
                  key={employee.employee.id}
                  to="/payroll/employee/$employeeId"
                  params={{ employeeId: employee.employee.id }}
                  search={{ period: selectedPeriod }}
                  className="block"
                >
                  <PayrollEmployeeCard
                    employee={employee}
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