import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '../lib/supabase'
import type { ScheduleShift } from '../types'

interface CreateScheduleShiftData {
  user_id: string
  activity_id: string
  start_ts: string
  end_ts: string
  template_name: 'morning' | 'afternoon' | 'custom'
  note?: string
}

interface UpdateScheduleShiftData extends Partial<CreateScheduleShiftData> {
  id: string
}

export function useScheduleMutations() {
  const queryClient = useQueryClient()

  const createShift = useMutation({
    mutationFn: async (data: CreateScheduleShiftData): Promise<ScheduleShift> => {
      const { data: result, error } = await supabase
        .from('schedule_shifts')
        .insert({
          ...data,
          is_manual: data.template_name === 'custom'
        })
        .select(`
          *,
          user:users(id, name, email),
          activity:activities(id, name)
        `)
        .single()

      if (error) {
        throw new Error(`Failed to create shift: ${error.message}`)
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] })
    }
  })

  const updateShift = useMutation({
    mutationFn: async (data: UpdateScheduleShiftData): Promise<ScheduleShift> => {
      const { id, ...updateData } = data
      const { data: result, error } = await supabase
        .from('schedule_shifts')
        .update({
          ...updateData,
          is_manual: updateData.template_name === 'custom',
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select(`
          *,
          user:users(id, name, email),
          activity:activities(id, name)
        `)
        .single()

      if (error) {
        throw new Error(`Failed to update shift: ${error.message}`)
      }

      return result
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] })
    }
  })

  const deleteShift = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from('schedule_shifts')
        .delete()
        .eq('id', id)

      if (error) {
        throw new Error(`Failed to delete shift: ${error.message}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['schedule-shifts'] })
    }
  })

  const validateShiftConflicts = useMutation({
    mutationFn: async (data: {
      user_id: string
      start_ts: string
      end_ts: string
      exclude_shift_id?: string
    }): Promise<{ hasConflict: boolean; conflicts: ScheduleShift[] }> => {
      const { user_id, start_ts, end_ts, exclude_shift_id } = data

      // Check for overlapping shifts
      let query = supabase
        .from('schedule_shifts')
        .select(`
          *,
          user:users(id, name, email),
          activity:activities(id, name)
        `)
        .eq('user_id', user_id)
        .or(`start_ts.lt.${end_ts},end_ts.gt.${start_ts}`)

      if (exclude_shift_id) {
        query = query.neq('id', exclude_shift_id)
      }

      const { data: overlappingShifts, error } = await query

      if (error) {
        throw new Error(`Failed to validate shift conflicts: ${error.message}`)
      }

      // Check if the user already has 2 shifts on this date
      const shiftDate = new Date(start_ts)
      const startOfDay = new Date(shiftDate)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(shiftDate)
      endOfDay.setHours(23, 59, 59, 999)

      let dayQuery = supabase
        .from('schedule_shifts')
        .select('*')
        .eq('user_id', user_id)
        .gte('start_ts', startOfDay.toISOString())
        .lt('start_ts', endOfDay.toISOString())

      if (exclude_shift_id) {
        dayQuery = dayQuery.neq('id', exclude_shift_id)
      }

      const { data: dayShifts, error: dayError } = await dayQuery

      if (dayError) {
        throw new Error(`Failed to check daily shift count: ${dayError.message}`)
      }

      const hasOverlap = (overlappingShifts?.length || 0) > 0
      const hasMaxShifts = (dayShifts?.length || 0) >= 2

      return {
        hasConflict: hasOverlap || hasMaxShifts,
        conflicts: overlappingShifts || []
      }
    }
  })

  return {
    createShift,
    updateShift,
    deleteShift,
    validateShiftConflicts
  }
}