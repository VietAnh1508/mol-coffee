import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { useAuth } from "./useAuth";
import { isAdmin, isEmployee } from "../constants/userRoles";
import type { ShiftTemplate } from "../constants/shifts";

interface SubmitSlot {
  day_date: string;
  shift_template: ShiftTemplate;
}

interface SubmitParams {
  weekStart: string;
  userId: string;
  slots: SubmitSlot[];
}

interface ToggleLockParams {
  weekStart: string;
  currentlyLocked: boolean;
}

export function useShiftRegistrationMutations() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  const submit = useMutation({
    mutationFn: async ({ weekStart, userId, slots }: SubmitParams) => {
      if (!isEmployee(user?.role)) {
        throw new Error("Chỉ nhân viên mới có thể đăng ký ca.");
      }

      const { error } = await supabase.rpc("submit_shift_registrations", {
        p_week_start: weekStart,
        p_user_id: userId,
        p_slots: slots,
      });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (_data, { weekStart }) => {
      queryClient.invalidateQueries({ queryKey: ["shift-registrations", weekStart] });
    },
  });

  const toggleLock = useMutation({
    mutationFn: async ({ weekStart, currentlyLocked }: ToggleLockParams) => {
      if (!isAdmin(user?.role)) {
        throw new Error("Chỉ admin mới có thể khoá/mở bảng đăng ký.");
      }

      const now = new Date().toISOString();
      const payload = currentlyLocked
        ? { week_start_date: weekStart, is_locked: false, locked_by: null, locked_at: null }
        : { week_start_date: weekStart, is_locked: true, locked_by: user!.id, locked_at: now };

      const { error } = await supabase
        .from("shift_registration_boards")
        .upsert(payload, { onConflict: "week_start_date" });

      if (error) {
        throw new Error(error.message);
      }
    },
    onSuccess: (_data, { weekStart }) => {
      queryClient.invalidateQueries({ queryKey: ["shift-registration-board", weekStart] });
    },
  });

  return { submit, toggleLock };
}
