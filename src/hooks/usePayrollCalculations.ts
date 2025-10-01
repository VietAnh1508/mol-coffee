import { useQuery } from "@tanstack/react-query";
import { LUNCH_ALLOWANCE } from "../constants/payroll"; // fallback only
import { supabase } from "../lib/supabase";
import type { Activity, User } from "../types";
import { createMonthDateRange, formatDateLocal } from "../utils/dateUtils";

export interface PayrollEmployeeSummary {
  employee: User;
  totalHours: number;
  totalSalary: number;
  activities: PayrollActivityBreakdown[];
  lunchAllowanceDays?: number;
  lunchAllowanceTotal?: number;
}

export interface PayrollActivityBreakdown {
  activity: Activity;
  hours: number;
  rate: number;
  subtotal: number;
}

export interface PayrollDailyEntry {
  type: "shift" | "allowance";
  date: string;
  employee: User;
  activity?: Activity;
  startTime?: string;
  endTime?: string;
  hours: number;
  rate: number;
  subtotal: number;
  shiftId: string;
}

// Raw shift shape from Supabase select (with joined user/activity arrays)
interface RawScheduleShift {
  id: string;
  start_ts: string;
  end_ts: string;
  users: User | User[];
  activities: Activity | Activity[];
}

// Enriched shift used internally for calculations
interface CalculatedShift {
  id: string;
  start_ts: string;
  end_ts: string;
  user: User;
  activity: Activity;
  hours: number;
  rate: number;
  subtotal: number;
}

export function usePayrollCalculations(
  yearMonth: string | null,
  userId?: string
) {
  return useQuery({
    queryKey: ["payroll-calculations", yearMonth, userId],
    queryFn: async (): Promise<PayrollEmployeeSummary[]> => {
      if (!yearMonth) return [];

      const { startDateStr, endDateStr } = createMonthDateRange(yearMonth);

      let query = supabase
        .from("schedule_shifts")
        .select(
          `
          id,
          start_ts,
          end_ts,
          users!schedule_shifts_user_id_fkey(id, name, email, phone, role, status, auth_user_id, created_at, updated_at),
          activities!schedule_shifts_activity_id_fkey(id, name, is_active, created_at, updated_at)
        `
        )
        .gte("start_ts", startDateStr)
        .lte("start_ts", endDateStr);

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data: shifts, error: shiftsError } = await query;
      if (shiftsError) throw shiftsError;
      const rawShifts = (shifts ?? []) as RawScheduleShift[];
      if (rawShifts.length === 0) return [];

      const { data: rates, error: ratesError } = await supabase
        .from("rates")
        .select("activity_id, hourly_vnd, effective_from, effective_to");
      if (ratesError) throw ratesError;

      const { data: lunchAllowances } = await supabase
        .from("allowance_rates")
        .select("amount_vnd, effective_from, effective_to, type")
        .eq("type", "lunch");

      const getApplicableRate = (
        activityId: string,
        shiftDate: Date
      ): number => {
        const applicableRates = rates
          ?.filter(
            (rate) =>
              rate.activity_id === activityId &&
              new Date(rate.effective_from) <= shiftDate &&
              (!rate.effective_to || new Date(rate.effective_to) >= shiftDate)
          )
          .sort(
            (a, b) =>
              new Date(b.effective_from).getTime() -
              new Date(a.effective_from).getTime()
          );
        return applicableRates?.[0]?.hourly_vnd || 0;
      };

      const getApplicableLunchAllowance = (date: Date): number => {
        const list = lunchAllowances || [];
        const applicable = list
          .filter(
            (a) =>
              new Date(a.effective_from) <= date &&
              (!a.effective_to || new Date(a.effective_to) > date)
          )
          .sort(
            (a, b) =>
              new Date(b.effective_from).getTime() -
              new Date(a.effective_from).getTime()
          );
        return applicable[0]?.amount_vnd ?? LUNCH_ALLOWANCE;
      };

      const calculatedShifts: CalculatedShift[] = rawShifts.map((shift) => {
        const startTime = new Date(shift.start_ts);
        const endTime = new Date(shift.end_ts);
        const hours =
          (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const user = Array.isArray(shift.users) ? shift.users[0] : shift.users;
        const activity = Array.isArray(shift.activities)
          ? shift.activities[0]
          : shift.activities;
        const rate = getApplicableRate(activity.id, startTime);
        const subtotal = hours * rate;
        return {
          id: shift.id,
          start_ts: shift.start_ts,
          end_ts: shift.end_ts,
          user,
          activity,
          hours,
          rate,
          subtotal,
        };
      });

      const employeeMap = new Map<string, PayrollEmployeeSummary>();
      calculatedShifts.forEach((shift) => {
        const employeeId = shift.user.id;
        if (!employeeMap.has(employeeId)) {
          employeeMap.set(employeeId, {
            employee: shift.user,
            totalHours: 0,
            totalSalary: 0,
            activities: [],
            lunchAllowanceDays: 0,
            lunchAllowanceTotal: 0,
          });
        }
        const employeeSummary = employeeMap.get(employeeId)!;
        employeeSummary.totalHours += shift.hours;
        employeeSummary.totalSalary += shift.subtotal;

        let activityBreakdown = employeeSummary.activities.find(
          (a) => a.activity.id === shift.activity.id
        );
        if (!activityBreakdown) {
          activityBreakdown = {
            activity: shift.activity,
            hours: 0,
            rate: shift.rate,
            subtotal: 0,
          };
          employeeSummary.activities.push(activityBreakdown);
        }
        activityBreakdown.hours += shift.hours;
        activityBreakdown.subtotal += shift.subtotal;
      });

      // Compute lunch allowance per employee-day (2+ shifts)
      const byEmployeeDate = new Map<string, number>();
      calculatedShifts.forEach((shift) => {
        const ymd = formatDateLocal(new Date(shift.start_ts));
        const key = `${shift.user.id}|${ymd}`;
        byEmployeeDate.set(key, (byEmployeeDate.get(key) || 0) + 1);
      });

      byEmployeeDate.forEach((count, key) => {
        if (count >= 2) {
          const [empId, ymd] = key.split("|");
          const summary = employeeMap.get(empId);
          if (summary) {
            const amount = getApplicableLunchAllowance(new Date(ymd));
            summary.lunchAllowanceDays = (summary.lunchAllowanceDays || 0) + 1;
            summary.lunchAllowanceTotal =
              (summary.lunchAllowanceTotal || 0) + amount;
            summary.totalSalary += amount;
          }
        }
      });

      return Array.from(employeeMap.values()).sort((a, b) =>
        a.employee.name.localeCompare(b.employee.name)
      );
    },
    enabled: !!yearMonth,
  });
}

