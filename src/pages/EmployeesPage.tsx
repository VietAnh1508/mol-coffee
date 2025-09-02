import { useState } from "react";
import { EmployeeDetailsModal } from "../components/EmployeeDetailsModal";
import { Toast } from "../components/Toast";
import { useAuth, useToast, useUsers } from "../hooks";
import type { User } from "../types";

export function EmployeesPage() {
  const { user } = useAuth();
  const { data: employees = [], isLoading, error } = useUsers();
  const [selectedEmployee, setSelectedEmployee] = useState<User | null>(null);
  const { toast, hideToast } = useToast();

  const isCurrentUser = (employee: User) => {
    return employee.id === user?.id;
  };

  const closeModal = () => {
    setSelectedEmployee(null);
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="px-4 py-6 sm:px-0">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">
                Lỗi tải danh sách nhân viên
              </h3>
              <p className="mt-2 text-sm text-red-700">
                {error?.message || "Đã xảy ra lỗi khi tải dữ liệu"}
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h1 className="text-xl font-semibold text-gray-900">
            Danh sách nhân viên
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Quản lý tất cả nhân viên trong hệ thống
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {employees.map((employee) => (
          <div
            key={employee.id}
            className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {employee.name}
                      {isCurrentUser(employee) && (
                        <span className="ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">
                          Bạn
                        </span>
                      )}
                    </p>
                    <p className="text-sm text-gray-500">{employee.phone}</p>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        employee.role === "admin"
                          ? "bg-purple-100 text-purple-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {employee.role === "admin"
                        ? "Quản trị viên"
                        : "Nhân viên"}
                    </span>
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        employee.status === "active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {employee.status === "active"
                        ? "Hoạt động"
                        : "Không hoạt động"}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setSelectedEmployee(employee)}
                className="ml-4 inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Chỉnh sửa
              </button>
            </div>
          </div>
        ))}
      </div>

      <EmployeeDetailsModal
        employee={selectedEmployee}
        currentUser={user}
        employees={employees}
        onClose={closeModal}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
