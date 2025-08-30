-- Insert default activities
INSERT INTO public.activities (name, is_active) VALUES
    ('Thử việc', true),
    ('Cà phê', true),
    ('Bánh mì', true),
    ('Quản lý', true);

-- Insert default rates (example rates in VND)
INSERT INTO public.rates (activity_id, hourly_vnd, effective_from) VALUES
    ((SELECT id FROM public.activities WHERE name = 'Thử việc'), 20000, '2025-01-01'),
    ((SELECT id FROM public.activities WHERE name = 'Cà phê'), 22000, '2025-01-01'),
    ((SELECT id FROM public.activities WHERE name = 'Bánh mì'), 25000, '2025-01-01'),
    ((SELECT id FROM public.activities WHERE name = 'Quản lý'), 28000, '2025-01-01');

-- Create function to automatically create user profile on auth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create profile if it doesn't exist and email follows our pattern
    IF NEW.email LIKE '%@mol-coffee' AND NOT EXISTS (
        SELECT 1 FROM public.users WHERE auth_user_id = NEW.id
    ) THEN
        -- Extract phone from email (everything before @mol-coffee)
        INSERT INTO public.users (auth_user_id, phone, name, role, status)
        VALUES (
            NEW.id,
            REPLACE(NEW.email, '@mol-coffee', ''),
            COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
            'employee',
            'active'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to automatically create user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to prevent shift overlaps
CREATE OR REPLACE FUNCTION check_shift_overlap()
RETURNS TRIGGER AS $$
BEGIN
    -- Check for overlapping shifts for the same user
    IF EXISTS (
        SELECT 1 FROM public.schedule_shifts 
        WHERE user_id = NEW.user_id 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND (
            (NEW.start_ts >= start_ts AND NEW.start_ts < end_ts) OR
            (NEW.end_ts > start_ts AND NEW.end_ts <= end_ts) OR
            (NEW.start_ts <= start_ts AND NEW.end_ts >= end_ts)
        )
    ) THEN
        RAISE EXCEPTION 'Shift overlaps with existing shift for this user';
    END IF;

    -- Check maximum 2 shifts per day per user
    IF (
        SELECT COUNT(*) FROM public.schedule_shifts 
        WHERE user_id = NEW.user_id 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
        AND DATE(start_ts) = DATE(NEW.start_ts)
    ) >= 2 THEN
        RAISE EXCEPTION 'Maximum 2 shifts per day per user exceeded';
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add shift overlap check trigger
CREATE TRIGGER check_shift_overlap_trigger
    BEFORE INSERT OR UPDATE ON public.schedule_shifts
    FOR EACH ROW EXECUTE FUNCTION check_shift_overlap();