-- Allowance rates: effective-dated per-day allowances (e.g., lunch allowance)

-- Create allowance_type enum if not exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'allowance_type') THEN
    CREATE TYPE allowance_type AS ENUM ('lunch');
  END IF;
END$$;

-- Create allowance_rates table
CREATE TABLE IF NOT EXISTS public.allowance_rates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type allowance_type NOT NULL,
  amount_vnd INTEGER NOT NULL,
  effective_from DATE NOT NULL,
  effective_to DATE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT allowance_rates_effective_period_check CHECK (
    effective_to IS NULL OR effective_to > effective_from
  )
);

-- Indexes to speed up lookups by type and date
CREATE INDEX IF NOT EXISTS idx_allowance_rates_type_from ON public.allowance_rates (type, effective_from DESC);
CREATE INDEX IF NOT EXISTS idx_allowance_rates_type_to ON public.allowance_rates (type, effective_to);

-- Enable RLS
ALTER TABLE public.allowance_rates ENABLE ROW LEVEL SECURITY;

-- Policies
-- Everyone authenticated can read allowance rates (needed for payroll calc and history)
DROP POLICY IF EXISTS "Everyone can view allowance rates" ON public.allowance_rates;
CREATE POLICY "Everyone can view allowance rates" ON public.allowance_rates
  FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admins can manage allowance rates
DROP POLICY IF EXISTS "Admins can manage allowance rates" ON public.allowance_rates;
CREATE POLICY "Admins can manage allowance rates" ON public.allowance_rates
  FOR ALL USING (get_user_role(auth.uid()) = 'admin');

-- Seed initial lunch allowance if none active exists
INSERT INTO public.allowance_rates (type, amount_vnd, effective_from, effective_to)
SELECT 'lunch', 30000, CURRENT_DATE, NULL
WHERE NOT EXISTS (
  SELECT 1 FROM public.allowance_rates
  WHERE type = 'lunch' AND effective_to IS NULL
);

