import { useToast, useToggleUserRole, useToggleUserStatus, useUser, useUsers } from "../../hooks";
import { USER_ROLES } from "../../constants/userRoles";
import type { User } from "../../types";

interface EmployeeDetailsModalProps {
  employeeId: string | null;
  currentUser: User | null;
  onClose: () => void;
}

export function EmployeeDetailsModal({
  employeeId,
  currentUser,
  onClose,
}: EmployeeDetailsModalProps) {
  const { showSuccess, showError } = useToast();

  // Fetch employee data directly in the modal
  const { data: employee, isLoading, error } = useUser(employeeId);
  const { data: employees = [] } = useUsers();

  const toggleRoleMutation = useToggleUserRole({
    onSuccess: (data) => {
      showSuccess(
        `Đã ${data.role === USER_ROLES.ADMIN ? "thăng chức" : "hạ cấp"} ${data.name} thành công`
      );
    },
    onError: () => {
      showError("Có lỗi xảy ra khi thay đổi vai trò");
    },
  });

  const toggleStatusMutation = useToggleUserStatus({
    onSuccess: (data) => {
      showSuccess(
        `Đã ${data.status === "active" ? "kích hoạt" : "vô hiệu hóa"} ${data.name} thành công`
      );
    },
    onError: () => {
      showError("Có lỗi xảy ra khi thay đổi trạng thái");
    },
  });

  if (!employeeId) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-3">Đang tải...</span>
          </div>
        </div>
      </div>
    );
  }

  if (error || !employee) {
    return (
      <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50" onClick={onClose}>
        <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white" onClick={(e) => e.stopPropagation()}>
          <div className="text-center py-12">
            <p className="text-red-600">Có lỗi xảy ra khi tải thông tin nhân viên</p>
            <button
              onClick={onClose}
              className="mt-4 px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  const isCurrentUser = (emp: User) => {
    return emp.id === currentUser?.id;
  };

  const isLastAdmin = (emp: User) => {
    if (emp.role !== USER_ROLES.ADMIN) return false;
    const adminCount = employees.filter((e) => e.role === USER_ROLES.ADMIN).length;
    return adminCount === 1;
  };

  const canToggleRole = (emp: User) => {
    if (isCurrentUser(emp) && emp.role === USER_ROLES.ADMIN) return false;
    if (isLastAdmin(emp)) return false;
    return true;
  };

  const canToggleStatus = (emp: User) => {
    if (isCurrentUser(emp) && emp.status === "active") return false;
    return true;
  };

  return (
    <div
      className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
      onClick={onClose}
    >
      <div
        className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">
              Thông tin nhân viên
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <span className="sr-only">Đóng</span>
              <svg
                className="h-6 w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Tên
              </label>
              <p className="mt-1 text-sm text-gray-900">
                {employee.name}
                {isCurrentUser(employee) && (
                  <span className="ml-2 inline-flex rounded-full px-2 py-1 text-xs font-semibold bg-yellow-100 text-yellow-800">
                    Bạn
                  </span>
                )}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Số điện thoại
              </label>
              <p className="mt-1 text-sm text-gray-900">{employee.phone}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Vai trò
              </label>
              <div className="mt-1 flex items-center justify-between">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    employee.role === USER_ROLES.ADMIN
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {employee.role === USER_ROLES.ADMIN ? "Quản trị viên" : "Nhân viên"}
                </span>
                {canToggleRole(employee) && (
                  <button
                    onClick={() => toggleRoleMutation.mutate(employee)}
                    disabled={toggleRoleMutation.isPending}
                    className="text-sm text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                  >
                    {employee.role === USER_ROLES.ADMIN ? "Hạ cấp" : "Thăng chức"}
                  </button>
                )}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Trạng thái
              </label>
              <div className="mt-1 flex items-center justify-between">
                <span
                  className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                    employee.status === "active"
                      ? "bg-green-100 text-green-800"
                      : "bg-red-100 text-red-800"
                  }`}
                >
                  {employee.status === "active" ? "Hoạt động" : "Không hoạt động"}
                </span>
                {canToggleStatus(employee) && (
                  <div className="flex items-center">
                    <button
                      onClick={() => {
                        toggleStatusMutation.mutate(employee);
                      }}
                      disabled={toggleStatusMutation.isPending}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 ${
                        employee.status === "active"
                          ? "bg-green-600"
                          : "bg-gray-200"
                      }`}
                    >
                      {toggleStatusMutation.isPending ? (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                        </div>
                      ) : (
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            employee.status === "active"
                              ? "translate-x-6"
                              : "translate-x-1"
                          }`}
                        />
                      )}
                    </button>
                    <span className="ml-2 text-sm text-gray-600">
                      {toggleStatusMutation.isPending
                        ? "Đang cập nhật..."
                        : (employee.status === "active" ? "Hoạt động" : "Tạm dừng")}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="inline-flex justify-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-transparent rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
