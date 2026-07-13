import { useMutation, useQueryClient } from "@tanstack/react-query";
import { isAdmin } from "../constants/userRoles";
import { supabase } from "../lib/supabase";
import type { AllowanceType } from "../types";
import { useAuth } from "./useAuth";

export function useCreateAllowanceRate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (rateData: {
      type: AllowanceType;
      amount_vnd: number;
      effective_from: string;
    }) => {
      if (!isAdmin(user?.role)) {
        throw new Error("Bạn không có quyền tạo phụ cấp");
      }

      const { data, error } = await supabase
        .from("allowance_rates")
        .insert(rateData)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowance-rates"] });
    },
    onError: (error) => {
      console.error("Error creating allowance rate:", error);
    },
  });
}

export function useUpdateAllowanceRate() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({
      id,
      ...updateData
    }: {
      id: string;
      amount_vnd?: number;
      effective_from?: string;
      effective_to?: string | null;
    }) => {
      if (!isAdmin(user?.role)) {
        throw new Error("Bạn không có quyền cập nhật phụ cấp");
      }

      const { data, error } = await supabase
        .from("allowance_rates")
        .update(updateData)
        .eq("id", id)
        .select("*")
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["allowance-rates"] });
    },
    onError: (error) => {
      console.error("Error updating allowance rate:", error);
    },
  });
}
