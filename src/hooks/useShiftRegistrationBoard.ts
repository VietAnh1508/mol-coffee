import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { ShiftRegistrationBoard } from "../types";

export function useShiftRegistrationBoard(weekStart: string) {
  return useQuery({
    queryKey: ["shift-registration-board", weekStart],
    queryFn: async (): Promise<ShiftRegistrationBoard | null> => {
      const { data, error } = await supabase
        .from("shift_registration_boards")
        .select("*, locked_by_user:users(id, name)")
        .eq("week_start_date", weekStart)
        .maybeSingle();

      if (error) {
        throw new Error(
          `Failed to fetch shift registration board: ${error.message}`,
        );
      }

      return data ?? null;
    },
  });
}
