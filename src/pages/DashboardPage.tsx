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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {user.role === USER_ROLES.ADMIN && (
            <Link
              to="/settings"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow block"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-purple-500 rounded-md flex items-center justify-center">
                      <FaCog className="text-white text-sm" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          Cài đặt
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {user.role === USER_ROLES.ADMIN && (
            <Link
              to="/employees"
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow block"
            >
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 bg-orange-500 rounded-md flex items-center justify-center">
                      <FaUsers className="text-white text-sm" />
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">
                          Danh sách nhân viên
                        </div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </Link>
          )}

          <Link
            to="/schedule"
            className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow block"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-blue-500 rounded-md flex items-center justify-center">
                    <FaCalendarAlt className="text-white text-sm" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {user.role === USER_ROLES.ADMIN
                          ? "Quản lý ca làm việc"
                          : "Ca làm việc"}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </Link>

          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="w-8 h-8 bg-green-500 rounded-md flex items-center justify-center">
                    <FaDollarSign className="text-white text-sm" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dd>
                      <div className="text-lg font-medium text-gray-900">
                        {user.role === USER_ROLES.ADMIN
                          ? "Bảng lương nhân viên"
                          : "Bảng lương"}
                      </div>
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
