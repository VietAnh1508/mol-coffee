export const normalizeDate = (date: Date) =>
  new Date(date.getFullYear(), date.getMonth(), date.getDate());

export const parseDateFromParam = (value?: string) => {
  if (!value) {
    return normalizeDate(new Date());
  }

  const [yearStr, monthStr, dayStr] = value.split("-");
  const year = Number.parseInt(yearStr ?? "", 10);
  const month = Number.parseInt(monthStr ?? "", 10);
  const day = Number.parseInt(dayStr ?? "", 10);

  if (
    !Number.isFinite(year) ||
    !Number.isFinite(month) ||
    !Number.isFinite(day) ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return normalizeDate(new Date());
  }

  return normalizeDate(new Date(year, month - 1, day));
};

export const isSameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

export const getWeekRange = (date: Date) => {
  const normalized = normalizeDate(date);
  const dayOfWeek = normalized.getDay(); // 0 Sunday, 1 Monday, ...
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // shift to Monday

  const start = new Date(normalized);
  start.setDate(start.getDate() + diff);

  const days: Date[] = [];
  for (let index = 0; index < 7; index += 1) {
    const day = new Date(start);
    day.setDate(start.getDate() + index);
    days.push(day);
  }

  const endExclusive = new Date(start);
  endExclusive.setDate(start.getDate() + 7);

  return {
    start,
    endExclusive,
    days,
  };
};
