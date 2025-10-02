import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { deriveYearMonthVN } from "../utils/payrollUtils";
import { SUPABASE_ERROR_CODE_NO_ROWS } from "../constants/supabase";
import type { PayrollPeriod } from "../types";

/**
 * Hook to resolve the payroll period for a given date
 * Returns the period (if exists), lock status, and loading state
 */
export function usePayrollPeriodForDate(date: Date) {
  const yearMonth = deriveYearMonthVN(date);

  const query = useQuery({
    queryKey: ["payroll-period-for-date", yearMonth],
    queryFn: async (): Promise<PayrollPeriod | null> => {
      const { data, error } = await supabase
        .from("payroll_periods")
        .select(`
          *,
          closed_by_user:closed_by(id, name, email)
        `)
        .eq("year_month", yearMonth)
        .maybeSingle();

      if (error) {
        // No rows returned, which is valid (no period created yet)
        if (error.code === SUPABASE_ERROR_CODE_NO_ROWS) {
          return null;
        }
        throw error;
      }

      return data;
    },
    // Keep data fresh
    staleTime: 1000 * 60, // 1 minute
  });

  return {
    period: query.data ?? null,
    isLocked: query.data?.status === "closed",
    isLoading: query.isLoading,
    yearMonth,
  };
}
