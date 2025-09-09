-- Update handle_new_user trigger to include placeholder phone number

-- First, drop existing trigger and function (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Create updated function that includes placeholder phone
-- Set SECURITY DEFINER so it runs with creator's permissions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  -- Create profile for all new users
  IF NOT EXISTS (
    SELECT 1 FROM public.users WHERE auth_user_id = NEW.id
  ) THEN
    -- Auto-confirm the email for all users (IMPORTANT: kept from previous migration)
    UPDATE auth.users 
    SET email_confirmed_at = NOW()
    WHERE id = NEW.id AND email_confirmed_at IS NULL;
    
    -- Generate placeholder phone using first 3 chars of user ID
    INSERT INTO public.users (
      auth_user_id,
      email,
      name,
      phone,
      role,
      status
    ) VALUES (
      NEW.id,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'name', ''),
      '+84000000' || SUBSTR(NEW.id::text, 1, 3),
      'employee',
      'active'
    );
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate trigger (idempotent)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();