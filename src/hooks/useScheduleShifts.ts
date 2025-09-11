import { useQuery } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { ScheduleShift } from "../types";

export function useScheduleShifts(date?: Date) {
  return useQuery({
    queryKey: ["schedule-shifts", date?.toDateString()],
    queryFn: async (): Promise<ScheduleShift[]> => {
      let query = supabase.from("schedule_shifts").select(`
          *,
          user:users(id, name, email),
          activity:activities(id, name)
        `);

      // Filter by date if provided
      if (date) {
        const startOfDay = new Date(date);
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date);
        endOfDay.setHours(23, 59, 59, 999);

        query = query
          .gte("start_ts", startOfDay.toISOString())
          .lt("start_ts", endOfDay.toISOString());
      }

      query = query.order("start_ts", { ascending: true });

      const { data, error } = await query;
      console.log(data);

      if (error) {
        throw new Error(`Failed to fetch schedule shifts: ${error.message}`);
      }

      return data || [];
    },
    gcTime: 1000 * 60 * 30, // 30 minutes
  });
}

export function useScheduleShiftsByDateRange(startDate: Date, endDate: Date) {
  return useQuery({
    queryKey: [
      "schedule-shifts-range",
      startDate.toDateString(),
      endDate.toDateString(),
    ],
    queryFn: async (): Promise<ScheduleShift[]> => {
      const query = supabase
        .from("schedule_shifts")
        .select(
          `
          *,
          user:users(id, name, email),
          activity:activities(id, name)
        `
        )
        .gte("start_ts", startDate.toISOString())
        .lt("start_ts", endDate.toISOString())
        .order("start_ts", { ascending: true });

      const { data, error } = await query;

      if (error) {
        throw new Error(`Failed to fetch schedule shifts: ${error.message}`);
      }

      return data || [];
    },
    gcTime: 1000 * 60 * 30,
  });
}
