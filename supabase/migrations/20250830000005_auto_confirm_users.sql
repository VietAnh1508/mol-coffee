-- Update the handle_new_user function to auto-confirm emails
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Only create profile if it doesn't exist and email follows our pattern
    IF NEW.email LIKE '%@mol-coffee' AND NOT EXISTS (
        SELECT 1 FROM public.users WHERE auth_user_id = NEW.id
    ) THEN
        -- Auto-confirm the email since we're using phone-based auth
        UPDATE auth.users 
        SET email_confirmed_at = NOW()
        WHERE id = NEW.id AND email_confirmed_at IS NULL;
        
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

-- Auto-confirm any existing unconfirmed @mol-coffee users
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email LIKE '%@mol-coffee' 
AND email_confirmed_at IS NULL;