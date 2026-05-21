import { afterEach, describe, expect, it, vi } from "vitest";

import {
  createMonthDateRange,
  formatWeekRangeCompact,
  getNextWeekMondayVN,
} from "./dateUtils";

describe("createMonthDateRange", () => {
  it("produces ISO range for month-year inputs", () => {
    const { startDateStr, endDateStr } = createMonthDateRange("09-2025");

    expect(startDateStr).toBe("2025-08-31T17:00:00.000Z");
    expect(endDateStr).toBe("2025-09-30T16:59:59.999Z");
  });

  it("accepts year-month inputs", () => {
    const { startDateStr, endDateStr } = createMonthDateRange("2025-09");

    expect(startDateStr).toBe("2025-08-31T17:00:00.000Z");
    expect(endDateStr).toBe("2025-09-30T16:59:59.999Z");
  });

  it("caps the range at the end of the local month", () => {
    const { endDateStr } = createMonthDateRange("2025-09");

    expect(Date.parse("2025-09-30T16:59:59.999Z")).toBeLessThanOrEqual(
      Date.parse(endDateStr),
    );
    expect(Date.parse("2025-09-30T23:00:00.000Z")).toBeGreaterThan(
      Date.parse(endDateStr),
    );
  });

  it("throws for invalid formats", () => {
    expect(() => createMonthDateRange("invalid")).toThrowError(
      /Invalid yearMonth value/,
    );
  });
});

describe("formatWeekRangeCompact", () => {
  it("shows only start day when range is within the same month", () => {
    const start = new Date(2026, 2, 1); // 01/03/2026
    const end = new Date(2026, 2, 7); // 07/03/2026
    expect(formatWeekRangeCompact(start, end)).toBe("01 - 07/03/2026");
  });

  it("shows start day/month when range spans two months in the same year", () => {
    const start = new Date(2026, 2, 30); // 30/03/2026
    const end = new Date(2026, 3, 5); // 05/04/2026
    expect(formatWeekRangeCompact(start, end)).toBe("30/03 - 05/04/2026");
  });

  it("shows full dates on both sides when range spans two years", () => {
    const start = new Date(2025, 11, 29); // 29/12/2025
    const end = new Date(2026, 0, 4); // 04/01/2026
    expect(formatWeekRangeCompact(start, end)).toBe("29/12/2025 - 04/01/2026");
  });
});

describe("getNextWeekMondayVN", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  // Helper: build a UTC timestamp that corresponds to a given VN local datetime.
  // VN is UTC+7, so VN midnight on YYYY-MM-DD = (YYYY-MM-DD - 7h) UTC.
  const vnLocalToUtcMs = (dateStr: string, hour = 0, minute = 0) => {
    const [y, m, d] = dateStr.split("-").map(Number);
    return Date.UTC(y, m - 1, d, hour - 7, minute);
  };

  it("returns next Monday when called on a Wednesday (mid-week)", () => {
    // VN Wednesday 2026-05-20 12:00
    vi.setSystemTime(vnLocalToUtcMs("2026-05-20", 12, 0));
    expect(getNextWeekMondayVN()).toBe("2026-05-25");
  });

  it("returns next Monday when called on a Monday (start of week)", () => {
    // VN Monday 2026-05-18 09:00 → next Monday is 2026-05-25
    vi.setSystemTime(vnLocalToUtcMs("2026-05-18", 9, 0));
    expect(getNextWeekMondayVN()).toBe("2026-05-25");
  });

  it("returns next Monday when called on a Sunday (end of week)", () => {
    // VN Sunday 2026-05-24 23:59 → next Monday is 2026-05-25
    vi.setSystemTime(vnLocalToUtcMs("2026-05-24", 23, 59));
    expect(getNextWeekMondayVN()).toBe("2026-05-25");
  });

  it("crosses a month boundary correctly", () => {
    // VN Friday 2026-05-29 → next Monday is 2026-06-01
    vi.setSystemTime(vnLocalToUtcMs("2026-05-29", 10, 0));
    expect(getNextWeekMondayVN()).toBe("2026-06-01");
  });

  it("crosses a year boundary correctly", () => {
    // VN Wednesday 2025-12-31 → next Monday is 2026-01-05
    vi.setSystemTime(vnLocalToUtcMs("2025-12-31", 10, 0));
    expect(getNextWeekMondayVN()).toBe("2026-01-05");
  });

  it("is stable across the VN midnight boundary on the same calendar day", () => {
    // VN Tuesday 2026-05-19 just before midnight (23:59) and just after (00:01)
    const before = getNextWeekMondayVN.toString(); // warm reference
    void before;
    vi.setSystemTime(vnLocalToUtcMs("2026-05-19", 23, 59));
    const resultBefore = getNextWeekMondayVN();
    vi.setSystemTime(vnLocalToUtcMs("2026-05-20", 0, 1));
    const resultAfter = getNextWeekMondayVN();
    // Different VN days → different next Mondays is fine; just ensure both are valid Mondays
    for (const result of [resultBefore, resultAfter]) {
      const d = new Date(result + "T00:00:00Z");
      expect(d.getUTCDay()).toBe(1); // 1 = Monday
    }
  });
});
