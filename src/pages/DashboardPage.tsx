import { Link } from "@tanstack/react-router";
import { FaCalendarAlt, FaCog, FaDollarSign, FaUsers } from "react-icons/fa";
import { USER_ROLES } from "../constants/userRoles";
import { useAuth } from "../hooks";

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  return (
    <div className="px-4 py-6 sm:px-0">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">
          Xin chào, {user.name}!
        </h1>

        <div className="grid grid-cols-2 gap-4 mt-8 max-w-sm mx-auto">
          {user.role === USER_ROLES.ADMIN && (
            <Link
              to="/settings"
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow block aspect-square"
            >
              <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-3">
                  <FaCog className="text-white text-lg" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">
                  Cài đặt
                </span>
              </div>
            </Link>
          )}

          {user.role === USER_ROLES.ADMIN && (
            <Link
              to="/employees"
              className="bg-white rounded-lg shadow hover:shadow-md transition-shadow block aspect-square"
            >
              <div className="flex flex-col items-center justify-center h-full p-4">
                <div className="w-12 h-12 bg-orange-500 rounded-lg flex items-center justify-center mb-3">
                  <FaUsers className="text-white text-lg" />
                </div>
                <span className="text-sm font-medium text-gray-900 text-center">
                  Danh sách nhân viên
                </span>
              </div>
            </Link>
          )}

          <Link
            to="/schedule"
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow block aspect-square"
          >
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-3">
                <FaCalendarAlt className="text-white text-lg" />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">
                {user.role === USER_ROLES.ADMIN
                  ? "Quản lý ca làm việc"
                  : "Ca làm việc"}
              </span>
            </div>
          </Link>

          <Link
            to="/payroll"
            className="bg-white rounded-lg shadow hover:shadow-md transition-shadow block aspect-square"
          >
            <div className="flex flex-col items-center justify-center h-full p-4">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-3">
                <FaDollarSign className="text-white text-lg" />
              </div>
              <span className="text-sm font-medium text-gray-900 text-center">
                {user.role === USER_ROLES.ADMIN
                  ? "Bảng lương nhân viên"
                  : "Bảng lương"}
              </span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
