import { VN_TIMEZONE_OFFSET_MINUTES } from "../constants/payroll";

export interface MonthOption {
  value: string; // YYYY-MM format
  label: string; // Vietnamese month name
}

/**
 * Derives the YYYY-MM format from a date using Vietnam timezone (UTC+7)
 * Can accept either a Date object or an ISO date string
 */
export function deriveYearMonthVN(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const offsetMs = VN_TIMEZONE_OFFSET_MINUTES * 60 * 1000;
  const vnDate = new Date(dateObj.getTime() + offsetMs);

  const year = vnDate.getUTCFullYear();
  const month = String(vnDate.getUTCMonth() + 1).padStart(2, "0");

  return `${year}-${month}`;
}

export function generateMonthOptions(
  startYear = 2025,
  monthsAhead = 12
): MonthOption[] {
  const options: MonthOption[] = [];
  const today = new Date();
  const currentYear = today.getFullYear();

  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];

  // Start from the specified start year
  for (let year = startYear; year <= currentYear + 1; year++) {
    for (let month = 1; month <= 12; month++) {
      // Skip months that are too far in the future
      if (year === currentYear + 1 && month > monthsAhead) continue;

      const value = `${year}-${month.toString().padStart(2, "0")}`;
      const label = `${monthNames[month - 1]}/${year}`;

      options.push({ value, label });
    }
  }

  // Sort in descending order (most recent first)
  return options.reverse();
}

export function getCurrentYearMonth(): string {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  return `${year}-${month}`;
}

export function formatMonthName(yearMonth: string): string {
  const [year, month] = yearMonth.split("-");
  const monthNames = [
    "Tháng 1",
    "Tháng 2",
    "Tháng 3",
    "Tháng 4",
    "Tháng 5",
    "Tháng 6",
    "Tháng 7",
    "Tháng 8",
    "Tháng 9",
    "Tháng 10",
    "Tháng 11",
    "Tháng 12",
  ];
  return `${monthNames[parseInt(month) - 1]} ${year}`;
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
}

export function formatMoney(amount: number, currency = "đ"): string {
  const formatted = amount.toLocaleString("vi-VN");
  return `${formatted} ${currency}`.trim();
}

export function generateCSVContent(
  summaries: Array<{
    employee: { name: string };
    totalHours: number;
    totalSalary: number;
    activities: Array<{
      activity: { name: string };
      hours: number;
      rate: number;
      subtotal: number;
    }>;
  }>
): string {
  const headers = [
    "Nhân viên",
    "Hoạt động",
    "Số giờ",
    "Lương theo giờ (VND)",
    "Thành tiền (VND)",
    "Tổng giờ",
    "Tổng lương (VND)",
  ];

  const rows: string[][] = [headers];

  summaries.forEach((summary) => {
    const firstActivity = summary.activities[0];
    if (firstActivity) {
      // First row with employee totals
      rows.push([
        summary.employee.name,
        firstActivity.activity.name,
        firstActivity.hours.toFixed(1),
        formatMoney(firstActivity.rate),
        formatMoney(firstActivity.subtotal),
        summary.totalHours.toFixed(1),
        formatMoney(summary.totalSalary),
      ]);

      // Additional activities for the same employee
      summary.activities.slice(1).forEach((activity) => {
        rows.push([
          "", // Empty employee name for subsequent rows
          activity.activity.name,
          activity.hours.toFixed(1),
          formatMoney(activity.rate),
          formatMoney(activity.subtotal),
          "", // Empty totals for subsequent rows
          "",
        ]);
      });
    }
  });

  // Convert to CSV format
  return rows.map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");
}

export function downloadCSV(content: string, filename: string): void {
  const blob = new Blob(["\uFEFF" + content], {
    type: "text/csv;charset=utf-8;",
  });
  const link = document.createElement("a");

  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
