import type { ReactNode } from "react";
import { Link, useRouterState } from '@tanstack/react-router'
import { useAuth } from "../context/AuthContext";

interface LayoutProps {
  readonly children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouterState()
  const currentPath = router.location.pathname

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link
                  to="/dashboard"
                  className="text-xl font-semibold text-gray-900 hover:text-blue-600"
                >
                  MoL Coffee
                </Link>
                <div className="hidden sm:flex space-x-6">
                  <Link
                    to="/dashboard"
                    className={`text-sm font-medium ${
                      currentPath === '/dashboard'
                        ? 'text-blue-600 border-b-2 border-blue-600 pb-4'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Trang chủ
                  </Link>
                  {user.role === 'admin' && (
                    <Link
                      to="/settings"
                      className={`text-sm font-medium ${
                        currentPath === '/settings'
                          ? 'text-blue-600 border-b-2 border-blue-600 pb-4'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Cài đặt
                    </Link>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {user.name} ({user.role})
                </span>
                <button
                  onClick={signOut}
                  className="text-sm text-red-600 hover:text-red-800 hover:cursor-pointer"
                >
                  Đăng xuất
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
