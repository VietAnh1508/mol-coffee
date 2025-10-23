import { Link } from "@tanstack/react-router";
import type { PropsWithChildren } from "react";
import { useEffect, useRef, useState } from "react";
import { HiChevronDown, HiUser } from "react-icons/hi2";
import { getRoleLabel } from "../constants/userRoles";
import { ToastProvider } from "../context/ToastContext";
import { useAuth, useToast } from "../hooks";
import { ProfileCompletionModal } from "./ProfileCompletionModal";
import { Toast } from "./Toast";

export function Layout({ children }: PropsWithChildren) {
  return (
    <ToastProvider>
      <LayoutContent>{children}</LayoutContent>
    </ToastProvider>
  );
}

function LayoutContent({ children }: PropsWithChildren) {
  const { user, signOut, isProfileComplete } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { toast, hideToast } = useToast();

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen bg-page text-primary transition-colors">
      {user && !isProfileComplete && <ProfileCompletionModal user={user} />}

      {user && (
        <nav className="border-b border-subtle bg-surface/90 backdrop-blur">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Link
              to="/dashboard"
              className="flex items-center gap-3 rounded-full border border-transparent px-3 py-1.5 transition hover:border-blue-200 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
            >
              <img
                src="/mol-house-logo.jpg"
                alt="MoL House Logo"
                className="h-9 w-9 rounded-full object-cover shadow-md shadow-black/10"
              />
              <div className="flex flex-col">
                <span className="text-lg font-semibold text-primary">
                  MoL Coffee
                </span>
              </div>
            </Link>

            <div className="flex items-center">
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center gap-2 rounded-full border border-transparent px-3 py-2 text-sm font-medium text-muted transition hover:border-blue-200 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface"
                  aria-expanded={isDropdownOpen}
                >
                  <HiUser className="h-5 w-5 text-blue-500" />
                  <span className="hidden sm:inline text-primary">
                    {user.name}
                  </span>
                  <HiChevronDown
                    className={`h-4 w-4 text-muted transition-transform ${isDropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-subtle bg-surface shadow-xl shadow-black/10">
                    <div className="border-b border-subtle bg-surface px-4 py-3">
                      <p className="text-sm font-semibold text-primary">
                        {user.name}
                      </p>
                      <p className="text-xs uppercase tracking-wide text-subtle">
                        {getRoleLabel(user.role)}
                      </p>
                    </div>
                    <div className="py-1">
                      <Link
                        to="/profile"
                        onClick={() => setIsDropdownOpen(false)}
                        className="block px-4 py-2 text-sm text-primary transition hover:bg-surface-muted"
                      >
                        Thông tin cá nhân
                      </Link>
                      <button
                        onClick={() => {
                          signOut();
                          setIsDropdownOpen(false);
                        }}
                        className="flex w-full items-center gap-2 px-4 py-2 text-sm font-medium text-red-500 transition hover:bg-red-500/10"
                      >
                        Đăng xuất
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </nav>
      )}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">{children}</main>
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </div>
  );
}
