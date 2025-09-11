-- Allow employees to view all schedule shifts while maintaining write restrictions for admins only

-- Drop the existing employee-specific SELECT policy that restricts employees to their own shifts
DROP POLICY IF EXISTS "Users can view their own shifts" ON public.schedule_shifts;

-- Create new policy that allows employees to view all shifts (read-only)
CREATE POLICY "Employees can view all shifts" ON public.schedule_shifts
    FOR SELECT USING (true); -- All authenticated users can view all shifts

-- Keep admin policies unchanged - they already had full access
-- The existing admin policies remain:
-- - "Admins can view all shifts" (redundant now but harmless)
-- - "Admins can manage shifts" (INSERT/UPDATE/DELETE still restricted to admins)

-- This change allows employees to see colleagues' schedules for better coordination
-- while maintaining the security principle that only admins can modify shift data
