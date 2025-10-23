import type { ReactNode } from "react";
import { useMemo } from "react";
import { Spinner } from "../Spinner";
import { SHIFT_TEMPLATES } from "../../constants/shifts";
import type { ScheduleShift } from "../../types";
import { ShiftCard } from "./ShiftCard";
import { useScheduleShifts } from "../../hooks";

export interface DayScheduleViewProps {
  readonly canManage: boolean;
  readonly isLocked: boolean;
  readonly selectedDate: Date;
  readonly onOpenModal: (template: "morning" | "afternoon") => void;
  readonly onEditShift: (shift: ScheduleShift) => void;
  readonly emptyState?: ReactNode;
}

export function DayScheduleView({
  canManage,
  isLocked,
  selectedDate,
  onOpenModal,
  onEditShift,
  emptyState,
}: DayScheduleViewProps) {
  const { data: shifts = [], isLoading } = useScheduleShifts(selectedDate);

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

  return (
    <div className="overflow-hidden rounded-2xl border border-subtle bg-surface shadow-lg shadow-black/10">
      <div className="border-b border-subtle p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-primary">Ca làm việc</h3>
        </div>
      </div>

      <div className="relative p-4">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-b-2xl border-t border-subtle bg-surface/80 backdrop-blur-sm">
            <div className="flex flex-col items-center space-y-3 text-subtle">
              <Spinner />
            </div>
          </div>
        )}

        <div className={`space-y-4 ${isLoading ? "blur-sm" : ""}`}>
          <ShiftColumn
            template="morning"
            canManage={canManage}
            isLocked={isLocked}
            shifts={groupedShifts.morning}
            onOpenModal={onOpenModal}
            onEditShift={onEditShift}
            emptyState={emptyState}
          />

          <ShiftColumn
            template="afternoon"
            canManage={canManage}
            isLocked={isLocked}
            shifts={groupedShifts.afternoon}
            onOpenModal={onOpenModal}
            onEditShift={onEditShift}
            emptyState={emptyState}
          />
        </div>
      </div>
    </div>
  );
}

interface ShiftColumnProps {
  readonly template: "morning" | "afternoon";
  readonly canManage: boolean;
  readonly isLocked: boolean;
  readonly shifts: ScheduleShift[];
  readonly onOpenModal: (template: "morning" | "afternoon") => void;
  readonly onEditShift: (shift: ScheduleShift) => void;
  readonly emptyState?: ReactNode;
}

function ShiftColumn({
  template,
  canManage,
  isLocked,
  shifts,
  onOpenModal,
  onEditShift,
  emptyState,
}: ShiftColumnProps) {
  const details = SHIFT_TEMPLATES[template];

  return (
    <div className="rounded-xl border border-subtle p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center">
          <div
            className={`mr-3 h-3 w-3 rounded-full ${
              template === "morning" ? "bg-orange-400" : "bg-blue-400"
            }`}
          ></div>
          <h4 className="font-semibold text-primary">{details.label}</h4>
          <span className="ml-2 text-sm text-subtle">
            {details.start} - {details.end}
          </span>
        </div>
        {canManage && (
          <button
            onClick={() => onOpenModal(template)}
            disabled={isLocked}
            className={`text-sm font-semibold ${
              isLocked
                ? "cursor-not-allowed text-subtle"
                : "text-blue-400 hover:text-blue-300"
            }`}
          >
            + Thêm người
          </button>
        )}
      </div>

      <div className="space-y-2">
        {shifts.length > 0 ? (
          shifts.map((shift) => (
            <ShiftCard
              key={shift.id}
              shift={shift}
              canManage={canManage}
              isLocked={isLocked}
              onEdit={onEditShift}
            />
          ))
        ) : (
          emptyState ?? (
            <div className="py-8 text-center text-sm text-subtle">
              Chưa có ca làm việc nào được lên lịch
            </div>
          )
        )}
      </div>
    </div>
  );
}
