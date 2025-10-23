-- Migration: Update supervisor policies and role safeguards
-- Description: Re-create triggers and broaden read policies now that supervisor enum exists
-- Created: 2025-11-08

-- Reinforce self-role change protection and last-admin safeguard
CREATE OR REPLACE FUNCTION prevent_role_self_change()
RETURNS TRIGGER AS $$
DECLARE
  remaining_admins INTEGER;
BEGIN
  -- Block users from altering their own role. Admins cannot self-demote.
  IF OLD.auth_user_id = auth.uid() AND NEW.role <> OLD.role THEN
    IF OLD.role = 'admin' THEN
      RAISE EXCEPTION 'Admins cannot change their own role';
    ELSE
      RAISE EXCEPTION 'Users cannot change their own role';
    END IF;
  END IF;

  -- Always ensure at least one admin remains in the system
  IF OLD.role = 'admin' AND NEW.role <> 'admin' THEN
    SELECT COUNT(*)
      INTO remaining_admins
      FROM public.users
      WHERE role = 'admin'
        AND id <> OLD.id;

    IF remaining_admins = 0 THEN
      RAISE EXCEPTION 'Cannot demote the last remaining admin';
    END IF;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update policies so supervisors inherit admin read access while edits stay admin-only
ALTER POLICY "Admins can view all users" ON public.users
  USING (get_user_role(auth.uid()) IN ('admin', 'supervisor'));

ALTER POLICY "Admins can view all activities" ON public.activities
  USING (get_user_role(auth.uid()) IN ('admin', 'supervisor'));

ALTER POLICY "Admins can view all rates" ON public.rates
  USING (get_user_role(auth.uid()) IN ('admin', 'supervisor'));

ALTER POLICY "Admins can view all shifts" ON public.schedule_shifts
  USING (get_user_role(auth.uid()) IN ('admin', 'supervisor'));

ALTER POLICY "Admins can view all time entries" ON public.time_entries
  USING (get_user_role(auth.uid()) IN ('admin', 'supervisor'));

-- Allow supervisors to see allowance history but keep mutations admin-only
ALTER POLICY "Everyone can view allowance rates" ON public.allowance_rates
  USING (auth.uid() IS NOT NULL);
