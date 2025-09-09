-- Change authentication from phone to email
-- This migration converts the phone-based synthetic email system to direct email authentication
-- All existing user data will be deleted as it's test data

-- Step 1: Delete all existing user data
DELETE FROM public.users;

-- Step 2: Modify users table structure - keep phone as custom info, add email for auth
ALTER TABLE public.users ADD COLUMN email VARCHAR(255) UNIQUE NOT NULL;

-- Step 3: Update indexes - keep both phone and email indexes
CREATE INDEX idx_users_email ON public.users(email);

-- Step 4: Update the handle_new_user function to work with direct email
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    -- Create profile for all new users (no more @mol-coffee restriction)
    IF NOT EXISTS (
        SELECT 1 FROM public.users WHERE auth_user_id = NEW.id
    ) THEN
        -- Auto-confirm the email for all users
        UPDATE auth.users 
        SET email_confirmed_at = NOW()
        WHERE id = NEW.id AND email_confirmed_at IS NULL;
        
        -- Create user profile with email directly
        INSERT INTO public.users (auth_user_id, email, name, role, status)
        VALUES (
            NEW.id,
            NEW.email,
            COALESCE(NEW.raw_user_meta_data->>'name', 'New User'),
            'employee',
            'active'
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 5: Update admin functions to work with email
DROP FUNCTION IF EXISTS promote_user_to_admin(VARCHAR);
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_email VARCHAR)
RETURNS TEXT AS $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Check if user exists
    SELECT COUNT(*) INTO user_count FROM public.users WHERE email = user_email;
    
    IF user_count = 0 THEN
        RETURN 'User with email ' || user_email || ' not found';
    END IF;
    
    -- Update user role to admin
    UPDATE public.users SET role = 'admin' WHERE email = user_email;
    
    RETURN 'User with email ' || user_email || ' promoted to admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 6: Update create_admin_user function to use direct email
DROP FUNCTION IF EXISTS create_admin_user(VARCHAR, VARCHAR, VARCHAR);
CREATE OR REPLACE FUNCTION create_admin_user(
    admin_email VARCHAR,
    admin_password VARCHAR,
    admin_name VARCHAR DEFAULT 'Admin User'
)
RETURNS TEXT AS $$
DECLARE
    admin_auth_id UUID;
BEGIN
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        RETURN 'User with email ' || admin_email || ' already exists';
    END IF;
    
    -- Create auth user with direct email
    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        created_at,
        updated_at,
        raw_app_meta_data,
        raw_user_meta_data,
        confirmation_token,
        email_change,
        email_change_token_new,
        recovery_token
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        gen_random_uuid(),
        'authenticated',
        'authenticated',
        admin_email,
        crypt(admin_password, gen_salt('bf')),
        NOW(),
        NOW(),
        NOW(),
        '{"provider": "email", "providers": ["email"]}',
        jsonb_build_object('name', admin_name),
        '',
        '',
        '',
        ''
    ) RETURNING id INTO admin_auth_id;
    
    -- The handle_new_user trigger will create the user profile
    -- Then update it to admin role
    UPDATE public.users 
    SET role = 'admin', name = admin_name
    WHERE auth_user_id = admin_auth_id;
    
    RETURN 'Admin user created successfully with email: ' || admin_email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Clean up auth.users table (remove test data with @mol-coffee emails)
DELETE FROM auth.users WHERE email LIKE '%@mol-coffee';