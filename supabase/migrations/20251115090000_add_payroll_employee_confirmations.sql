-- Payroll employee confirmations per period
-- Created: 2025-11-15

CREATE TABLE IF NOT EXISTS public.payroll_employee_confirmations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  payroll_period_id UUID NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payroll_employee_confirmations_period_user
  ON public.payroll_employee_confirmations (payroll_period_id, user_id);

CREATE INDEX IF NOT EXISTS idx_payroll_employee_confirmations_user
  ON public.payroll_employee_confirmations (user_id);

CREATE TRIGGER update_payroll_employee_confirmations_updated_at
  BEFORE UPDATE ON public.payroll_employee_confirmations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

ALTER TABLE public.payroll_employee_confirmations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employees can view their payroll confirmations"
  ON public.payroll_employee_confirmations
  FOR SELECT
  USING (user_id = get_user_by_auth_id(auth.uid()));

CREATE POLICY "Employees can upsert their payroll confirmations"
  ON public.payroll_employee_confirmations
  FOR INSERT
  WITH CHECK (user_id = get_user_by_auth_id(auth.uid()));

CREATE POLICY "Employees can maintain their payroll confirmations"
  ON public.payroll_employee_confirmations
  FOR UPDATE
  USING (user_id = get_user_by_auth_id(auth.uid()))
  WITH CHECK (user_id = get_user_by_auth_id(auth.uid()));

CREATE POLICY "Management can view all payroll confirmations"
  ON public.payroll_employee_confirmations
  FOR SELECT
  USING (get_user_role(auth.uid()) IN ('admin', 'supervisor'));

CREATE POLICY "Admins can manage payroll confirmations"
  ON public.payroll_employee_confirmations
  FOR ALL
  USING (get_user_role(auth.uid()) = 'admin');
