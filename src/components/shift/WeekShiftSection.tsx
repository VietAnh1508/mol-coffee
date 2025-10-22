import type { ScheduleShift } from "../../types";
import { getActivityBadgeColor } from "../../utils/activityColors";
import { formatTime } from "../../utils/dateUtils";

export interface WeekShiftSectionProps {
  readonly colorClass: string;
  readonly shifts: ScheduleShift[];
}

export function WeekShiftSection({
  colorClass,
  shifts,
}: WeekShiftSectionProps) {
  const hasShifts = shifts.length > 0;

  return (
    <div className="relative space-y-1 pl-4">
      <span
        className={`absolute left-0 top-1/2 h-2 w-2 -translate-y-1/2 rounded-full ${colorClass}`}
        aria-hidden
      />
      {hasShifts ? (
        <div className="space-y-1">
          {shifts.map((shift) => (
            <div
              key={shift.id}
              className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs leading-snug text-primary"
            >
              <span className="font-medium">
                {shift.user?.name || "Không xác định"}
              </span>
              {shift.activity?.name && (
                <span
                  className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold ${getActivityBadgeColor(shift.activity.name)}`}
                >
                  {shift.activity.name}
                </span>
              )}
              <span className="text-subtle">
                {formatTime(shift.start_ts)} - {formatTime(shift.end_ts)}
              </span>
              {shift.note && (
                <span className="italic text-subtle">
                  (Ghi chú: {shift.note})
                </span>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-xs italic text-subtle">
          - Chưa có ca
        </div>
      )}
    </div>
  );
}
