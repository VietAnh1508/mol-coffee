import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { isAdmin } from '../constants/userRoles'

export function useCreateRate() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (rateData: { 
      activity_id: string; 
      hourly_vnd: number; 
      effective_from: string 
    }) => {
      if (!isAdmin(user?.role)) {
        throw new Error('Bạn không có quyền tạo mức lương')
      }

      const { data, error } = await supabase
        .from('rates')
        .insert(rateData)
        .select(`
          *,
          activity:activities(name)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch rates
      queryClient.invalidateQueries({ queryKey: ['rates'] })
    },
    onError: (error) => {
      console.error('Error creating rate:', error)
    }
  })
}

export function useUpdateRate() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      ...updateData 
    }: { 
      id: string; 
      activity_id?: string; 
      hourly_vnd?: number; 
      effective_from?: string 
    }) => {
      if (!isAdmin(user?.role)) {
        throw new Error('Bạn không có quyền cập nhật mức lương')
      }

      const { data, error } = await supabase
        .from('rates')
        .update(updateData)
        .eq('id', id)
        .select(`
          *,
          activity:activities(name)
        `)
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rates'] })
    },
    onError: (error) => {
      console.error('Error updating rate:', error)
    }
  })
}
