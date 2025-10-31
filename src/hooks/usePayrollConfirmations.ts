import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SUPABASE_ERROR_CODE_NO_ROWS } from "../constants/supabase";
import { isAdmin } from "../constants/userRoles";
import { supabase } from "../lib/supabase";
import type { PayrollConfirmation } from "../types";
import { useAuth } from "./useAuth";

export function usePayrollConfirmation(
  payrollPeriodId?: string | null,
  userId?: string | null
) {
  return useQuery({
    queryKey: ["payroll-confirmation", payrollPeriodId, userId],
    queryFn: async (): Promise<PayrollConfirmation | null> => {
      if (!payrollPeriodId || !userId) return null;

      const { data, error } = await supabase
        .from("payroll_employee_confirmations")
        .select(
          "id, payroll_period_id, user_id, confirmed_at, created_at, updated_at"
        )
        .eq("payroll_period_id", payrollPeriodId)
        .eq("user_id", userId)
        .maybeSingle();

      if (error) {
        if (error.code === SUPABASE_ERROR_CODE_NO_ROWS) {
          return null;
        }
        throw error;
      }

      return data ?? null;
    },
    enabled: Boolean(payrollPeriodId && userId),
  });
}

export function usePayrollConfirmations(payrollPeriodId?: string | null) {
  return useQuery({
    queryKey: ["payroll-confirmations", payrollPeriodId],
    queryFn: async (): Promise<PayrollConfirmation[]> => {
      if (!payrollPeriodId) return [];

      const { data, error } = await supabase
        .from("payroll_employee_confirmations")
        .select(
          "id, payroll_period_id, user_id, confirmed_at, created_at, updated_at"
        )
        .eq("payroll_period_id", payrollPeriodId);

      if (error) {
        throw error;
      }

      return data ?? [];
    },
    enabled: Boolean(payrollPeriodId),
  });
}

interface ConfirmPayrollVariables {
  payrollPeriodId: string;
  userId: string;
}

export function useConfirmPayrollApproval() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      payrollPeriodId,
      userId,
    }: ConfirmPayrollVariables): Promise<PayrollConfirmation> => {
      if (!user) {
        throw new Error("Bạn cần đăng nhập để xác nhận bảng lương");
      }

      const isSelfConfirmation = user.id === userId;
      const canOverride = isAdmin(user.role);

      if (!isSelfConfirmation && !canOverride) {
        throw new Error("Bạn không thể xác nhận bảng lương này");
      }

      const { data, error } = await supabase
        .from("payroll_employee_confirmations")
        .upsert(
          {
            payroll_period_id: payrollPeriodId,
            user_id: userId,
            confirmed_at: new Date().toISOString(),
          },
          { onConflict: "payroll_period_id,user_id" }
        )
        .select(
          "id, payroll_period_id, user_id, confirmed_at, created_at, updated_at"
        )
        .single();

      if (error) {
        throw error;
      }

      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["payroll-confirmation", data.payroll_period_id, data.user_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["payroll-confirmations", data.payroll_period_id],
      });
    },
  });
}

export function useUnconfirmPayrollApproval() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      payrollPeriodId,
      userId,
    }: ConfirmPayrollVariables): Promise<{ payroll_period_id: string; user_id: string }> => {
      if (!user) {
        throw new Error("Bạn cần đăng nhập để bỏ xác nhận bảng lương");
      }

      if (!isAdmin(user.role)) {
        throw new Error("Chỉ quản trị viên mới có thể bỏ xác nhận bảng lương");
      }

      const { error } = await supabase
        .from("payroll_employee_confirmations")
        .delete()
        .eq("payroll_period_id", payrollPeriodId)
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      return { payroll_period_id: payrollPeriodId, user_id: userId };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({
        queryKey: ["payroll-confirmation", data.payroll_period_id, data.user_id],
      });
      queryClient.invalidateQueries({
        queryKey: ["payroll-confirmations", data.payroll_period_id],
      });
    },
  });
}
