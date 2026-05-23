-- Admin utility: register shift slots on behalf of an employee, identified by
-- email. Mirrors submit_shift_registrations logic (full replace for the week)
-- but skips the ownership check and is restricted to service_role only.
CREATE OR REPLACE FUNCTION admin_submit_shift_registrations_by_email(
    p_employee_email  TEXT,
    p_week_start      DATE,
    p_slots           JSONB  -- [{"day_date": "YYYY-MM-DD", "shift_template": "morning|afternoon"}, ...]
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_user_id      UUID;
    v_is_locked    BOOLEAN;
    v_slot         JSONB;
    v_day_date     DATE;
    v_template     shift_template;
BEGIN
    -- Resolve employee by email
    SELECT id INTO v_user_id
    FROM public.users
    WHERE email = lower(trim(p_employee_email));

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Không tìm thấy nhân viên với email: %', p_employee_email
            USING ERRCODE = 'P0001';
    END IF;

    -- Lock check (NULL = board not yet created = unlocked)
    SELECT is_locked INTO v_is_locked
    FROM public.shift_registration_boards
    WHERE week_start_date = p_week_start;

    IF v_is_locked = true THEN
        RAISE EXCEPTION 'Bảng đăng ký ca đã bị khoá.'
            USING ERRCODE = 'P0001';
    END IF;

    -- Delete slots no longer in the provided list
    DELETE FROM public.shift_registrations sr
    WHERE sr.user_id         = v_user_id
      AND sr.week_start_date = p_week_start
      AND NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(p_slots) s
          WHERE (s->>'day_date')::DATE                 = sr.day_date
            AND (s->>'shift_template')::shift_template = sr.shift_template
      );

    -- Upsert provided slots
    FOR v_slot IN SELECT * FROM jsonb_array_elements(p_slots) LOOP
        v_day_date := (v_slot->>'day_date')::DATE;
        v_template := (v_slot->>'shift_template')::shift_template;

        INSERT INTO public.shift_registrations
            (user_id, week_start_date, day_date, shift_template)
        VALUES
            (v_user_id, p_week_start, v_day_date, v_template)
        ON CONFLICT (user_id, day_date, shift_template) DO NOTHING;
    END LOOP;
END;
$$;

-- Callable by service_role only (Supabase dashboard / backend scripts)
REVOKE EXECUTE ON FUNCTION admin_submit_shift_registrations_by_email(TEXT, DATE, JSONB)
    FROM PUBLIC, anon, authenticated;

/*
 * USAGE
 * -----
 * Run from the Supabase SQL editor (service_role context).
 *
 * Register specific slots for an employee:
 *
 *   SELECT admin_submit_shift_registrations_by_email(
 *       'employee@example.com',
 *       '2026-05-26',        -- week_start: must be the Monday of the target week
 *       '[
 *           {"day_date": "2026-05-26", "shift_template": "morning"},
 *           {"day_date": "2026-05-27", "shift_template": "afternoon"},
 *           {"day_date": "2026-05-28", "shift_template": "morning"}
 *       ]'::jsonb
 *   );
 *
 * Clear all registrations for an employee for a given week:
 *
 *   SELECT admin_submit_shift_registrations_by_email(
 *       'employee@example.com',
 *       '2026-05-26',
 *       '[]'::jsonb
 *   );
 *
 * Notes:
 *   - p_slots is a full replacement: any existing slot not in the list is deleted.
 *   - shift_template must be one of: 'morning', 'afternoon'.
 *   - Will raise an exception if the board is locked or the email is not found.
 */
