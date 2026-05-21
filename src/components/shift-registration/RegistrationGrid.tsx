import type { ShiftTemplate } from "../../constants/shifts";
import { SHIFT_TEMPLATES } from "../../constants/shifts";
import type { ShiftRegistration } from "../../types";
import { formatDateLocal } from "../../utils/dateUtils";
import {
  HEAT_STYLES,
  getDayLabel,
  slotKey,
} from "../../utils/shiftRegistrationUtils";
import { RegistrationCell } from "./RegistrationCell";

const HEAT_LEVELS = [
  "empty",
  "light",
  "fulfilled",
  "busy",
  "crowded",
  "selected",
] as const;
const HEAT_LABELS: Record<string, string> = {
  empty: "Trống",
  light: "Còn chỗ",
  fulfilled: "Đủ",
  busy: "Đông",
  crowded: "Quá tải",
  selected: "Đã chọn",
};

interface Props {
  weekStart: string;
  registrations: ShiftRegistration[];
  selectedSlots: Set<string>;
  isReadOnly: boolean;
  onToggle: (key: string) => void;
}

function buildWeekDays(weekStart: string): Date[] {
  const days: Date[] = [];
  const base = new Date(weekStart + "T00:00:00");
  for (let i = 0; i < 6; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    days.push(d);
  }
  return days;
}

export function RegistrationGrid({
  weekStart,
  registrations,
  selectedSlots,
  isReadOnly,
  onToggle,
}: Props) {
  const days = buildWeekDays(weekStart);

  function cellRegs(
    dayDate: string,
    template: ShiftTemplate,
  ): ShiftRegistration[] {
    return registrations.filter(
      (r) => r.day_date === dayDate && r.shift_template === template,
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {/* legend */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 px-1 pb-1">
        {HEAT_LEVELS.map((level) => (
          <span key={level} className="flex items-center gap-1 text-[11px]">
            <span
              style={{
                backgroundColor: HEAT_STYLES[level].backgroundColor,
                borderColor: HEAT_STYLES[level].borderColor,
              }}
              className="inline-block h-3 w-3 rounded border"
            />
            <span className="text-subtle">{HEAT_LABELS[level]}</span>
          </span>
        ))}
      </div>

      {/* grid */}
      <div className="grid grid-cols-[52px_1fr_1fr] gap-x-1.5 gap-y-1">
        {/* column headers */}
        <div />
        {(["morning", "afternoon"] as ShiftTemplate[]).map((t) => (
          <div key={t} className="text-center text-xs font-medium text-subtle">
            {SHIFT_TEMPLATES[t].label}
          </div>
        ))}

        {/* day rows */}
        {days.map((day, idx) => {
          const dayDate = formatDateLocal(day);
          const label = getDayLabel(day);
          const isWeekend = idx >= 5;

          return (
            <div key={dayDate} className="contents">
              {/* day label */}
              <div
                className={`flex items-center justify-center text-sm font-semibold ${
                  isWeekend ? "text-muted" : "text-primary"
                }`}
              >
                {label}
              </div>

              {/* morning cell */}
              <RegistrationCell
                dayDate={dayDate}
                template="morning"
                registrations={cellRegs(dayDate, "morning")}
                isSelected={selectedSlots.has(slotKey(dayDate, "morning"))}
                isReadOnly={isReadOnly}
                onToggle={onToggle}
              />

              {/* afternoon cell */}
              <RegistrationCell
                dayDate={dayDate}
                template="afternoon"
                registrations={cellRegs(dayDate, "afternoon")}
                isSelected={selectedSlots.has(slotKey(dayDate, "afternoon"))}
                isReadOnly={isReadOnly}
                onToggle={onToggle}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
}
