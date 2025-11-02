import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Recipe } from '../types'

export function useRecipes() {
  return useQuery({
    queryKey: ['recipes'],
    queryFn: async (): Promise<Recipe[]> => {
      const { data, error } = await supabase
        .from('recipes')
        .select('*')
        .order('name')

      if (error) {
        throw error
      }

      return data ?? []
    },
  })
}
