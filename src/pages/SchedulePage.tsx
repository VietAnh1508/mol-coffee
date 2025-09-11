import { useMemo, useState } from "react";
import { PageTitle } from "../components/PageTitle";
import { Spinner } from "../components/Spinner";
import { ShiftAssignmentModal } from "../components/shift/ShiftAssignmentModal";
import { ShiftCard } from "../components/shift/ShiftCard";
import { ShiftEditModal } from "../components/shift/ShiftEditModal";
import { SHIFT_TEMPLATES } from "../constants/shifts";
import { USER_ROLES } from "../constants/userRoles";
import { useAuth, useScheduleShifts } from "../hooks";
import type { ScheduleShift } from "../types";
import { formatDate } from "../utils/dateUtils";

export function SchedulePage() {
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
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

  const handleOpenModal = (shiftTemplate: "morning" | "afternoon") => {
    setSelectedShiftTemplate(shiftTemplate);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleEditShift = (shift: ScheduleShift) => {
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

      {/* Date Navigation */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => {
              const prevDay = new Date(selectedDate);
              prevDay.setDate(prevDay.getDate() - 1);
              setSelectedDate(prevDay);
            }}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            ←
          </button>

          <div className="text-center">
            <h2 className="text-lg font-semibold text-gray-900">
              {formatDate(selectedDate)}
            </h2>
          </div>

          <button
            onClick={() => {
              const nextDay = new Date(selectedDate);
              nextDay.setDate(nextDay.getDate() + 1);
              setSelectedDate(nextDay);
            }}
            className="p-2 text-gray-500 hover:text-gray-700"
          >
            →
          </button>
        </div>

        <button
          onClick={() => setSelectedDate(new Date())}
          className="w-full mt-3 text-blue-500 hover:text-blue-600 text-sm"
        >
          Hôm nay
        </button>
      </div>

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
                  <h4 className="font-medium text-gray-900">Ca sáng</h4>
                  <span className="text-sm text-gray-500 ml-2">
                    {SHIFT_TEMPLATES.morning.start} -{" "}
                    {SHIFT_TEMPLATES.morning.end}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleOpenModal("morning")}
                    className="text-blue-500 hover:text-blue-600 text-sm"
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
                  <h4 className="font-medium text-gray-900">Ca chiều</h4>
                  <span className="text-sm text-gray-500 ml-2">
                    {SHIFT_TEMPLATES.afternoon.start} -{" "}
                    {SHIFT_TEMPLATES.afternoon.end}
                  </span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => handleOpenModal("afternoon")}
                    className="text-blue-500 hover:text-blue-600 text-sm"
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

      {/* Legend */}
      <div className="mt-6 bg-gray-50 rounded-lg p-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Chú thích:</h4>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center">
            <div className="w-3 h-3 bg-orange-400 rounded-full mr-2"></div>
            <span className="text-gray-600">
              Ca sáng ({SHIFT_TEMPLATES.morning.start}-
              {SHIFT_TEMPLATES.morning.end})
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-3 h-3 bg-blue-400 rounded-full mr-2"></div>
            <span className="text-gray-600">
              Ca chiều ({SHIFT_TEMPLATES.afternoon.start}-
              {SHIFT_TEMPLATES.afternoon.end})
            </span>
          </div>
        </div>
      </div>

      {/* Shift Assignment Modal */}
      <ShiftAssignmentModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        shiftTemplate={selectedShiftTemplate}
        selectedDate={selectedDate}
        onSuccess={() => {
          // The data will automatically refresh due to TanStack Query
        }}
      />

      {/* Shift Edit Modal */}
      <ShiftEditModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        shift={selectedShift}
        onSuccess={() => {
          // The data will automatically refresh due to TanStack Query
        }}
      />
    </div>
  );
}
