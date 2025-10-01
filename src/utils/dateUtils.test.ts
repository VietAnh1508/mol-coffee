import { describe, expect, it } from "vitest";

import { createMonthDateRange } from "./dateUtils";

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
