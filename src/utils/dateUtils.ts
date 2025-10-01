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

export const createMonthDateRange = (yearMonth: string) => {
  const [year, month] = yearMonth.split("-");
  const startDate = new Date(parseInt(year), parseInt(month) - 1, 1);
  const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59);

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
