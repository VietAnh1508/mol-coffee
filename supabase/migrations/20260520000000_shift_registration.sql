-- Migration: Shift Registration Feature
-- Description: Adds shift_registration_boards and shift_registrations tables with lock enforcement,
--              atomic submit RPC, and RLS policies for the employee shift registration feature.
-- Created: 2026-05-20

-- Table: shift_registration_boards
-- One row per week; tracks whether registration is locked for that week.
CREATE TABLE public.shift_registration_boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    week_start_date DATE NOT NULL UNIQUE,
    is_locked BOOLEAN DEFAULT false NOT NULL,
    locked_by UUID REFERENCES public.users(id),
    locked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT shift_registration_boards_lock_check CHECK (
        (is_locked = false AND locked_by IS NULL AND locked_at IS NULL) OR
        (is_locked = true  AND locked_by IS NOT NULL AND locked_at IS NOT NULL)
    )
);

CREATE TRIGGER update_shift_registration_boards_updated_at
    BEFORE UPDATE ON public.shift_registration_boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: shift_registrations
-- One row per (user, day, shift) slot. registered_at drives avatar display order.
CREATE TABLE public.shift_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    week_start_date DATE NOT NULL,
    day_date DATE NOT NULL,
    shift_template shift_template NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT shift_registrations_unique_slot UNIQUE (user_id, day_date, shift_template)
);

CREATE INDEX idx_shift_registrations_week_start ON public.shift_registrations(week_start_date);
CREATE INDEX idx_shift_registrations_user_week  ON public.shift_registrations(user_id, week_start_date);

CREATE TRIGGER update_shift_registrations_updated_at
    BEFORE UPDATE ON public.shift_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger function: block INSERT/DELETE on shift_registrations when the board is locked.
-- When no board row exists for the week, v_is_locked is NULL — check passes (unlocked by default).
CREATE OR REPLACE FUNCTION check_shift_registration_board_lock()
RETURNS TRIGGER AS $$
DECLARE
    v_is_locked BOOLEAN;
    v_week_start DATE;
BEGIN
    IF TG_OP = 'DELETE' THEN
        v_week_start := OLD.week_start_date;
    ELSE
        v_week_start := NEW.week_start_date;
    END IF;

    SELECT is_locked INTO v_is_locked
    FROM public.shift_registration_boards
    WHERE week_start_date = v_week_start;

    IF v_is_locked = true THEN
        RAISE EXCEPTION 'Bảng đăng ký ca đã bị khoá. Liên hệ admin để thay đổi.'
            USING ERRCODE = 'P0001';
    END IF;

    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS shift_registration_lock_check ON public.shift_registrations;
CREATE TRIGGER shift_registration_lock_check
    BEFORE INSERT OR DELETE ON public.shift_registrations
    FOR EACH ROW EXECUTE FUNCTION check_shift_registration_board_lock();

-- RPC: submit_shift_registrations
-- Atomically diffs the user's registrations for the given week inside a single transaction.
-- ON CONFLICT DO NOTHING preserves registered_at for unchanged rows (avatar display order).
CREATE OR REPLACE FUNCTION submit_shift_registrations(
    p_week_start DATE,
    p_user_id UUID,
    p_slots JSONB
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_is_locked BOOLEAN;
    v_slot JSONB;
    v_day_date DATE;
    v_template shift_template;
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
    WHERE user_id = p_user_id
      AND week_start_date = p_week_start
      AND NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(p_slots) s
          WHERE (s->>'day_date')::DATE = day_date
            AND (s->>'shift_template')::shift_template = shift_template
      );

    -- Insert newly selected slots; ON CONFLICT DO NOTHING preserves registered_at
    FOR v_slot IN SELECT * FROM jsonb_array_elements(p_slots) LOOP
        v_day_date := (v_slot->>'day_date')::DATE;
        v_template := (v_slot->>'shift_template')::shift_template;

        INSERT INTO public.shift_registrations (user_id, week_start_date, day_date, shift_template)
        VALUES (p_user_id, p_week_start, v_day_date, v_template)
        ON CONFLICT (user_id, day_date, shift_template) DO NOTHING;
    END LOOP;
END;
$$;

-- RLS: shift_registrations
ALTER TABLE public.shift_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read shift registrations"
    ON public.shift_registrations FOR SELECT
    USING (auth.role() = 'authenticated');

-- Defense-in-depth: direct INSERT/DELETE require employee role.
-- Normal submit flow uses the SECURITY DEFINER RPC which bypasses RLS.
CREATE POLICY "Employees can insert own shift registrations"
    ON public.shift_registrations FOR INSERT
    WITH CHECK (
        user_id = get_user_by_auth_id(auth.uid())
        AND get_user_role(auth.uid()) = 'employee'
    );

CREATE POLICY "Employees can delete own shift registrations"
    ON public.shift_registrations FOR DELETE
    USING (
        user_id = get_user_by_auth_id(auth.uid())
        AND get_user_role(auth.uid()) = 'employee'
    );

-- RLS: shift_registration_boards
ALTER TABLE public.shift_registration_boards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can read shift registration boards"
    ON public.shift_registration_boards FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Admins can manage shift registration boards"
    ON public.shift_registration_boards FOR ALL
    USING (get_user_role(auth.uid()) = 'admin')
    WITH CHECK (get_user_role(auth.uid()) = 'admin');
