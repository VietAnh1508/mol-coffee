import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Rate } from '../types'

export function useRates() {
  return useQuery({
    queryKey: ['rates'],
    queryFn: async (): Promise<Rate[]> => {
      const { data, error } = await supabase
        .from('rates')
        .select(`
          *,
          activity:activities(name)
        `)
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return data || []
    },
    staleTime: 2 * 60 * 1000, // 2 minutes - rates don't change very often
    retry: (failureCount, error) => {
      // Don't retry on permission/auth errors
      if (error?.message?.includes('permission') || error?.message?.includes('auth')) {
        return false
      }
      return failureCount < 2
    }
  })
}