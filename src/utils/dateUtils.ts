import { VN_TIMEZONE_OFFSET_MINUTES } from "../constants/payroll";

export const formatDate = (date: Date) => {
  return date.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

export const formatDateDMY = (date: Date): string => {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

export const formatDateWeekdayDMY = (date: Date): string => {
  const weekday = date.toLocaleDateString("vi-VN", { weekday: "long" });
  return `${weekday}, ${formatDateDMY(date)}`;
};

export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

export const formatHours = (hours: number): string => {
  return `${hours.toFixed(1)} giờ`;
};

export const formatDateTime = (dateInput: Date | string): string => {
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (!date || Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleString("vi-VN", {
    hour12: false,
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const createMonthDateRange = (yearMonth: string) => {
  const parts = yearMonth.split("-").map((part) => part.trim());
  if (parts.length !== 2) {
    throw new Error(`Invalid yearMonth value: ${yearMonth}`);
  }

  const [first, second] = parts;
  const yearPart = first.length === 4 ? first : second;
  const monthPart = first.length === 4 ? second : first;

  const year = Number.parseInt(yearPart, 10);
  const month = Number.parseInt(monthPart, 10);

  if (!Number.isFinite(year) || !Number.isFinite(month) || month < 1 || month > 12) {
    throw new Error(`Invalid yearMonth value: ${yearMonth}`);
  }

  const offsetMs = VN_TIMEZONE_OFFSET_MINUTES * 60 * 1000;
  const startDate = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0) - offsetMs);
  const endDate = new Date(Date.UTC(year, month, 0, 23, 59, 59, 999) - offsetMs);

  return {
    startDateStr: startDate.toISOString(),
    endDateStr: endDate.toISOString(),
  };
};

export const formatDateLocal = (date: Date): string => {
  return (
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0")
  );
};
