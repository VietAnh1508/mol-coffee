-- Function to promote a user to admin (for existing users)
CREATE OR REPLACE FUNCTION promote_user_to_admin(user_phone VARCHAR)
RETURNS TEXT AS $$
DECLARE
    user_count INTEGER;
BEGIN
    -- Check if user exists
    SELECT COUNT(*) INTO user_count FROM public.users WHERE phone = user_phone;
    
    IF user_count = 0 THEN
        RETURN 'User with phone ' || user_phone || ' not found';
    END IF;
    
    -- Update user role to admin
    UPDATE public.users SET role = 'admin' WHERE phone = user_phone;
    
    RETURN 'User with phone ' || user_phone || ' promoted to admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create admin user directly
CREATE OR REPLACE FUNCTION create_admin_user(
    admin_phone VARCHAR,
    admin_password VARCHAR,
    admin_name VARCHAR DEFAULT 'Admin User'
)
RETURNS TEXT AS $$
DECLARE
    admin_auth_id UUID;
    admin_email VARCHAR;
BEGIN
    -- Create email from phone
    admin_email := admin_phone || '@mol-coffee';
    
    -- Check if user already exists
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = admin_email) THEN
        RETURN 'User with phone ' || admin_phone || ' already exists';
    END IF;
    
    -- Create auth user
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
    
    RETURN 'Admin user created successfully with phone: ' || admin_phone;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;