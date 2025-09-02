import {
  useDeleteUser,
  useToast,
  useToggleUserRole,
  useToggleUserStatus,
} from "../hooks";
import type { User } from "../types";

interface EmployeeDetailsModalProps {
  employee: User | null;
  currentUser: User | null;
  employees: User[];
  onClose: () => void;
}

export function EmployeeDetailsModal({
  employee,
  currentUser,
  employees,
  onClose,
}: EmployeeDetailsModalProps) {
  const { showSuccess, showError } = useToast();

  const toggleRoleMutation = useToggleUserRole({
    onSuccess: (data) => {
      showSuccess(
        `Đã ${data.role === "admin" ? "thăng chức" : "hạ cấp"} ${data.name} thành công`
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

  const deleteUserMutation = useDeleteUser({
    onSuccess: () => {
      showSuccess("Đã xóa nhân viên thành công");
      onClose();
    },
    onError: () => {
      showError("Có lỗi xảy ra khi xóa nhân viên");
    },
  });

  if (!employee) return null;

  const isCurrentUser = (emp: User) => {
    return emp.id === currentUser?.id;
  };

  const isLastAdmin = (emp: User) => {
    if (emp.role !== "admin") return false;
    const adminCount = employees.filter((e) => e.role === "admin").length;
    return adminCount === 1;
  };

  const canToggleRole = (emp: User) => {
    if (isCurrentUser(emp) && emp.role === "admin") return false;
    if (isLastAdmin(emp)) return false;
    return true;
  };

  const canToggleStatus = (emp: User) => {
    if (isCurrentUser(emp) && emp.status === "active") return false;
    return true;
  };

  const canDeleteUser = (emp: User) => {
    if (isCurrentUser(emp)) return false;
    return true;
  };

  const handleDeleteEmployee = () => {
    if (window.confirm("Bạn có chắc chắn muốn xóa nhân viên này không?")) {
      deleteUserMutation.mutate(employee.id);
    }
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
                    employee.role === "admin"
                      ? "bg-purple-100 text-purple-800"
                      : "bg-blue-100 text-blue-800"
                  }`}
                >
                  {employee.role === "admin" ? "Quản trị viên" : "Nhân viên"}
                </span>
                {canToggleRole(employee) && (
                  <button
                    onClick={() => toggleRoleMutation.mutate(employee)}
                    disabled={toggleRoleMutation.isPending}
                    className="text-sm text-indigo-600 hover:text-indigo-900 disabled:opacity-50"
                  >
                    {employee.role === "admin" ? "Hạ cấp" : "Thăng chức"}
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
                  {employee.status === "active"
                    ? "Hoạt động"
                    : "Không hoạt động"}
                </span>
                {canToggleStatus(employee) && (
                  <button
                    onClick={() => toggleStatusMutation.mutate(employee)}
                    disabled={toggleStatusMutation.isPending}
                    className="text-sm text-yellow-600 hover:text-yellow-900 disabled:opacity-50"
                  >
                    {employee.status === "active" ? "Vô hiệu hóa" : "Kích hoạt"}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-between">
            <div>
              {canDeleteUser(employee) && (
                <button
                  onClick={handleDeleteEmployee}
                  disabled={deleteUserMutation.isPending}
                  className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50"
                >
                  Xóa nhân viên
                </button>
              )}
            </div>
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
