import { Link } from "@tanstack/react-router";
import type { IconType } from "react-icons";
import { FaCalendarAlt, FaCog, FaDollarSign, FaUsers } from "react-icons/fa";
import { NextShiftNotice } from "../components/NextShiftNotice";
import { USER_ROLES } from "../constants/userRoles";
import { useAuth } from "../hooks";

export function DashboardPage() {
  const { user } = useAuth();

  if (!user) return null;

  const shortcuts = [
    user.role === USER_ROLES.ADMIN && {
      to: "/settings",
      title: "Cài đặt",
      icon: FaCog,
      iconBg: "bg-purple-500",
    },
    user.role === USER_ROLES.ADMIN && {
      to: "/employees",
      title: "Danh sách nhân viên",
      icon: FaUsers,
      iconBg: "bg-orange-500",
    },
    {
      to: "/schedule",
      title:
        user.role === USER_ROLES.ADMIN ? "Quản lý ca làm việc" : "Ca làm việc",
      icon: FaCalendarAlt,
      iconBg: "bg-blue-500",
    },
    {
      to: "/payroll",
      title:
        user.role === USER_ROLES.ADMIN ? "Bảng lương nhân viên" : "Bảng lương",
      icon: FaDollarSign,
      iconBg: "bg-emerald-500",
    },
  ].filter(Boolean) as Array<ShortcutCard>;

  return (
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-x-10 -top-16 h-48 rounded-full bg-gradient-to-r from-blue-500/15 via-purple-500/10 to-blue-400/15 blur-3xl" />

      <header className="text-center sm:text-left">
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-primary sm:text-4xl">
          Xin chào,{" "}
          <span className="bg-gradient-to-r from-blue-500 via-purple-500 to-sky-500 bg-clip-text text-transparent">
            {user.name}
          </span>
          !
        </h1>
        <div className="mt-4 space-y-2 text-sm text-subtle">
          <NextShiftNotice user={user} />
        </div>
      </header>

      <div className="mt-8 grid grid-cols-2 gap-4 max-w-md mx-auto sm:max-w-2xl">
        {shortcuts.map(({ to, title, icon: Icon, iconBg }) => (
          <Link
            key={to}
            to={to}
            className="group flex flex-col items-center gap-4 rounded-2xl border border-subtle bg-surface p-6 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-400 focus-visible:ring-offset-2 focus-visible:ring-offset-page"
            aria-label={title}
          >
            <span
              className={`flex h-12 w-12 items-center justify-center rounded-xl text-white shadow-lg shadow-black/10 ${iconBg}`}
            >
              <Icon className="h-5 w-5" />
            </span>
            <span className="text-sm font-semibold text-primary">{title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}

interface ShortcutCard {
  to: string;
  title: string;
  icon: IconType;
  iconBg: string;
}
