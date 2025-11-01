-- Add paid_at tracking to payroll confirmations
-- Created: 2025-11-16

ALTER TABLE public.payroll_employee_confirmations
  ADD COLUMN IF NOT EXISTS paid_at TIMESTAMPTZ;

CREATE OR REPLACE FUNCTION public.enforce_payroll_paid_at_rules()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  actor_role TEXT := get_user_role(auth.uid());
BEGIN
  -- Allow system/service operations where auth.uid() is null
  IF actor_role IS NULL THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.paid_at IS NOT NULL THEN
      IF actor_role <> 'admin' THEN
        RAISE EXCEPTION 'Chỉ quản trị viên mới có thể đánh dấu đã thanh toán.'
          USING ERRCODE = '42501';
      END IF;
      IF NEW.confirmed_at IS NULL THEN
        RAISE EXCEPTION 'Không thể đánh dấu thanh toán khi chưa xác nhận bảng lương.'
          USING ERRCODE = '23514';
      END IF;
    END IF;
    RETURN NEW;
  END IF;

  IF TG_OP = 'UPDATE' THEN
    IF NEW.paid_at IS DISTINCT FROM OLD.paid_at THEN
      IF actor_role <> 'admin' THEN
        RAISE EXCEPTION 'Chỉ quản trị viên mới có thể cập nhật trạng thái thanh toán.'
          USING ERRCODE = '42501';
      END IF;

      IF NEW.paid_at IS NOT NULL AND OLD.confirmed_at IS NULL THEN
        RAISE EXCEPTION 'Không thể đánh dấu thanh toán khi chưa xác nhận bảng lương.'
          USING ERRCODE = '23514';
      END IF;

      IF NEW.paid_at IS NOT NULL AND OLD.paid_at IS NOT NULL THEN
        RAISE EXCEPTION 'Không thể thay đổi thời gian thanh toán; chỉ có thể bỏ đánh dấu.'
          USING ERRCODE = '23514';
      END IF;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS enforce_payroll_paid_at_rules ON public.payroll_employee_confirmations;

CREATE TRIGGER enforce_payroll_paid_at_rules
  BEFORE INSERT OR UPDATE ON public.payroll_employee_confirmations
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_payroll_paid_at_rules();

CREATE OR REPLACE FUNCTION public.upsert_payroll_employee_confirmation(
  p_payroll_period_id UUID,
  p_user_id UUID,
  p_confirmed_at TIMESTAMPTZ,
  p_paid_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS public.payroll_employee_confirmations
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth
AS $$
DECLARE
  confirmation public.payroll_employee_confirmations;
BEGIN
  INSERT INTO public.payroll_employee_confirmations (
    payroll_period_id,
    user_id,
    confirmed_at,
    paid_at
  )
  VALUES (
    p_payroll_period_id,
    p_user_id,
    COALESCE(p_confirmed_at, NOW()),
    p_paid_at
  )
  ON CONFLICT (payroll_period_id, user_id)
  DO UPDATE
    SET confirmed_at = EXCLUDED.confirmed_at,
        paid_at = EXCLUDED.paid_at,
        updated_at = NOW()
  RETURNING * INTO confirmation;

  RETURN confirmation;
END;
$$;
