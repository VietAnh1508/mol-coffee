import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import type { ShiftRegistration } from '../types';

export function useShiftRegistrations(weekStart: string) {
  return useQuery({
    queryKey: ['shift-registrations', weekStart],
    queryFn: async (): Promise<ShiftRegistration[]> => {
      const { data, error } = await supabase
        .from('shift_registrations')
        .select('*, user:users(id, name, avatar_url)')
        .eq('week_start_date', weekStart)
        .order('registered_at', { ascending: true });

      if (error) {
        throw new Error(
          `Failed to fetch shift registrations: ${error.message}`,
        );
      }

      return data ?? [];
    },
  });
}
