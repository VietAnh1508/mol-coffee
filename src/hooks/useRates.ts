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
  })
}