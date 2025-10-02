import { useEffect, useMemo, useState } from "react";
import { DateNavigation } from "../components/DateNavigation";
import { PageTitle } from "../components/PageTitle";
import { Spinner } from "../components/Spinner";
import { ShiftAssignmentModal } from "../components/shift/ShiftAssignmentModal";
import { ShiftCard } from "../components/shift/ShiftCard";
import { ShiftEditModal } from "../components/shift/ShiftEditModal";
import {
  isSameDay,
  normalizeDate,
  parseDateFromParam,
} from "../constants/schedule";
import { SHIFT_TEMPLATES } from "../constants/shifts";
import { USER_ROLES } from "../constants/userRoles";
import { useAuth, usePayrollPeriodForDate, useScheduleShifts } from "../hooks";
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
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedShiftTemplate, setSelectedShiftTemplate] = useState<
    "morning" | "afternoon"
  >("morning");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedShift, setSelectedShift] = useState<ScheduleShift | null>(
    null
  );

  const isAdmin = user?.role === USER_ROLES.ADMIN;

  const { data: shifts = [], isLoading } = useScheduleShifts(selectedDate);
  const { isLocked, yearMonth } = usePayrollPeriodForDate(selectedDate);

  useEffect(() => {
    if (!initialDate) {
      return;
    }

    const nextDate = parseDateFromParam(initialDate);

    setSelectedDate((prev) => (isSameDay(prev, nextDate) ? prev : nextDate));
  }, [initialDate]);

  // Group shifts by template (morning/afternoon)
  const groupedShifts = useMemo(() => {
    const groups = {
      morning: [] as ScheduleShift[],
      afternoon: [] as ScheduleShift[],
    };

    shifts.forEach((shift) => {
      if (
        shift.template_name === "morning" ||
        shift.template_name === "afternoon"
      ) {
        groups[shift.template_name].push(shift);
      }
    });

    return groups;
  }, [shifts]);

  if (!user) return null;

  const updateSelectedDate = (date: Date) => {
    const normalized = normalizeDate(date);
    setSelectedDate(normalized);
    onDateChange?.(normalized);
  };

  const handleOpenModal = (shiftTemplate: "morning" | "afternoon") => {
    // Prevent opening modal if period is locked
    if (isLocked) return;

    setSelectedShiftTemplate(shiftTemplate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEditShift = (shift: ScheduleShift) => {
    // Prevent editing if period is locked
    if (isLocked) return;

    setSelectedShift(shift);
    setIsEditModalOpen(true);
  };

  const handleEditModalClose = () => {
    setIsEditModalOpen(false);
    setSelectedShift(null);
  };

  return (
    <div className="px-4 py-6 sm:px-0">
      <PageTitle
        title={isAdmin ? "Quản lý ca làm việc" : "Ca làm việc của bạn"}
      />

      <DateNavigation
        selectedDate={selectedDate}
        onDateChange={updateSelectedDate}
      />

      {/* Payroll Period Lock Warning */}
      {isLocked && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-yellow-400"
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
              <h3 className="text-sm font-medium text-yellow-800">
                Bảng lương đã khóa
              </h3>
              <div className="mt-1 text-sm text-yellow-700">
                Bảng lương tháng {formatMonthName(yearMonth)} đã khóa, vui lòng
                mở lại trước khi chỉnh sửa ca.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Schedule Grid */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <div className="flex justify-between items-center">
            <h3 className="font-medium text-gray-900">Ca làm việc</h3>
          </div>
        </div>

        <div className="p-4 relative">
          {/* Loading Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-sm rounded-b-lg flex items-center justify-center z-10">
              <div className="flex flex-col items-center space-y-3">
                <Spinner />
              </div>
            </div>
          )}

          <div className={`space-y-4 ${isLoading ? "blur-sm" : ""}`}>
            {/* Morning Shift */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-orange-400 rounded-full mr-3"></div>
                  <h4 className="font-medium text-gray-900">
                    {SHIFT_TEMPLATES.morning.label}
                  </h4>
                  <span className="text-sm text-gray-500 ml-2">
                    {SHIFT_TEMPLATES.morning.start} -{" "}
                    {SHIFT_TEMPLATES.morning.end}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleOpenModal("morning")}
                    disabled={isLocked}
                    className={`text-sm ${
                      isLocked
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-500 hover:text-blue-600"
                    }`}
                  >
                    + Thêm người
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {groupedShifts.morning.length > 0 ? (
                  groupedShifts.morning.map((shift) => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      isAdmin={isAdmin}
                      isLocked={isLocked}
                      onEdit={handleEditShift}
                    />
                  ))
                ) : (
                  <div className="text-sm text-gray-500 text-center py-8">
                    Chưa có ca làm việc nào được lên lịch
                  </div>
                )}
              </div>
            </div>

            {/* Afternoon Shift */}
            <div className="border border-gray-200 rounded-lg p-4">
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-400 rounded-full mr-3"></div>
                  <h4 className="font-medium text-gray-900">
                    {SHIFT_TEMPLATES.afternoon.label}
                  </h4>
                  <span className="text-sm text-gray-500 ml-2">
                    {SHIFT_TEMPLATES.afternoon.start} -{" "}
                    {SHIFT_TEMPLATES.afternoon.end}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleOpenModal("afternoon")}
                    disabled={isLocked}
                    className={`text-sm ${
                      isLocked
                        ? "text-gray-400 cursor-not-allowed"
                        : "text-blue-500 hover:text-blue-600"
                    }`}
                  >
                    + Thêm người
                  </button>
                )}
              </div>

              <div className="space-y-2">
                {groupedShifts.afternoon.length > 0 ? (
                  groupedShifts.afternoon.map((shift) => (
                    <ShiftCard
                      key={shift.id}
                      shift={shift}
                      isAdmin={isAdmin}
                      isLocked={isLocked}
                      onEdit={handleEditShift}
                    />
                  ))
                ) : (
                  <div className="text-sm text-gray-500 text-center py-8">
                    Chưa có ca làm việc nào được lên lịch
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <ShiftAssignmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        shiftTemplate={selectedShiftTemplate}
        selectedDate={selectedDate}
        isLocked={isLocked}
      />

      <ShiftEditModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        shift={selectedShift}
        isLocked={isLocked}
      />
    </div>
  );
}
