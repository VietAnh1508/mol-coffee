import { useQuery } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { User } from '../types'

export function useUserProfile(authUserId: string | null) {
  return useQuery({
    queryKey: ['user-profile', authUserId],
    queryFn: async (): Promise<User> => {
      if (!authUserId) {
        throw new Error('No auth user ID provided')
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authUserId)
        .single()

      if (error) {
        throw error
      }

      if (!data) {
        throw new Error('User profile not found')
      }

      return data
    },
    enabled: !!authUserId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry if user not found (404-like errors)
      if (error?.message?.includes('not found')) return false
      return failureCount < 2
    }
  })
}