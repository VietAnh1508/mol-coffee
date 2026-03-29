import { SHIFT_TEMPLATES } from "../../constants/shifts";
import type { ScheduleShift } from "../../types";
import { getActivityBadgeColor } from "../../utils/activityColors";
import { formatTime } from "../../utils/dateUtils";
import { abbreviateName } from "../../utils/nameUtils";

export interface WeekShiftSectionProps {
  readonly borderColorClass: string;
  readonly shifts: ScheduleShift[];
  readonly template: keyof typeof SHIFT_TEMPLATES;
}

export function WeekShiftSection({
  borderColorClass,
  shifts,
  template,
}: WeekShiftSectionProps) {
  const { start: stdStart, end: stdEnd } = SHIFT_TEMPLATES[template];

  return (
    <div className={`border-l-2 pl-2 ${borderColorClass}`}>
      {shifts.length > 0 ? (
        <div className="space-y-0.5">
          {shifts.map((shift) => {
            const startTime = formatTime(shift.start_ts);
            const endTime = formatTime(shift.end_ts);
            const isNonStandard = startTime !== stdStart || endTime !== stdEnd;
            return (
              <div
                key={shift.id}
                className="flex items-start justify-between rounded border border-subtle bg-surface px-2 py-1"
              >
                <div className="flex min-w-0 flex-col">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-primary truncate">
                      {abbreviateName(shift.user?.name)}
                    </span>
                    {shift.activity?.name && (
                      <span
                        className={`inline-flex flex-shrink-0 items-center rounded-full px-1.5 py-px text-[10px] font-semibold ${getActivityBadgeColor(shift.activity.name)}`}
                      >
                        {shift.activity.name}
                      </span>
                    )}
                  </div>
                  {shift.note && (
                    <span className="text-[10px] italic text-subtle">
                      {shift.note}
                    </span>
                  )}
                </div>
                {isNonStandard && (
                  <span className="ml-2 flex-shrink-0 text-[11px] tabular-nums text-orange-400">
                    {startTime} - {endTime}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="px-2 py-1 text-[10px] italic text-subtle">
          Chưa có ai
        </div>
      )}
    </div>
  );
}
