import { useEffect, useState } from "react";
import { DateNavigation } from "../components/DateNavigation";
import { PageTitle } from "../components/PageTitle";
import { DayScheduleView } from "../components/shift/DayScheduleView";
import { ShiftAssignmentModal } from "../components/shift/ShiftAssignmentModal";
import { ShiftEditModal } from "../components/shift/ShiftEditModal";
import { WeekScheduleView } from "../components/shift/WeekScheduleView";
import {
  isSameDay,
  normalizeDate,
  parseDateFromParam,
} from "../constants/schedule";
import {
  canAccessManagement,
  canManageResources,
} from "../constants/userRoles";
import { useAuth, usePayrollPeriodForDate } from "../hooks";
import type { ScheduleShift } from "../types";
import { formatMonthName } from "../utils/payrollUtils";

interface SchedulePageProps {
  readonly initialDate?: string;
  readonly onDateChange?: (date: Date) => void;
}

export function SchedulePage({
  initialDate,
  onDateChange,
}: SchedulePageProps = {}) {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(() =>
    parseDateFromParam(initialDate)
  );
  const [viewMode, setViewMode] = useState<"day" | "week">("day");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShiftTemplate, setSelectedShiftTemplate] = useState<
    "morning" | "afternoon"
  >("morning");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ScheduleShift | null>(
    null
  );

  const canManage = canManageResources(user?.role);
  const canAccess = canAccessManagement(user?.role);

  const { isLocked, yearMonth } = usePayrollPeriodForDate(selectedDate);

  useEffect(() => {
    if (!initialDate) {
      return;
    }

    const nextDate = parseDateFromParam(initialDate);

    setSelectedDate((prev) => (isSameDay(prev, nextDate) ? prev : nextDate));
  }, [initialDate]);

  if (!user) return null;

  const updateSelectedDate = (date: Date) => {
    const normalized = normalizeDate(date);
    setSelectedDate(normalized);
    onDateChange?.(normalized);
  };

  const handleOpenModal = (shiftTemplate: "morning" | "afternoon") => {
    // Prevent opening modal if period is locked
    if (isLocked || !canManage) return;

    setSelectedShiftTemplate(shiftTemplate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEditShift = (shift: ScheduleShift) => {
    // Prevent editing if period is locked
    if (isLocked || !canManage) return;

    setSelectedShift(shift);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedShift(null);
  };

  return (
    <div className="px-4 py-6 text-primary sm:px-0">
      <PageTitle
        title={canAccess ? "Quản lý ca làm việc" : "Ca làm việc của bạn"}
      />

      <DateNavigation
        selectedDate={selectedDate}
        onDateChange={updateSelectedDate}
      />

      <div className="mb-4 flex justify-end">
        <div className="inline-flex rounded-full bg-surface-muted p-1 text-sm font-semibold text-subtle">
          <button
            type="button"
            onClick={() => setViewMode("day")}
            className={`rounded-full px-4 py-2 transition ${
              viewMode === "day"
                ? "bg-surface text-primary shadow"
                : "text-muted hover:text-primary"
            }`}
            aria-pressed={viewMode === "day"}
          >
            Ngày
          </button>
          <button
            type="button"
            onClick={() => setViewMode("week")}
            className={`rounded-full px-4 py-2 transition ${
              viewMode === "week"
                ? "bg-surface text-primary shadow"
                : "text-muted hover:text-primary"
            }`}
            aria-pressed={viewMode === "week"}
          >
            Tuần
          </button>
        </div>
      </div>

      {/* Payroll Period Lock Warning */}
      {isLocked && (
        <div className="mb-4 rounded-2xl border border-amber-400/40 bg-amber-500/10 p-4 text-amber-100">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-amber-300"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-semibold">Bảng lương đã khóa</h3>
              <div className="mt-1 text-sm">
                Bảng lương tháng {formatMonthName(yearMonth)} đã khóa, vui lòng
                mở lại trước khi chỉnh sửa ca.
              </div>
            </div>
          </div>
        </div>
      )}

      {viewMode === "day" ? (
        <DayScheduleView
          canManage={canManage}
          isLocked={isLocked}
          selectedDate={selectedDate}
          onOpenModal={handleOpenModal}
          onEditShift={handleEditShift}
        />
      ) : (
        <WeekScheduleView selectedDate={selectedDate} canManage={canManage} />
      )}

      <ShiftAssignmentModal
        isOpen={canManage && isModalOpen}
        onClose={handleCloseModal}
        shiftTemplate={selectedShiftTemplate}
        selectedDate={selectedDate}
        isLocked={isLocked}
      />

      <ShiftEditModal
        isOpen={canManage && isEditModalOpen}
        onClose={handleEditModalClose}
        shift={selectedShift}
        isLocked={isLocked}
      />
    </div>
  );
}
