import { describe, expect, it } from "vitest";

import { createMonthDateRange, formatWeekRangeCompact } from "./dateUtils";

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
      Date.parse(endDateStr)
    );
    expect(Date.parse("2025-09-30T23:00:00.000Z")).toBeGreaterThan(
      Date.parse(endDateStr)
    );
  });

  it("throws for invalid formats", () => {
    expect(() => createMonthDateRange("invalid"))
      .toThrowError(/Invalid yearMonth value/);
  });
});

describe("formatWeekRangeCompact", () => {
  it("shows only start day when range is within the same month", () => {
    const start = new Date(2026, 2, 1); // 01/03/2026
    const end = new Date(2026, 2, 7);   // 07/03/2026
    expect(formatWeekRangeCompact(start, end)).toBe("01 - 07/03/2026");
  });

  it("shows start day/month when range spans two months in the same year", () => {
    const start = new Date(2026, 2, 30); // 30/03/2026
    const end = new Date(2026, 3, 5);    // 05/04/2026
    expect(formatWeekRangeCompact(start, end)).toBe("30/03 - 05/04/2026");
  });

  it("shows full dates on both sides when range spans two years", () => {
    const start = new Date(2025, 11, 29); // 29/12/2025
    const end = new Date(2026, 0, 4);     // 04/01/2026
    expect(formatWeekRangeCompact(start, end)).toBe("29/12/2025 - 04/01/2026");
  });
});
