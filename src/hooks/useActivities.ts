import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Activity } from '../types'

export function useActivities() {
  return useQuery({
    queryKey: ['activities'],
    queryFn: async (): Promise<Activity[]> => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('name')

      if (error) {
        throw error
      }

      return data || []
    },
  })
}