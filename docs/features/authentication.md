# Authentication System

> **Feature Status:** ✅ **COMPLETED** - Phase 1 MVP
> **Vietnamese Interface:** ✅ Fully localized
> **Database Integration:** ✅ Email-based auth with progressive profile completion

## Overview

The MoL Coffee authentication system provides secure email-based authentication with progressive profile completion for optimal user experience. The system is designed with Vietnamese coffee shop operations in mind.

## Features

### Progressive Registration Flow
- **Initial signup:** email (unique) + password only
- **Profile completion:** name + phone required on first login
- **Vietnamese mobile phone validation:** 10 digits, 03/05/07/08/09 prefixes
- **Login:** email + password
- **Change password:** self-service with current password verification

### Key Characteristics
- **Email Authentication:** Direct Supabase email authentication (migrated from phone-based in Sep 2025)
- **Auto Email Confirmation:** All users auto-confirmed via database trigger
- **Placeholder Phone System:** Auto-generated placeholder phones (`+84000000XXX`) until user provides real number
- **Vietnamese Localization:** Interface labels and validation messages in Vietnamese
- **Security:** bcrypt/argon2 password hashing, HTTPS, brute-force throttling

## Technical Implementation

### Authentication Flow
```
1. User registers with email + password
2. Database trigger creates profile with placeholder phone
3. User logs in successfully
4. ProfileCompletionModal appears if profile incomplete
5. User provides name + phone (validated)
6. Profile updated, modal disappears
7. User proceeds to dashboard
```

### Database Schema
```sql
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,              -- Added in migration 20250909034138
    phone VARCHAR(15) UNIQUE NOT NULL,               -- Vietnamese mobile format
    name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'employee' NOT NULL,
    status user_status DEFAULT 'active' NOT NULL,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### Phone Number Validation
```typescript
// Vietnamese mobile pattern: 10 digits starting with 03, 05, 07, 08, 09
const VIETNAMESE_PHONE_PATTERN = /^(03|05|07|08|09)\d{8}$/;
```

### Admin User Management
- **Admin accounts:** Seeded manually in DB via SQL functions
- **Admin creation:** `SELECT create_admin_user('EMAIL', 'PASSWORD', 'NAME');`
- **User promotion:** `SELECT promote_user_to_admin('EMAIL');`

## Security Features

### Access Control
- **Row Level Security (RLS):** Database-enforced role-based access
- **Role Isolation:** Employees see own data, Admins see all
- **Password Policy:** Minimum 6 characters (configurable)
- **Session Management:** Supabase handles secure sessions

### Business Rules
1. **Employee Registration Only:** New users can only register as employees
2. **Admin Self-Management Prevention:** Admins cannot demote themselves or deactivate their own accounts
3. **Last Admin Protection:** Cannot demote the last remaining admin

## User Interface

### Components
- **LoginPage:** Combined login/signup with Vietnamese labels
- **ProfileCompletionModal:** Progressive profile completion flow
- **ProfilePage:** User profile editing with Vietnamese phone validation
- **ChangePasswordPage:** Secure password change with policy display
- **PasswordPolicy:** Reusable password requirements component

### Vietnamese Localization
- **Interface Labels:** All UI text in Vietnamese
- **Error Messages:** Vietnamese validation messages
- **Phone Format:** Vietnamese mobile number format display
- **Success Messages:** Vietnamese feedback for user actions

## Development Status

### ✅ Completed Features (Phase 1)
- [x] **Email Authentication System**
  - [x] ~~Phone number → synthetic email conversion (@mol-coffee pattern)~~ **MIGRATED TO EMAIL**
  - [x] Direct email authentication with Supabase
  - [x] User registration with email + password + name
  - [x] Login with email + password
  - [x] Phone number stored as optional user information
  - [x] Auto email confirmation for all users
  - [x] User profile auto-creation via database trigger
  - [x] Success message + redirect flow after signup
  - [x] Admin user creation functions (email-based)

- [x] **Profile Management**
  - [x] Progressive profile completion with ProfileCompletionModal
  - [x] Vietnamese phone number validation (10 digits, 03/05/07/08/09 prefixes)
  - [x] User profile editing with form validation
  - [x] Phone number requirement for admin contact purposes

- [x] **Password Management**
  - [x] Secure password change page with current password verification
  - [x] Password visibility toggle for all password fields
  - [x] Comprehensive form validation with Vietnamese error messages
  - [x] Password policy enforcement (minimum 6 characters)
  - [x] Supabase auth integration with updateUser API
  - [x] Success feedback and form reset on completion
  - [x] Reusable PasswordPolicy component with flexible variants
  - [x] Centralized password constants for maintainability
  - [x] Consistent policy display across signup and password change flows

- [x] **User Profile & Settings** ✅ **COMPLETED**
  - [x] User profile page with edit functionality
    - [x] Mobile-first design with responsive layout
    - [x] Edit name and phone number with form validation
    - [x] Vietnamese phone number validation (10 digits, 03/05/07/08/09 prefixes)
    - [x] Toast notifications for success/error feedback
    - [x] Accessible via user dropdown menu in navigation
  - [x] Change password functionality
    - [x] Secure password change page with current password verification
    - [x] Password visibility toggle for all password fields
    - [x] Comprehensive form validation with Vietnamese error messages
    - [x] Password policy enforcement (minimum 6 characters)
    - [x] Supabase auth integration with updateUser API
    - [x] Success feedback and form reset on completion
  - [x] Password policy system
    - [x] Reusable PasswordPolicy component with flexible variants
    - [x] Centralized password constants for maintainability
    - [x] Consistent policy display across signup and password change flows

### 🚧 Future Enhancements
- [ ] User preferences and settings
- [ ] Advanced profile customization
- [ ] Two-factor authentication (2FA)
- [ ] Social login integration

### Migration History
- **Migration 20250909034138:** Converted from phone-based to email authentication
- **Migration 20250909044537:** Added phone column with placeholder system
- **Migration 20250909063909:** Updated user creation trigger with phone handling

## API Reference

### Database Functions
```sql
-- Create admin user
SELECT create_admin_user('admin@example.com', 'password123', 'Admin Name');

-- Promote existing user to admin
SELECT promote_user_to_admin('user@example.com');

-- Get user role (utility function)
SELECT get_user_role(auth.uid());
```

### Frontend Hooks
```typescript
// Authentication context
const { user, loading, signIn, signUp, signOut } = useAuth();

// Profile management
const { mutate: updateProfile } = useUpdateUserProfile();

// Password change
const { mutate: changePassword } = useChangePassword();
```

## Testing

### Auth Flow Testing
- **Signup Flow:** Test email + password → success message → login
- **Profile Completion:** Test progressive completion modal
- **Phone Validation:** Test Vietnamese mobile number format
- **Role Access:** Verify admin vs employee data visibility
- **Password Change:** Test current password verification and policy enforcement

### Security Testing
- **RLS Verification:** Ensure employees cannot access admin data
- **Session Management:** Test session expiration and refresh
- **Input Validation:** Test malicious input handling
- **Rate Limiting:** Verify brute-force protection

## Related Documentation

- **Database Schema:** [docs/DATABASE.md](../DATABASE.md) - Complete user table schema and RLS policies
- **Overall Progress:** [docs/PROGRESS.md](../PROGRESS.md) - Authentication system development status
- **Development Context:** [docs/CLAUDE.md](../CLAUDE.md) - Architecture decisions and patterns

---

**Last Updated:** September 19, 2025
**Status:** Production Ready ✅