export function usePayrollDailyBreakdown(
  yearMonth: string | null,
  userId?: string
) {
  return useQuery({
    queryKey: ["payroll-daily-breakdown", yearMonth, userId],
    queryFn: async (): Promise<PayrollDailyEntry[]> => {
      if (!yearMonth) return [];

      const { startDateStr, endDateStr } = createMonthDateRange(yearMonth);

      let query = supabase
        .from("schedule_shifts")
        .select(
          `
          id,
          start_ts,
          end_ts,
          users!schedule_shifts_user_id_fkey(id, name, email, phone, role, status, auth_user_id, created_at, updated_at),
          activities!schedule_shifts_activity_id_fkey(id, name, is_active, created_at, updated_at)
        `
        )
        .gte("start_ts", startDateStr)
        .lte("start_ts", endDateStr)
        .order("start_ts", { ascending: true });

      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data: shifts, error: shiftsError } = await query;
      if (shiftsError) throw shiftsError;
      if (!shifts || shifts.length === 0) return [];

      const { data: rates, error: ratesError } = await supabase
        .from("rates")
        .select("activity_id, hourly_vnd, effective_from, effective_to");
      if (ratesError) throw ratesError;

      const { data: lunchAllowances } = await supabase
        .from("allowance_rates")
        .select("amount_vnd, effective_from, effective_to, type")
        .eq("type", "lunch");

      const getApplicableRate = (
        activityId: string,
        shiftDate: Date
      ): number => {
        const applicableRates = rates
          ?.filter(
            (rate) =>
              rate.activity_id === activityId &&
              new Date(rate.effective_from) <= shiftDate &&
              (!rate.effective_to || new Date(rate.effective_to) >= shiftDate)
          )
          .sort(
            (a, b) =>
              new Date(b.effective_from).getTime() -
              new Date(a.effective_from).getTime()
          );
        return applicableRates?.[0]?.hourly_vnd || 0;
      };

      const getApplicableLunchAllowance = (date: Date): number => {
        const list = lunchAllowances || [];
        const applicable = list
          .filter(
            (a) =>
              new Date(a.effective_from) <= date &&
              (!a.effective_to || new Date(a.effective_to) > date)
          )
          .sort(
            (a, b) =>
              new Date(b.effective_from).getTime() -
              new Date(a.effective_from).getTime()
          );
        return applicable[0]?.amount_vnd ?? LUNCH_ALLOWANCE;
      };

      const baseEntries = shifts.map((shift) => {
        const startTime = new Date(shift.start_ts);
        const endTime = new Date(shift.end_ts);
        const hours =
          (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const user = Array.isArray(shift.users) ? shift.users[0] : shift.users;
        const activity = Array.isArray(shift.activities)
          ? shift.activities[0]
          : shift.activities;
        const rate = getApplicableRate(activity.id, startTime);
        const subtotal = hours * rate;
        return {
          type: "shift" as const,
          date: formatDateLocal(startTime),
          employee: user,
          activity,
          hours: Math.round(hours * 100) / 100,
          rate,
          subtotal: Math.round(subtotal),
          shiftId: shift.id,
          startTime: shift.start_ts,
          endTime: shift.end_ts,
        };
      });

      const results: PayrollDailyEntry[] = [...baseEntries];

      if (userId) {
        const byDate = new Map<string, PayrollDailyEntry[]>();
        results.forEach((entry) => {
          const list = byDate.get(entry.date) || [];
          list.push(entry);
          byDate.set(entry.date, list);
        });

        byDate.forEach((entries, date) => {
          const shiftCount = entries.filter((e) => e.type === "shift").length;
          if (shiftCount >= 2) {
            const employee = entries[0].employee;
            const amount = getApplicableLunchAllowance(new Date(date));
            const allowance: PayrollDailyEntry = {
              type: "allowance",
              date,
              employee,
              hours: 0,
              rate: amount,
              subtotal: amount,
              shiftId: `allowance-${employee.id}-${date}`,
            };
            results.push(allowance);
          }
        });
      }

      return results.sort(
        (a, b) =>
          a.date.localeCompare(b.date) || a.shiftId.localeCompare(b.shiftId)
      );
    },
    enabled: !!yearMonth,
  });
}
