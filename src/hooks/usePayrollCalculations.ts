import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { User, Activity } from "../types";
import { createMonthDateRange, formatDateLocal } from "../utils/dateUtils";

export interface PayrollEmployeeSummary {
  employee: User;
  totalHours: number;
  totalSalary: number;
  activities: PayrollActivityBreakdown[];
}

export interface PayrollActivityBreakdown {
  activity: Activity;
  hours: number;
  rate: number;
  subtotal: number;
}

export interface PayrollDailyEntry {
  date: string;
  employee: User;
  activity: Activity;
  hours: number;
  rate: number;
  subtotal: number;
  shiftId: string;
  startTime: string;
  endTime: string;
}

export function usePayrollCalculations(yearMonth: string | null, userId?: string) {
  return useQuery({
    queryKey: ["payroll-calculations", yearMonth, userId],
    queryFn: async (): Promise<PayrollEmployeeSummary[]> => {
      if (!yearMonth) return [];

      // Parse year-month to create date range
      const { startDate: startDateStr, endDate: endDateStr } = createMonthDateRange(yearMonth);

      let query = supabase
        .from("schedule_shifts")
        .select(`
          id,
          start_ts,
          end_ts,
          users!schedule_shifts_user_id_fkey(id, name, email, phone, role, status, auth_user_id, created_at, updated_at),
          activities!schedule_shifts_activity_id_fkey(id, name, is_active, created_at, updated_at)
        `)
        .gte("start_ts", startDateStr)
        .lte("start_ts", endDateStr);

      // If userId is provided (employee view), filter to that user only
      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data: shifts, error: shiftsError } = await query;

      if (shiftsError) {
        throw shiftsError;
      }

      if (!shifts || shifts.length === 0) {
        return [];
      }

      // Get rates for the period
      const { data: rates, error: ratesError } = await supabase
        .from("rates")
        .select("activity_id, hourly_vnd, effective_from, effective_to");

      if (ratesError) {
        throw ratesError;
      }

      // Function to get applicable rate for a shift
      const getApplicableRate = (activityId: string, shiftDate: Date): number => {
        const applicableRates = rates
          ?.filter(rate =>
            rate.activity_id === activityId &&
            new Date(rate.effective_from) <= shiftDate &&
            (!rate.effective_to || new Date(rate.effective_to) >= shiftDate)
          )
          .sort((a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime());

        return applicableRates?.[0]?.hourly_vnd || 0;
      };

      // Calculate hours and salary for each shift
      const calculatedShifts = shifts.map(shift => {
        const startTime = new Date(shift.start_ts);
        const endTime = new Date(shift.end_ts);
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const user = Array.isArray(shift.users) ? shift.users[0] : shift.users;
        const activity = Array.isArray(shift.activities) ? shift.activities[0] : shift.activities;
        const rate = getApplicableRate(activity.id, startTime);
        const subtotal = hours * rate;

        return {
          ...shift,
          user,
          activity,
          hours,
          rate,
          subtotal,
        };
      });

      // Group by employee and activity
      const employeeMap = new Map<string, PayrollEmployeeSummary>();

      calculatedShifts.forEach(shift => {
        const employeeId = shift.user.id;

        if (!employeeMap.has(employeeId)) {
          employeeMap.set(employeeId, {
            employee: shift.user,
            totalHours: 0,
            totalSalary: 0,
            activities: [],
          });
        }

        const employeeSummary = employeeMap.get(employeeId)!;
        employeeSummary.totalHours += shift.hours;
        employeeSummary.totalSalary += shift.subtotal;

        // Find or create activity breakdown
        let activityBreakdown = employeeSummary.activities.find(
          a => a.activity.id === shift.activity.id
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

      return Array.from(employeeMap.values())
        .sort((a, b) => a.employee.name.localeCompare(b.employee.name));
    },
    enabled: !!yearMonth,
  });
}

export function usePayrollDailyBreakdown(yearMonth: string | null, userId?: string) {
  return useQuery({
    queryKey: ["payroll-daily-breakdown", yearMonth, userId],
    queryFn: async (): Promise<PayrollDailyEntry[]> => {
      if (!yearMonth) return [];

      // Parse year-month to create date range
      const { startDate: startDateStr, endDate: endDateStr } = createMonthDateRange(yearMonth);

      let query = supabase
        .from("schedule_shifts")
        .select(`
          id,
          start_ts,
          end_ts,
          users!schedule_shifts_user_id_fkey(id, name, email, phone, role, status, auth_user_id, created_at, updated_at),
          activities!schedule_shifts_activity_id_fkey(id, name, is_active, created_at, updated_at)
        `)
        .gte("start_ts", startDateStr)
        .lte("start_ts", endDateStr)
        .order("start_ts", { ascending: true });

      // If userId is provided (employee view), filter to that user only
      if (userId) {
        query = query.eq("user_id", userId);
      }

      const { data: shifts, error: shiftsError } = await query;

      if (shiftsError) {
        throw shiftsError;
      }

      if (!shifts || shifts.length === 0) {
        return [];
      }

      // Get rates for the period
      const { data: rates, error: ratesError } = await supabase
        .from("rates")
        .select("activity_id, hourly_vnd, effective_from, effective_to");

      if (ratesError) {
        throw ratesError;
      }

      // Function to get applicable rate for a shift
      const getApplicableRate = (activityId: string, shiftDate: Date): number => {
        const applicableRates = rates
          ?.filter(rate =>
            rate.activity_id === activityId &&
            new Date(rate.effective_from) <= shiftDate &&
            (!rate.effective_to || new Date(rate.effective_to) >= shiftDate)
          )
          .sort((a, b) => new Date(b.effective_from).getTime() - new Date(a.effective_from).getTime());

        return applicableRates?.[0]?.hourly_vnd || 0;
      };

      // Calculate and return daily entries
      return shifts.map(shift => {
        const startTime = new Date(shift.start_ts);
        const endTime = new Date(shift.end_ts);
        const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
        const user = Array.isArray(shift.users) ? shift.users[0] : shift.users;
        const activity = Array.isArray(shift.activities) ? shift.activities[0] : shift.activities;
        const rate = getApplicableRate(activity.id, startTime);
        const subtotal = hours * rate;

        return {
          date: formatDateLocal(startTime),
          employee: user,
          activity: activity,
          hours: Math.round(hours * 100) / 100, // Round to 2 decimal places
          rate,
          subtotal: Math.round(subtotal),
          shiftId: shift.id,
          startTime: shift.start_ts,
          endTime: shift.end_ts,
        };
      });
    },
    enabled: !!yearMonth,
  });
}
