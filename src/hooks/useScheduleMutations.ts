import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import type { ScheduleShift } from "../types";
import { deriveYearMonthVN } from "../utils/payrollUtils";
import { SUPABASE_ERROR_CODE_NO_ROWS } from "../constants/supabase";
import type { ShiftTemplate } from "../constants/shifts";

interface CreateScheduleShiftData {
  user_id: string;
  activity_id: string;
  start_ts: string;
  end_ts: string;
  template_name: ShiftTemplate;
  note?: string;
}

interface UpdateScheduleShiftData extends Partial<CreateScheduleShiftData> {
  id: string;
}

/**
 * Checks if a payroll period is locked for a given date
 */
async function checkPeriodLock(
  dateString: string
): Promise<{ isLocked: boolean; yearMonth: string }> {
  const yearMonth = deriveYearMonthVN(dateString);

  const { data, error } = await supabase
    .from("payroll_periods")
    .select("status")
    .eq("year_month", yearMonth)
    .maybeSingle();

  if (error && error.code !== SUPABASE_ERROR_CODE_NO_ROWS) {
    throw error;
  }

  return {
    isLocked: data?.status === "closed",
    yearMonth,
  };
}

export function useScheduleMutations() {
  const queryClient = useQueryClient();

  const createShift = useMutation({
    mutationFn: async (
      data: CreateScheduleShiftData
    ): Promise<ScheduleShift> => {
      // Check if the period is locked before creating
      const { isLocked, yearMonth } = await checkPeriodLock(data.start_ts);

      if (isLocked) {
        throw new Error(
          `Không thể thêm ca làm việc trong kỳ lương đã khóa (${yearMonth})`
        );
      }

      const { data: result, error } = await supabase
        .from("schedule_shifts")
        .insert(data)
        .select(
          `
          *,
          user:users(id, name, email),
          activity:activities(id, name)
        `
        )
        .single();

      if (error) {
        throw new Error(`Failed to create shift: ${error.message}`);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-shifts"] });
    },
  });

  const updateShift = useMutation({
    mutationFn: async (
      data: UpdateScheduleShiftData
    ): Promise<ScheduleShift> => {
      const { id, ...updateData } = data;

      // Always fetch the existing shift to check its original period
      // This prevents bypassing the lock by changing start_ts to a different period
      const { data: existingShift, error: fetchError } = await supabase
        .from("schedule_shifts")
        .select("start_ts")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch shift: ${fetchError.message}`);
      }

      // First: Check if the ORIGINAL shift is in a locked period
      // This prevents moving a shift OUT OF a locked period
      const { isLocked: isOriginalLocked, yearMonth: originalMonth } =
        await checkPeriodLock(existingShift.start_ts);

      if (isOriginalLocked) {
        throw new Error(
          `Không thể chỉnh sửa ca làm việc trong kỳ lương đã khóa (${originalMonth}). Vui lòng mở lại kỳ lương trước khi thay đổi.`
        );
      }

      // Second: If start_ts is being changed, check if the NEW period is locked
      // This prevents moving a shift INTO a locked period
      if (
        updateData.start_ts &&
        updateData.start_ts !== existingShift.start_ts
      ) {
        const { isLocked: isNewLocked, yearMonth: newMonth } =
          await checkPeriodLock(updateData.start_ts);

        if (isNewLocked) {
          throw new Error(
            `Không thể chuyển ca làm việc vào kỳ lương đã khóa (${newMonth}). Vui lòng mở lại kỳ lương trước khi thay đổi.`
          );
        }
      }

      const { data: result, error } = await supabase
        .from("schedule_shifts")
        .update({
          ...updateData,
          updated_at: new Date().toISOString(),
        })
        .eq("id", id)
        .select(
          `
          *,
          user:users(id, name, email),
          activity:activities(id, name)
        `
        )
        .single();

      if (error) {
        throw new Error(`Failed to update shift: ${error.message}`);
      }

      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-shifts"] });
    },
  });

  const deleteShift = useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // First, fetch the shift to check its date
      const { data: shift, error: fetchError } = await supabase
        .from("schedule_shifts")
        .select("start_ts")
        .eq("id", id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch shift: ${fetchError.message}`);
      }

      // Check if the period is locked before deleting
      const { isLocked, yearMonth } = await checkPeriodLock(shift.start_ts);

      if (isLocked) {
        throw new Error(
          `Không thể xóa ca làm việc trong kỳ lương đã khóa (${yearMonth})`
        );
      }

      const { error } = await supabase
        .from("schedule_shifts")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(`Failed to delete shift: ${error.message}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-shifts"] });
    },
  });

  const validateShiftConflicts = useMutation({
    mutationFn: async (data: {
      user_id: string;
      start_ts: string;
      end_ts: string;
      exclude_shift_id?: string;
    }): Promise<{ hasConflict: boolean; conflicts: ScheduleShift[] }> => {
      const { user_id, start_ts, end_ts, exclude_shift_id } = data;

      // Check for overlapping shifts
      let query = supabase
        .from("schedule_shifts")
        .select(
          `
          *,
          user:users(id, name, email),
          activity:activities(id, name)
        `
        )
        .eq("user_id", user_id)
        .or(`start_ts.lt.${end_ts},end_ts.gt.${start_ts}`);

      if (exclude_shift_id) {
        query = query.neq("id", exclude_shift_id);
      }

      const { data: overlappingShifts, error } = await query;

      if (error) {
        throw new Error(`Failed to validate shift conflicts: ${error.message}`);
      }

      // Check if the user already has 2 shifts on this date
      const shiftDate = new Date(start_ts);
      const startOfDay = new Date(shiftDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(shiftDate);
      endOfDay.setHours(23, 59, 59, 999);

      let dayQuery = supabase
        .from("schedule_shifts")
        .select("*")
        .eq("user_id", user_id)
        .gte("start_ts", startOfDay.toISOString())
        .lt("start_ts", endOfDay.toISOString());

      if (exclude_shift_id) {
        dayQuery = dayQuery.neq("id", exclude_shift_id);
      }

      const { data: dayShifts, error: dayError } = await dayQuery;

      if (dayError) {
        throw new Error(
          `Failed to check daily shift count: ${dayError.message}`
        );
      }

      const hasOverlap = (overlappingShifts?.length || 0) > 0;
      const hasMaxShifts = (dayShifts?.length || 0) >= 2;

      return {
        hasConflict: hasOverlap || hasMaxShifts,
        conflicts: overlappingShifts || [],
      };
    },
  });

  return {
    createShift,
    updateShift,
    deleteShift,
    validateShiftConflicts,
  };
}
