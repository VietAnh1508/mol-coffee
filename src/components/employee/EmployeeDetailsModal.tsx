import type { ReactNode } from "react";
import { USER_ROLES } from "../../constants/userRoles";
import {
  useToast,
  useToggleUserRole,
  useToggleUserStatus,
  useUser,
  useUsers,
} from "../../hooks";
import type { User } from "../../types";
import { CurrentUserBadge } from "../CurrentUserBadge";
import { Spinner } from "../Spinner";

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

  const renderOverlay = (content: ReactNode) => (
    <div
      className="fixed inset-0 z-50 flex h-full w-full items-center justify-center bg-black/60 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-subtle bg-surface p-6 shadow-2xl shadow-black/30"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </div>
    </div>
  );

  if (isLoading) {
    return renderOverlay(
      <div className="flex items-center justify-center py-12 text-subtle">
        <Spinner />
        <span className="ml-3 text-sm">Đang tải...</span>
      </div>
    );
  }

  if (error || !employee) {
    return renderOverlay(
      <div className="text-center">
        <p className="text-sm text-rose-300">
          Có lỗi xảy ra khi tải thông tin nhân viên
        </p>
        <button
          onClick={onClose}
          className="mt-4 rounded-xl border border-subtle px-4 py-2 text-sm font-semibold text-subtle transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface"
        >
          Đóng
        </button>
      </div>
    );
  }

  const isLastAdmin = (emp: User) => {
    if (emp.role !== USER_ROLES.ADMIN) return false;
    const adminCount = employees.filter(
      (e) => e.role === USER_ROLES.ADMIN
    ).length;
    return adminCount === 1;
  };

  const canToggleRole = (emp: User) => {
    if (emp.id === currentUser?.id && emp.role === USER_ROLES.ADMIN)
      return false;
    if (isLastAdmin(emp)) return false;
    return true;
  };

  const canToggleStatus = (emp: User) => {
    if (emp.id === currentUser?.id && emp.status === "active") return false;
    return true;
  };

  return renderOverlay(
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-primary">
          Thông tin nhân viên
        </h3>
        <button
          onClick={onClose}
          className="rounded-full p-2 text-muted transition hover:bg-surface-muted hover:text-primary"
        >
          <span className="sr-only">Đóng</span>
          <svg
            className="h-5 w-5"
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

      <div className="space-y-4 text-sm">
        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Tên
          </label>
          <p className="mt-1 text-primary">
            {employee.name}
            <CurrentUserBadge user={employee} className="ml-2" />
          </p>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Email
          </label>
          <p className="mt-1 text-primary">{employee.email}</p>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Số điện thoại
          </label>
          <p className="mt-1 text-primary">{employee.phone}</p>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Vai trò
          </label>
          <div className="mt-1 flex items-center justify-between">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                employee.role === USER_ROLES.ADMIN
                  ? "bg-purple-500/15 text-purple-400"
                  : "bg-blue-500/15 text-blue-400"
              }`}
            >
              {employee.role === USER_ROLES.ADMIN
                ? "Quản trị viên"
                : "Nhân viên"}
            </span>
            {canToggleRole(employee) && (
              <button
                onClick={() => toggleRoleMutation.mutate(employee)}
                disabled={toggleRoleMutation.isPending}
                className="text-sm font-semibold text-blue-400 transition hover:text-blue-300 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {employee.role === USER_ROLES.ADMIN ? "Hạ cấp" : "Thăng chức"}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold uppercase tracking-wide text-subtle">
            Trạng thái
          </label>
          <div className="mt-1 flex items-center justify-between">
            <span
              className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                employee.status === "active"
                  ? "bg-emerald-500/15 text-emerald-400"
                  : "bg-rose-500/15 text-rose-400"
              }`}
            >
              {employee.status === "active" ? "Hoạt động" : "Không hoạt động"}
            </span>
            {canToggleStatus(employee) && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleStatusMutation.mutate(employee)}
                  disabled={toggleStatusMutation.isPending}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface disabled:cursor-not-allowed disabled:opacity-60 ${
                    employee.status === "active"
                      ? "bg-emerald-500/60"
                      : "bg-surface-muted"
                  }`}
                >
                  {toggleStatusMutation.isPending ? (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Spinner size="sm" />
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
                <span className="text-sm text-subtle">
                  {toggleStatusMutation.isPending
                    ? "Đang cập nhật..."
                    : employee.status === "active"
                      ? "Hoạt động"
                      : "Tạm dừng"}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button
          onClick={onClose}
          className="rounded-xl border border-subtle px-4 py-2 text-sm font-semibold text-subtle transition hover:bg-surface-muted focus:outline-none focus:ring-2 focus:ring-blue-300 focus:ring-offset-2 focus:ring-offset-surface"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
