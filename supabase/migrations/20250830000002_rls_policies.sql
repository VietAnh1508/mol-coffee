-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.schedule_shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.time_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;

-- Helper function to get user role
CREATE OR REPLACE FUNCTION get_user_role(user_id UUID)
RETURNS user_role AS $$
    SELECT role FROM public.users WHERE auth_user_id = user_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Helper function to get user record by auth_user_id
CREATE OR REPLACE FUNCTION get_user_by_auth_id(auth_id UUID)
RETURNS UUID AS $$
    SELECT id FROM public.users WHERE auth_user_id = auth_id;
$$ LANGUAGE SQL SECURITY DEFINER;

-- Users table policies
CREATE POLICY "Users can view their own profile" ON public.users
    FOR SELECT USING (auth_user_id = auth.uid());

CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can insert users" ON public.users
    FOR INSERT WITH CHECK (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update users" ON public.users
    FOR UPDATE USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Users can update their own profile (limited)" ON public.users
    FOR UPDATE USING (auth_user_id = auth.uid())
    WITH CHECK (auth_user_id = auth.uid()); -- Users can only update their own profile

-- Function to prevent users from changing their own role
CREATE OR REPLACE FUNCTION prevent_role_self_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If user is trying to change their own role and they're not an admin
    IF OLD.auth_user_id = auth.uid() AND NEW.role != OLD.role THEN
        -- Check if current user is admin
        IF (SELECT role FROM public.users WHERE auth_user_id = auth.uid()) != 'admin' THEN
            RAISE EXCEPTION 'Users cannot change their own role';
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add trigger to prevent role self-change
CREATE TRIGGER prevent_role_self_change_trigger
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION prevent_role_self_change();

-- Activities table policies
CREATE POLICY "Everyone can view active activities" ON public.activities
    FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can view all activities" ON public.activities
    FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage activities" ON public.activities
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Rates table policies
CREATE POLICY "Everyone can view current rates" ON public.rates
    FOR SELECT USING (
        effective_from <= CURRENT_DATE AND 
        (effective_to IS NULL OR effective_to >= CURRENT_DATE)
    );

CREATE POLICY "Admins can view all rates" ON public.rates
    FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage rates" ON public.rates
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Schedule shifts table policies
CREATE POLICY "Users can view their own shifts" ON public.schedule_shifts
    FOR SELECT USING (user_id = get_user_by_auth_id(auth.uid()));

CREATE POLICY "Admins can view all shifts" ON public.schedule_shifts
    FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage shifts" ON public.schedule_shifts
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Time entries table policies
CREATE POLICY "Users can view their own time entries" ON public.time_entries
    FOR SELECT USING (user_id = get_user_by_auth_id(auth.uid()));

CREATE POLICY "Admins can view all time entries" ON public.time_entries
    FOR SELECT USING (get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can manage time entries" ON public.time_entries
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Payroll periods table policies
CREATE POLICY "Users can view payroll periods" ON public.payroll_periods
    FOR SELECT USING (true); -- Everyone can see payroll periods

CREATE POLICY "Admins can manage payroll periods" ON public.payroll_periods
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');