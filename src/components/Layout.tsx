import type { ReactNode } from "react";
import { useState, useRef, useEffect } from "react";
import { Link, useRouterState } from '@tanstack/react-router'
import { useAuth } from "../hooks";
import { HiUser, HiChevronDown } from "react-icons/hi2";

interface LayoutProps {
  readonly children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();
  const router = useRouterState()
  const currentPath = router.location.pathname
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {user && (
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center space-x-8">
                <Link
                  to="/dashboard"
                  className="flex items-center space-x-2 text-xl font-semibold text-gray-900 hover:text-blue-600"
                >
                  <img
                    src="/mol-house-logo.jpg"
                    alt="MoL House Logo"
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <span>MoL Coffee</span>
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
              <div className="flex items-center">
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center space-x-1 p-2 rounded-full hover:bg-gray-100 transition-colors"
                  >
                    <HiUser className="w-5 h-5 text-gray-600" />
                    <HiChevronDown className={`w-4 h-4 text-gray-600 transform transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {isDropdownOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                      <div className="py-1">
                        <div className="px-4 py-2 text-sm text-gray-700 border-b border-gray-100">
                          <div className="font-medium">{user.name}</div>
                          <div className="text-xs text-gray-500 capitalize">
                            {user.role === 'admin' ? 'Quản trị viên' : user.role}
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            signOut();
                            setIsDropdownOpen(false);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700"
                        >
                          Đăng xuất
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
    </div>
  );
}
