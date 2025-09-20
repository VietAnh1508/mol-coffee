import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { AllowanceRate, AllowanceType } from "../types";

export function useAllowanceRates(type: AllowanceType = "lunch") {
  return useQuery({
    queryKey: ["allowance-rates", type],
    queryFn: async (): Promise<AllowanceRate[]> => {
      const { data, error } = await supabase
        .from("allowance_rates")
        .select(
          "id, type, amount_vnd, effective_from, effective_to, created_at, updated_at"
        )
        .eq("type", type)
        .order("effective_from", { ascending: false });

      if (error) throw error;
      return data || [];
    },
  });
}
