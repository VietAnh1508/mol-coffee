-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'employee');
CREATE TYPE user_status AS ENUM ('active', 'inactive');
CREATE TYPE shift_template AS ENUM ('morning', 'afternoon', 'custom');
CREATE TYPE time_entry_source AS ENUM ('schedule', 'manual');
CREATE TYPE payroll_status AS ENUM ('open', 'closed');

-- Create users table
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'employee' NOT NULL,
    status user_status DEFAULT 'active' NOT NULL,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create activities table
CREATE TABLE public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create rates table
CREATE TABLE public.rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    hourly_vnd INTEGER NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT rates_effective_period_check CHECK (effective_to IS NULL OR effective_to > effective_from)
);

-- Create schedule_shifts table
CREATE TABLE public.schedule_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    start_ts TIMESTAMP WITH TIME ZONE NOT NULL,
    end_ts TIMESTAMP WITH TIME ZONE NOT NULL,
    template_name shift_template DEFAULT 'custom' NOT NULL,
    is_manual BOOLEAN DEFAULT false NOT NULL,
    note TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT schedule_shifts_time_check CHECK (end_ts > start_ts)
);

-- Create time_entries table
CREATE TABLE public.time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    start_ts TIMESTAMP WITH TIME ZONE NOT NULL,
    end_ts TIMESTAMP WITH TIME ZONE NOT NULL,
    source time_entry_source DEFAULT 'manual' NOT NULL,
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT time_entries_time_check CHECK (end_ts > start_ts),
    CONSTRAINT time_entries_approval_check CHECK (
        (approved_by IS NULL AND approved_at IS NULL) OR 
        (approved_by IS NOT NULL AND approved_at IS NOT NULL)
    )
);

-- Create payroll_periods table
CREATE TABLE public.payroll_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year_month VARCHAR(7) UNIQUE NOT NULL, -- Format: YYYY-MM
    status payroll_status DEFAULT 'open' NOT NULL,
    closed_by UUID REFERENCES public.users(id),
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT payroll_periods_closure_check CHECK (
        (status = 'open' AND closed_by IS NULL AND closed_at IS NULL) OR
        (status = 'closed' AND closed_by IS NOT NULL AND closed_at IS NOT NULL)
    )
);

-- Create indexes for better performance
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_phone ON public.users(phone);
CREATE INDEX idx_rates_activity_id ON public.rates(activity_id);
CREATE INDEX idx_rates_effective_period ON public.rates(effective_from, effective_to);
CREATE INDEX idx_schedule_shifts_user_id ON public.schedule_shifts(user_id);
CREATE INDEX idx_schedule_shifts_activity_id ON public.schedule_shifts(activity_id);
CREATE INDEX idx_schedule_shifts_time_range ON public.schedule_shifts(start_ts, end_ts);
CREATE INDEX idx_time_entries_user_id ON public.time_entries(user_id);
CREATE INDEX idx_time_entries_activity_id ON public.time_entries(activity_id);
CREATE INDEX idx_time_entries_time_range ON public.time_entries(start_ts, end_ts);
CREATE INDEX idx_time_entries_approved ON public.time_entries(approved_at) WHERE approved_at IS NOT NULL;

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON public.activities
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rates_updated_at BEFORE UPDATE ON public.rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_schedule_shifts_updated_at BEFORE UPDATE ON public.schedule_shifts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_time_entries_updated_at BEFORE UPDATE ON public.time_entries
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payroll_periods_updated_at BEFORE UPDATE ON public.payroll_periods
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();