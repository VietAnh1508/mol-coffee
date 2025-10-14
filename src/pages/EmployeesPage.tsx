import { useState } from "react";
import { HiCheckCircle, HiPencilSquare, HiXCircle } from "react-icons/hi2";
import { CurrentUserBadge } from "../components/CurrentUserBadge";
import { EmployeeDetailsModal } from "../components/employee/EmployeeDetailsModal";
import { PageTitle } from "../components/PageTitle";
import { Spinner } from "../components/Spinner";
import { USER_ROLES } from "../constants/userRoles";
import { useAuth, useUsers } from "../hooks";

export function EmployeesPage() {
  const { user } = useAuth();
  const { data: employees = [], isLoading, error } = useUsers();
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );
  const [showInactive, setShowInactive] = useState(false);

  const filteredEmployees = showInactive
    ? employees
    : employees.filter((employee) => employee.status === "active");

  const closeModal = () => {
    setSelectedEmployeeId(null);
  };

  if (!user) return null;

  if (isLoading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="text-center text-subtle">
          <Spinner size="lg" />
          <p className="mt-2 text-sm">Đang tải...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-6 text-rose-100">
        <h3 className="text-sm font-semibold">Lỗi tải danh sách nhân viên</h3>
        <p className="mt-2 text-sm">
          {error?.message || "Đã xảy ra lỗi khi tải dữ liệu"}
        </p>
      </div>
    );
  }

  return (
    <div className="px-4 py-6 text-primary sm:px-0">
      <PageTitle
        title="Danh sách nhân viên"
        subtitle="Quản lý tất cả nhân viên trong hệ thống"
      />

      {!isLoading && !error && (
        <div className="mt-4 flex justify-end">
          <label className="flex items-center gap-2 rounded-xl border border-subtle bg-surface px-3 py-2 text-sm text-subtle shadow-sm">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="h-4 w-4 rounded border-subtle text-blue-500 focus:ring-blue-400"
            />
            <span>Hiển thị nhân viên không hoạt động</span>
          </label>
        </div>
      )}

      {!isLoading && !error && (
        <div className="mt-6 space-y-4">
          {filteredEmployees.map((employee) => (
            <div
              key={employee.id}
              className="rounded-2xl border border-subtle bg-surface p-5 shadow-lg shadow-black/5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1 space-y-2">
                  <p className="text-base font-semibold text-primary">
                    {employee.name}
                  </p>
                  <div className="flex flex-wrap items-center gap-2">
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
                    <CurrentUserBadge user={employee} />
                    {employee.status === "active" ? (
                      <HiCheckCircle
                        className="h-5 w-5 text-emerald-400"
                        title="Hoạt động"
                      />
                    ) : (
                      <HiXCircle
                        className="h-5 w-5 text-rose-400"
                        title="Không hoạt động"
                      />
                    )}
                  </div>
                  <p className="text-sm text-subtle">{employee.phone}</p>
                </div>
                <button
                  onClick={() => setSelectedEmployeeId(employee.id)}
                  className="flex-shrink-0 rounded-xl border border-subtle bg-surface-muted px-3 py-2 text-sm font-semibold text-subtle transition hover:bg-surface focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-surface"
                  title="Chỉnh sửa"
                >
                  <HiPencilSquare className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <EmployeeDetailsModal
        employeeId={selectedEmployeeId}
        currentUser={user}
        onClose={closeModal}
      />
    </div>
  );
}
