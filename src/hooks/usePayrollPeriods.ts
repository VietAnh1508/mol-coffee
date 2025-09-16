import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
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
        if (error.code === "PGRST116") {
          // Period doesn't exist, return null
          return null;
        }
        throw error;
      }

      return data;
    },
    enabled: !!yearMonth,
  });
}
