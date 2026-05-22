-- Migration: Shift Registration Annotations
-- Description: Adds custom_start_time, custom_end_time, and note annotation columns
--              to shift_registrations. Updates the submit RPC to ON CONFLICT DO UPDATE
--              and extends the lock trigger to also fire on UPDATE.
-- Created: 2026-05-21

-- Add annotation columns (all nullable — existing rows are unaffected)
ALTER TABLE public.shift_registrations
    ADD COLUMN custom_start_time TIME,
    ADD COLUMN custom_end_time   TIME,
    ADD COLUMN note              TEXT;

-- Constraint: end time must be after start time (only when both are set)
ALTER TABLE public.shift_registrations
    ADD CONSTRAINT chk_custom_time_order
    CHECK (
        custom_end_time IS NULL OR
        custom_start_time IS NULL OR
        custom_end_time > custom_start_time
    );

-- Constraint: morning shift custom times must stay within 06:00–12:00
ALTER TABLE public.shift_registrations
    ADD CONSTRAINT chk_morning_window
    CHECK (
        shift_template <> 'morning' OR (
            (custom_start_time IS NULL OR custom_start_time >= '06:00') AND
            (custom_end_time   IS NULL OR custom_end_time   <= '12:00')
        )
    );

-- Constraint: afternoon shift custom times must stay within 12:00–18:00
ALTER TABLE public.shift_registrations
    ADD CONSTRAINT chk_afternoon_window
    CHECK (
        shift_template <> 'afternoon' OR (
            (custom_start_time IS NULL OR custom_start_time >= '12:00') AND
            (custom_end_time   IS NULL OR custom_end_time   <= '18:00')
        )
    );

-- Extend lock trigger to also fire on BEFORE UPDATE so direct UPDATE bypassing
-- the RPC is blocked when the board is locked (same function, broader event list).
DROP TRIGGER IF EXISTS shift_registration_lock_check ON public.shift_registrations;
CREATE TRIGGER shift_registration_lock_check
    BEFORE INSERT OR UPDATE OR DELETE ON public.shift_registrations
    FOR EACH ROW EXECUTE FUNCTION check_shift_registration_board_lock();

-- Update RPC: submit_shift_registrations
-- ON CONFLICT now DO UPDATE to persist annotation changes; registered_at is
-- intentionally excluded so avatar display order is preserved on re-submit.
CREATE OR REPLACE FUNCTION submit_shift_registrations(
    p_week_start DATE,
    p_user_id    UUID,
    p_slots      JSONB
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_is_locked    BOOLEAN;
    v_slot         JSONB;
    v_day_date     DATE;
    v_template     shift_template;
    v_custom_start TIME;
    v_custom_end   TIME;
    v_note         TEXT;
BEGIN
    -- Ownership check: caller must be acting on their own user record
    IF p_user_id <> get_user_by_auth_id(auth.uid()) THEN
        RAISE EXCEPTION 'Không có quyền đăng ký ca cho người dùng khác.'
            USING ERRCODE = 'P0001';
    END IF;

    -- Lock check
    SELECT is_locked INTO v_is_locked
    FROM public.shift_registration_boards
    WHERE week_start_date = p_week_start;

    IF v_is_locked = true THEN
        RAISE EXCEPTION 'Bảng đăng ký ca đã bị khoá. Liên hệ admin để thay đổi.'
            USING ERRCODE = 'P0001';
    END IF;

    -- Delete slots that are no longer selected
    DELETE FROM public.shift_registrations
    WHERE user_id        = p_user_id
      AND week_start_date = p_week_start
      AND NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(p_slots) s
          WHERE (s->>'day_date')::DATE        = day_date
            AND (s->>'shift_template')::shift_template = shift_template
      );

    -- Upsert selected slots with annotation data
    FOR v_slot IN SELECT * FROM jsonb_array_elements(p_slots) LOOP
        v_day_date     := (v_slot->>'day_date')::DATE;
        v_template     := (v_slot->>'shift_template')::shift_template;
        v_custom_start := NULLIF(v_slot->>'custom_start_time', '')::TIME;
        v_custom_end   := NULLIF(v_slot->>'custom_end_time',   '')::TIME;
        v_note         := NULLIF(v_slot->>'note', '');

        INSERT INTO public.shift_registrations
            (user_id, week_start_date, day_date, shift_template,
             custom_start_time, custom_end_time, note)
        VALUES
            (p_user_id, p_week_start, v_day_date, v_template,
             v_custom_start, v_custom_end, v_note)
        ON CONFLICT (user_id, day_date, shift_template) DO UPDATE
            SET custom_start_time = EXCLUDED.custom_start_time,
                custom_end_time   = EXCLUDED.custom_end_time,
                note              = EXCLUDED.note,
                updated_at        = NOW();
        -- registered_at is intentionally excluded — avatar order is preserved
    END LOOP;
END;
$$;
