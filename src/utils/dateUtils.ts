export const formatDate = (date: Date) => {
  return date.toLocaleDateString('vi-VN', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

export const formatTime = (dateString: string) => {
  return new Date(dateString).toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  })
}

export const formatHours = (hours: number): string => {
  return `${hours.toFixed(1)} giờ`;
}

export const createMonthDateRange = (yearMonth: string) => {
  const [year, month] = yearMonth.split("-");
  const lastDay = new Date(parseInt(year), parseInt(month), 0).getDate();

  return {
    startDate: `${year}-${month.padStart(2, '0')}-01T00:00:00`,
    endDate: `${year}-${month.padStart(2, '0')}-${lastDay.toString().padStart(2, '0')}T23:59:59`
  };
}

export const formatDateLocal = (date: Date): string => {
  return date.getFullYear() + '-' +
         String(date.getMonth() + 1).padStart(2, '0') + '-' +
         String(date.getDate()).padStart(2, '0');
}
