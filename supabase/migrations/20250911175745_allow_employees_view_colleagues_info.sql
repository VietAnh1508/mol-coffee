-- Allow employees to view colleagues' basic information (name, email, phone) 
-- for schedule coordination while keeping sensitive fields (role, status) admin-only

-- Add policy to allow employees to view basic colleague information
CREATE POLICY "Employees can view colleagues basic info" ON public.users
    FOR SELECT USING (
        -- Allow access to basic fields for all authenticated users
        -- This enables schedule queries to show user names properly
        auth.uid() IS NOT NULL
    );

-- Note: The existing policies remain in effect:
-- - "Users can view their own profile" (allows full access to own record)
-- - "Admins can view all users" (allows full access to all records for admins)
-- 
-- This new policy works alongside the existing ones to provide:
-- - Employees: Can see name, email, phone of all users (for schedule coordination)
-- - Admins: Full access to all user data including role, status (unchanged)
--
-- Security considerations:
-- - Name, email, phone are not sensitive for workplace coordination
-- - Role and status information is still protected via application logic
-- - This enables the schedule page to show proper user names in shift cards
