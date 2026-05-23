import { describe, expect, it } from "vitest";

import type { ShiftRegistration } from "../types";
import { buildExportText } from "./shiftRegistrationUtils";

// Minimal fixture — only fields used by buildExportText
function reg(
  userId: string,
  dayDate: string,
  template: "morning" | "afternoon",
  registeredAt: string,
  name?: string,
): ShiftRegistration {
  return {
    id: `${userId}-${dayDate}-${template}`,
    user_id: userId,
    week_start_date: "2026-05-18",
    day_date: dayDate,
    shift_template: template,
    registered_at: registeredAt,
    custom_start_time: null,
    custom_end_time: null,
    note: null,
    created_at: registeredAt,
    updated_at: registeredAt,
    user: name ? { id: userId, name } : undefined,
  } as ShiftRegistration;
}

// Dates used in tests (week of 2026-05-18):
// Mon 2026-05-18, Tue 2026-05-19, Wed 2026-05-20, Thu 2026-05-21, Fri 2026-05-22, Sat 2026-05-23

describe("buildExportText", () => {
  it("returns empty string for no registrations", () => {
    expect(buildExportText([])).toBe("");
  });

  it("formats a single employee with one morning slot", () => {
    const result = buildExportText([
      reg("u1", "2026-05-18", "morning", "2026-05-14T08:00:00Z", "Kiệt"),
    ]);
    expect(result).toBe("Kiệt: s2");
  });

  it("formats a single employee with one afternoon slot", () => {
    const result = buildExportText([
      reg("u1", "2026-05-19", "afternoon", "2026-05-14T08:00:00Z", "Kiệt"),
    ]);
    expect(result).toBe("Kiệt: c3");
  });

  it("abbreviates each day of the week correctly", () => {
    const days = [
      { date: "2026-05-18", expected: "s2" }, // Monday
      { date: "2026-05-19", expected: "s3" }, // Tuesday
      { date: "2026-05-20", expected: "s4" }, // Wednesday
      { date: "2026-05-21", expected: "s5" }, // Thursday
      { date: "2026-05-22", expected: "s6" }, // Friday
      { date: "2026-05-23", expected: "s7" }, // Saturday
    ];
    for (const { date, expected } of days) {
      const result = buildExportText([
        reg("u1", date, "morning", "2026-05-14T08:00:00Z", "Test"),
      ]);
      expect(result).toBe(`Test: ${expected}`);
    }
  });

  it("sorts an employee's slots by day first, then morning before afternoon on the same day", () => {
    const result = buildExportText([
      reg("u1", "2026-05-19", "afternoon", "2026-05-14T09:00:00Z", "Tâm"),
      reg("u1", "2026-05-18", "morning", "2026-05-14T08:00:00Z", "Tâm"),
      reg("u1", "2026-05-19", "morning", "2026-05-14T08:30:00Z", "Tâm"),
    ]);
    expect(result).toBe("Tâm: s2, s3, c3");
  });

  it("orders employees by earliest registered_at (first registered appears first)", () => {
    const result = buildExportText([
      reg("u2", "2026-05-19", "morning", "2026-05-14T10:00:00Z", "Tâm"),
      reg("u1", "2026-05-18", "morning", "2026-05-14T08:00:00Z", "Kiệt"),
    ]);
    expect(result).toBe("Kiệt: s2\nTâm: s3");
  });

  it("uses the earliest slot's registered_at when an employee has multiple slots", () => {
    // u2 registered their first slot before u1
    const result = buildExportText([
      reg("u1", "2026-05-18", "morning", "2026-05-14T10:00:00Z", "Kiệt"),
      reg("u2", "2026-05-18", "afternoon", "2026-05-14T08:00:00Z", "Tâm"),
      reg("u2", "2026-05-19", "morning", "2026-05-14T12:00:00Z", "Tâm"),
    ]);
    expect(result).toBe("Tâm: c2, s3\nKiệt: s2");
  });

  it("keeps two employees with the same name separate (grouped by user_id)", () => {
    const result = buildExportText([
      reg("u1", "2026-05-18", "morning", "2026-05-14T08:00:00Z", "An"),
      reg("u2", "2026-05-19", "morning", "2026-05-14T09:00:00Z", "An"),
    ]);
    expect(result).toBe("An: s2\nAn: s3");
  });

  it("falls back to user_id when user name is missing", () => {
    const result = buildExportText([
      reg("user-abc", "2026-05-18", "morning", "2026-05-14T08:00:00Z"),
    ]);
    expect(result).toBe("user-abc: s2");
  });

  it("formats multiple employees with multiple slots each", () => {
    const result = buildExportText([
      reg("u1", "2026-05-18", "morning", "2026-05-14T08:00:00Z", "Kiệt"),
      reg("u1", "2026-05-19", "afternoon", "2026-05-14T08:01:00Z", "Kiệt"),
      reg("u2", "2026-05-19", "morning", "2026-05-14T09:00:00Z", "Tâm"),
      reg("u2", "2026-05-20", "morning", "2026-05-14T09:01:00Z", "Tâm"),
      reg("u2", "2026-05-21", "morning", "2026-05-14T09:02:00Z", "Tâm"),
      reg("u2", "2026-05-22", "afternoon", "2026-05-14T09:03:00Z", "Tâm"),
    ]);
    expect(result).toBe("Kiệt: s2, c3\nTâm: s3, s4, s5, c6");
  });
});
