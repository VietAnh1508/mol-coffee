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
    staleTime: 2 * 60 * 1000, // 2 minutes - activities don't change often
    retry: (failureCount, error) => {
      // Don't retry on permission/auth errors
      if (error?.message?.includes('permission') || error?.message?.includes('auth')) {
        return false
      }
      return failureCount < 2
    }
  })
}