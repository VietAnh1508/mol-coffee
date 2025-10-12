import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { Activity } from '../types'

export function useCreateActivity() {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (activityData: { name: string }) => {
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
  
  return useMutation({
    mutationFn: async ({ id, ...updateData }: { id: string; name?: string; is_active?: boolean }) => {
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
  
  return useMutation({
    mutationFn: async (activity: Activity) => {
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
