import { useMemo } from "react";
import {
  getWeekRange,
  isSameDay,
  normalizeDate,
} from "../../constants/schedule";
import { useScheduleShiftsByDateRange } from "../../hooks";
import type { ScheduleShift } from "../../types";
import { formatDateDMY, formatDateLocal } from "../../utils/dateUtils";
import { Spinner } from "../Spinner";
import { WeekShiftSection } from "./WeekShiftSection";

interface WeekScheduleViewProps {
  readonly selectedDate: Date;
  readonly canManage?: boolean;
}

export function WeekScheduleView({
  selectedDate,
  canManage = false,
}: WeekScheduleViewProps) {
  const weekRange = useMemo(() => getWeekRange(selectedDate), [selectedDate]);
  const { data: weekShifts = [], isLoading } = useScheduleShiftsByDateRange(
    weekRange.start,
    weekRange.endExclusive
  );

  const weekEndDate = useMemo(() => {
    const endDate = new Date(weekRange.start);
    endDate.setDate(endDate.getDate() + 6);
    return endDate;
  }, [weekRange.start]);

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
    <div className="overflow-hidden rounded-2xl border border-subtle bg-surface shadow-lg shadow-black/10">
      <div className="border-b border-subtle p-4">
        <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
          <h3 className="text-base font-semibold text-primary">
            Lịch tuần {formatDateDMY(weekRange.start)} -{" "}
            {formatDateDMY(weekEndDate)}
          </h3>
          {canManage && (
            <span className="text-[11px] text-subtle">
              Chế độ xem tuần chỉ đọc. Chuyển sang "Ngày" để chỉnh sửa.
            </span>
          )}
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

        <div
          className={`grid gap-2 ${isLoading ? "blur-sm" : ""} sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 2xl:grid-cols-7`}
        >
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
                className={`flex flex-col rounded-lg border border-subtle bg-surface-muted/50 p-2 shadow-sm shadow-black/5 ${
                  isToday ? "ring-1 ring-blue-400/60" : ""
                }`}
              >
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-semibold uppercase text-subtle">
                      {day.toLocaleDateString("vi-VN", { weekday: "narrow" })}
                    </span>
                    <span className="text-xs font-semibold text-primary">
                      {formatDateDMY(day)}
                    </span>
                  </div>
                  {isToday && (
                    <span className="inline-flex items-center rounded-full bg-blue-500/15 px-1.5 text-[10px] font-semibold text-blue-400">
                      Hôm nay
                    </span>
                  )}
                </div>
                <div className="mt-2 space-y-2 text-xs text-primary">
                  <WeekShiftSection
                    colorClass="bg-orange-400"
                    shifts={grouped.morning}
                  />
                  <hr className="border-subtle/40" />
                  <WeekShiftSection
                    colorClass="bg-blue-400"
                    shifts={grouped.afternoon}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
