import type { IconType } from "react-icons";
import { PiBreadFill, PiBriefcaseFill, PiCoffeeFill, PiSparkle, PiStudentFill } from "react-icons/pi";
import { SHIFT_TEMPLATES } from "../../constants/shifts";
import type { ScheduleShift } from "../../types";
import { getActivityIconColor } from "../../utils/activityColors";
import { formatTime } from "../../utils/dateUtils";
import { abbreviateName } from "../../utils/nameUtils";

function getActivityIcon(name: string): IconType {
  const n = name.toLowerCase();
  if (n.includes("cà phê") || n.includes("cafe") || n.includes("coffee")) return PiCoffeeFill;
  if (n.includes("bánh") || n.includes("banh")) return PiBreadFill;
  if (n.includes("quản lý") || n.includes("quan ly")) return PiBriefcaseFill;
  if (n.includes("thử việc") || n.includes("thu viec")) return PiStudentFill;
  return PiSparkle;
}

export interface WeekShiftSectionProps {
  readonly shifts: ScheduleShift[];
  readonly template: keyof typeof SHIFT_TEMPLATES;
}

export function WeekShiftSection({ shifts, template }: WeekShiftSectionProps) {
  const { start: stdStart, end: stdEnd } = SHIFT_TEMPLATES[template];

  return (
    <div className={`rounded border divide-y divide-subtle/10 ${
      template === "morning"
        ? "border-orange-400/20 bg-orange-500/[0.06]"
        : "border-blue-400/20 bg-blue-500/[0.06]"
    }`}>
      {shifts.length > 0 ? (
        shifts.map((shift) => {
          const startTime = formatTime(shift.start_ts);
          const endTime = formatTime(shift.end_ts);
          const isNonStandard = startTime !== stdStart || endTime !== stdEnd;
          return (
            <div key={shift.id} className="flex min-w-0 flex-col px-2 py-1">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-primary truncate">
                  {abbreviateName(shift.user?.name)}
                </span>
                {shift.activity?.name && (() => {
                  const Icon = getActivityIcon(shift.activity.name);
                  return (
                    <Icon
                      className={`flex-shrink-0 ${getActivityIconColor(shift.activity.name)}`}
                      size={13}
                      title={shift.activity.name}
                      aria-label={shift.activity.name}
                    />
                  );
                })()}
              </div>
              {isNonStandard && (
                <span className="text-[11px] tabular-nums text-orange-400">
                  {startTime} - {endTime}
                </span>
              )}
              {shift.note && (
                <span className="text-[10px] italic text-subtle">
                  {shift.note}
                </span>
              )}
            </div>
          );
        })
      ) : (
        <div className="px-2 py-1 text-[10px] italic text-subtle">
          Chưa có ai
        </div>
      )}
    </div>
  );
}

