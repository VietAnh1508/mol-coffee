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
