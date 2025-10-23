import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Activity } from '../types'
import { useAuth } from './useAuth'
import { isAdmin } from '../constants/userRoles'

export function useCreateActivity() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (activityData: { name: string }) => {
      if (!isAdmin(user?.role)) {
        throw new Error('Bạn không có quyền tạo hoạt động')
      }

      const { data, error } = await supabase
        .from('activities')
        .insert({ ...activityData, is_active: true })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      // Invalidate and refetch activities
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
    onError: (error) => {
      console.error('Error creating activity:', error)
    }
  })
}

export function useUpdateActivity() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; name?: string; is_active?: boolean }) => {
      if (!isAdmin(user?.role)) {
        throw new Error('Bạn không có quyền cập nhật hoạt động')
      }

      const { data, error } = await supabase
        .from('activities')
        .update(updateData)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
    onError: (error) => {
      console.error('Error updating activity:', error)
    }
  })
}

export function useToggleActivity() {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  
  return useMutation({
    mutationFn: async (activity: Activity) => {
      if (!isAdmin(user?.role)) {
        throw new Error('Bạn không có quyền thay đổi trạng thái hoạt động')
      }

      const { data, error } = await supabase
        .from('activities')
        .update({ is_active: !activity.is_active })
        .eq('id', activity.id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
    },
    onError: (error) => {
      console.error('Error toggling activity:', error)
    }
  })
}
