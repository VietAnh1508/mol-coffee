import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { SUPABASE_ERROR_CODE_NO_ROWS } from "../constants/supabase";
import type { PayrollPeriod } from "../types";

export function usePayrollPeriods() {
  return useQuery({
    queryKey: ["payroll-periods"],
    queryFn: async (): Promise<PayrollPeriod[]> => {
      const { data, error } = await supabase
        .from("payroll_periods")
        .select(`
          *,
          closed_by_user:closed_by(id, name, email)
        `)
        .order("year_month", { ascending: false });

      if (error) {
        throw error;
      }

      return data || [];
    },
  });
}

export function usePayrollPeriod(yearMonth: string | null) {
  return useQuery({
    queryKey: ["payroll-period", yearMonth],
    queryFn: async (): Promise<PayrollPeriod | null> => {
      if (!yearMonth) return null;

      const { data, error } = await supabase
        .from("payroll_periods")
        .select(`
          *,
          closed_by_user:closed_by(id, name, email)
        `)
        .eq("year_month", yearMonth)
        .single();

      if (error) {
        // Period doesn't exist, return null
        if (error.code === SUPABASE_ERROR_CODE_NO_ROWS) {
          return null;
        }
        throw error;
      }

      return data;
    },
    enabled: !!yearMonth,
  });
}
