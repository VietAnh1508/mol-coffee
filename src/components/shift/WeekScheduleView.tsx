import { useMemo } from "react";
import {
  getWeekRange,
  isSameDay,
  normalizeDate,
} from "../../constants/schedule";
import { SHIFT_TEMPLATES } from "../../constants/shifts";
import { useScheduleShiftsByDateRange } from "../../hooks";
import type { ScheduleShift } from "../../types";
import { formatDateLocal } from "../../utils/dateUtils";
import { Spinner } from "../Spinner";
import { WeekShiftSection } from "./WeekShiftSection";

interface WeekScheduleViewProps {
  readonly selectedDate: Date;
  readonly canManage?: boolean;
}

export function WeekScheduleView({
  selectedDate,
}: WeekScheduleViewProps) {
  const weekRange = getWeekRange(selectedDate);
  const { data: weekShifts = [], isLoading } = useScheduleShiftsByDateRange(
    weekRange.start,
    weekRange.endExclusive
  );

  const weekShiftsByDay = useMemo(() => {
    const shiftsGroupedByDay = new Map<
      string,
      { morning: ScheduleShift[]; afternoon: ScheduleShift[] }
    >();

    weekShifts.forEach((shift) => {
      if (
        shift.template_name !== "morning" &&
        shift.template_name !== "afternoon"
      ) {
        return;
      }

      const shiftDate = normalizeDate(new Date(shift.start_ts));
      const dayKey = formatDateLocal(shiftDate);

      if (!shiftsGroupedByDay.has(dayKey)) {
        shiftsGroupedByDay.set(dayKey, { morning: [], afternoon: [] });
      }

      shiftsGroupedByDay.get(dayKey)?.[shift.template_name].push(shift);
    });

    return shiftsGroupedByDay;
  }, [weekShifts]);

  const today = useMemo(() => normalizeDate(new Date()), []);

  return (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl bg-surface/80 backdrop-blur-sm">
          <Spinner />
        </div>
      )}

      <div className={isLoading ? "blur-sm" : ""}>
        {/* Column headers */}
        <div className="mb-1 grid grid-cols-[52px_1fr_1fr] gap-1.5">
          <div />
          {(["morning", "afternoon"] as const).map((t) => (
            <div key={t} className="flex flex-col items-center">
              <div className="flex items-center gap-1">
                <span className={`h-1.5 w-1.5 rounded-full flex-shrink-0 ${t === "morning" ? "bg-orange-400" : "bg-blue-400"}`} aria-hidden />
                <span className="text-[11px] font-semibold text-primary">{SHIFT_TEMPLATES[t].label}</span>
              </div>
              <span className="text-[10px] text-subtle">{SHIFT_TEMPLATES[t].start}–{SHIFT_TEMPLATES[t].end}</span>
            </div>
          ))}
        </div>

        <div className="divide-y divide-subtle/40">
          {weekRange.days.map((day) => {
            const dayKey = formatDateLocal(day);
            const grouped = weekShiftsByDay.get(dayKey) ?? {
              morning: [],
              afternoon: [],
            };
            const isToday = isSameDay(day, today);

            return (
              <div
                key={dayKey}
                className={`grid grid-cols-[52px_1fr_1fr] gap-1.5 py-2 ${
                  isToday ? "rounded-lg bg-blue-500/5 px-1" : ""
                }`}
              >
                <div className="flex flex-shrink-0 flex-col items-center pt-0.5">
                  <span className="text-[10px] font-semibold uppercase text-subtle">
                    {day.toLocaleDateString("vi-VN", { weekday: "narrow" })}
                  </span>
                  <span
                    className={`text-lg font-bold leading-tight ${
                      isToday ? "text-blue-400" : "text-primary"
                    }`}
                  >
                    {day.getDate()}
                  </span>
                </div>

                <WeekShiftSection
                  shifts={grouped.morning}
                  template="morning"
                />
                <WeekShiftSection
                  shifts={grouped.afternoon}
                  template="afternoon"
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
