import { PageTitle } from "../components/PageTitle";
import { USER_ROLES } from "../constants/userRoles";
import { useAuth } from "../hooks";

export function PayrollPage() {
  const { user } = useAuth();

  if (!user) return null;

  const isAdmin = user.role === USER_ROLES.ADMIN;

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

      <div className="bg-white rounded-lg shadow">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="text-6xl mb-4">🚧</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">
              Coming soon!
            </h2>
            <p className="text-gray-500">
              Tính năng bảng lương đang được phát triển.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
