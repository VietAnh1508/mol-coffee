import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";

export interface CreatePayrollPeriodData {
  year_month: string;
}

export interface UpdatePayrollPeriodData {
  id: string;
  status: 'open' | 'closed';
}

export function useCreatePayrollPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: CreatePayrollPeriodData) => {
      const { data: result, error } = await supabase
        .from("payroll_periods")
        .insert({
          year_month: data.year_month,
          status: 'open',
        })
        .select()
        .single();

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
    },
  });
}

export function useClosePayrollPeriod() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (periodId: string) => {
      if (!user) {
        throw new Error("User not authenticated");
      }

      const { data: result, error } = await supabase
        .from("payroll_periods")
        .update({
          status: 'closed',
          closed_by: user.id,
          closed_at: new Date().toISOString(),
        })
        .eq("id", periodId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-period", data.year_month] });
    },
  });
}

export function useReopenPayrollPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (periodId: string) => {
      const { data: result, error } = await supabase
        .from("payroll_periods")
        .update({
          status: 'open',
          closed_by: null,
          closed_at: null,
        })
        .eq("id", periodId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      return result;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
      queryClient.invalidateQueries({ queryKey: ["payroll-period", data.year_month] });
    },
  });
}

export function useDeletePayrollPeriod() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (periodId: string) => {
      const { error } = await supabase
        .from("payroll_periods")
        .delete()
        .eq("id", periodId);

      if (error) {
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-periods"] });
    },
  });
}
