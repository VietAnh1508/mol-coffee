-- Migration: Admin delete shift registration board
-- Description: Adds an admin-only RPC to delete all registrations and the board record for a given
--              week. The function unlocks the board first so the existing lock trigger does not block
--              the cascade delete of shift_registrations.
-- Created: 2026-06-09

CREATE OR REPLACE FUNCTION delete_shift_registration_board(
    p_week_start DATE
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF get_user_role(auth.uid()) <> 'admin' THEN
        RAISE EXCEPTION 'Chỉ admin mới có thể xoá bảng đăng ký ca.'
            USING ERRCODE = 'P0001';
    END IF;

    -- Unlock first so the board-lock trigger allows the DELETE below.
    UPDATE public.shift_registration_boards
    SET is_locked = false, locked_by = NULL, locked_at = NULL
    WHERE week_start_date = p_week_start;

    DELETE FROM public.shift_registrations
    WHERE week_start_date = p_week_start;

    DELETE FROM public.shift_registration_boards
    WHERE week_start_date = p_week_start;
END;
$$;
