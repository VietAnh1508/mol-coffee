import type { ShiftTemplate } from "../constants/shifts";
import { SHIFT_TEMPLATES } from "../constants/shifts";

export type HeatLevel =
  | "empty"
  | "light"
  | "fulfilled"
  | "busy"
  | "crowded"
  | "selected";

export const SHIFT_CAPS: Record<ShiftTemplate, number> = {
  morning: 3,
  afternoon: 1,
};

export function getHeatLevel(
  count: number,
  template: ShiftTemplate,
  isSelected: boolean,
): HeatLevel {
  if (isSelected) return "selected";
  if (template === "morning") {
    if (count === 0) return "empty";
    if (count <= 2) return "light";
    if (count === 3) return "fulfilled";
    if (count <= 5) return "busy";
    return "crowded";
  }
  // afternoon (cap 1)
  if (count === 0) return "empty";
  if (count === 1) return "fulfilled";
  if (count <= 3) return "busy";
  return "crowded";
}

export const HEAT_STYLES: Record<
  HeatLevel,
  { backgroundColor: string; borderColor: string; color: string }
> = {
  empty: {
    backgroundColor: "#F4F4F4",
    borderColor: "#DCDCDC",
    color: "#AAAAAA",
  },
  light: {
    backgroundColor: "#D6F5EC",
    borderColor: "#85D4BC",
    color: "#1A6B57",
  },
  fulfilled: {
    backgroundColor: "#A8E6CF",
    borderColor: "#3BAF87",
    color: "#135E3F",
  },
  busy: {
    backgroundColor: "#FFE8C8",
    borderColor: "#F5A623",
    color: "#7A4500",
  },
  crowded: {
    backgroundColor: "#FADDE4",
    borderColor: "#E8819A",
    color: "#7D1F3A",
  },
  selected: {
    backgroundColor: "#EEEDFE",
    borderColor: "#7F77DD",
    color: "#3C3489",
  },
};

const DAY_LABELS: Record<number, string> = {
  1: "T2",
  2: "T3",
  3: "T4",
  4: "T5",
  5: "T6",
  6: "T7",
  0: "CN",
};

export function getDayLabel(date: Date): string {
  return DAY_LABELS[date.getDay()] ?? "";
}

export function slotKey(dayDate: string, template: ShiftTemplate): string {
  return `${dayDate}_${template}`;
}

export function formatSelectedSlots(selected: Set<string>): string {
  return Array.from(selected)
    .map((key) => {
      const [dayDate, template] = key.split("_") as [string, ShiftTemplate];
      const date = new Date(dayDate + "T00:00:00");
      return `${getDayLabel(date)} ${SHIFT_TEMPLATES[template].label}`;
    })
    .join(" · ");
}
