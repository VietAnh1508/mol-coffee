# MoL Coffee - Database Documentation

> **Purpose:** Comprehensive database schema documentation for the MoL Coffee scheduling and payroll system. This document serves as the single source of truth for understanding the database structure, eliminating the need to read multiple migration files and documentation.

## 🏗️ OVERVIEW

> Employees can view **all** colleagues' schedules (not just their own) — this is intentional for coordination.

### 📚 Feature-Specific Documentation

For detailed feature documentation, see:

- **[Authentication System](features/authentication.md)** - User registration, login, and profile management
- **[Employee Management](features/employee-management.md)** - Role-based user administration
- **[Scheduling System](features/scheduling.md)** - Shift management and conflict prevention
- **[Settings Management](features/settings.md)** - Activities and rates configuration
- **[Payroll System](features/payroll.md)** - Salary calculation and period management

---

## 📋 COMPLETE SCHEMA

### Custom Enums

```sql
-- User roles in the system
CREATE TYPE user_role AS ENUM ('admin', 'employee');

-- User account status
CREATE TYPE user_status AS ENUM ('active', 'inactive');

-- Shift time templates (custom removed in migration 20250911000001)
CREATE TYPE shift_template AS ENUM ('morning', 'afternoon');

-- Time entry sources for future timekeeping
CREATE TYPE time_entry_source AS ENUM ('schedule', 'manual');

-- Payroll period status
CREATE TYPE payroll_status AS ENUM ('open', 'closed');

-- Allowance types (for per-day allowances like lunch)
CREATE TYPE allowance_type AS ENUM ('lunch');
```

**Supervisor Access:** `user_role` enum includes `supervisor`; RLS policies grant supervisors admin-level SELECT access while keeping mutations restricted to admins, and triggers enforce last-admin protections.

### Core Tables

#### 1. `users` - Employee & Admin Profiles

```sql
CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,              -- Added in migration 20250909034138
    phone VARCHAR(15) UNIQUE NOT NULL,               -- Vietnamese mobile format
    name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'employee' NOT NULL,
    status user_status DEFAULT 'active' NOT NULL,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    avatar_url TEXT,                                  -- Added in migration 20260602000000; public CDN URL with cache-buster
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Key Features:**

- Email authentication (migrated from phone-based in Sep 2025)
- Vietnamese phone validation (10 digits, 03/05/07/08/09 prefixes)
- Progressive profile completion (email+password → name+phone)
- Placeholder phone system (`+84000000XXX`) until real number provided
- Role hierarchy: `admin` (full access), `supervisor` (read-only management), `employee` (self-service access)

**Avatar Storage:**

- `avatar_url` stores a public CDN URL pointing to `storage/avatars/{auth_user_id}/avatar` with a `?v=<timestamp>` cache-buster appended on each upload so the browser fetches the new image despite the stable path.
- The storage path uses `auth_user_id` (not the `users.id` PK) because Supabase Storage RLS evaluates `auth.uid()`, which matches the auth UUID.
- Removing an avatar sets `avatar_url` to `NULL`; the app falls back to initials display.

**Related Features:**

- **[Authentication System](features/authentication.md)** - User registration and login implementation
- **[Employee Management](features/employee-management.md)** - Role and status management
- **[Avatar Upload](avatar-upload-plan.md)** - Avatar upload and display

#### 2. `activities` - Work Activity Types

```sql
CREATE TABLE public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Default Vietnamese Activities:**

- `Thử việc` (Trial work) - 20,000 VND/hour
- `Cà phê` (Coffee service) - 22,000 VND/hour
- `Bánh mì` (Bread/food service) - 25,000 VND/hour
- `Quản lý` (Management) - 28,000 VND/hour

**Related Features:**

- **[Settings Management](features/settings.md)** - Activities and rates configuration

#### 3. `rates` - Activity-Based Hourly Rates

```sql
CREATE TABLE public.rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    hourly_vnd INTEGER NOT NULL,                     -- Vietnamese Dong
    effective_from DATE NOT NULL,
    effective_to DATE,                               -- NULL = current rate
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT rates_effective_period_check CHECK (effective_to IS NULL OR effective_to > effective_from)
);
```

#### 4. `schedule_shifts` - Employee Work Schedules

```sql
CREATE TABLE public.schedule_shifts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    start_ts TIMESTAMP WITH TIME ZONE NOT NULL,
    end_ts TIMESTAMP WITH TIME ZONE NOT NULL,
    template_name shift_template DEFAULT 'morning' NOT NULL,
    is_manual BOOLEAN DEFAULT false NOT NULL,        -- Tracks admin manual edits
    note TEXT,                                       -- Admin notes for adjustments
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT schedule_shifts_time_check CHECK (end_ts > start_ts)
);
```

**Template System:**

- `morning`: 06:00-12:00
- `afternoon`: 12:00-18:00
- ~~`custom`~~: Removed in migration 20250911000001

**Business Rules (Database Enforced):**

- Maximum 2 shifts per day per employee
- No overlapping shifts per employee
- Activity cannot change mid-shift

**Related Features:**

- **[Scheduling System](features/scheduling.md)** - Shift management and conflict prevention
- **[Payroll System](features/payroll.md)** - Schedule-based salary calculation

#### 5. `time_entries` - Future Timekeeping System

```sql
CREATE TABLE public.time_entries (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    activity_id UUID REFERENCES public.activities(id) ON DELETE CASCADE NOT NULL,
    start_ts TIMESTAMP WITH TIME ZONE NOT NULL,
    end_ts TIMESTAMP WITH TIME ZONE NOT NULL,
    source time_entry_source DEFAULT 'manual' NOT NULL,
    approved_by UUID REFERENCES public.users(id),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT time_entries_time_check CHECK (end_ts > start_ts),
    CONSTRAINT time_entries_approval_check CHECK (
        (approved_by IS NULL AND approved_at IS NULL) OR
        (approved_by IS NOT NULL AND approved_at IS NOT NULL)
    )
);
```

**Current Status:** Reserved for Phase 2 - Payroll currently calculated directly from `schedule_shifts`

#### 6. `payroll_periods` - Monthly Payroll Management

```sql
CREATE TABLE public.payroll_periods (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    year_month VARCHAR(7) UNIQUE NOT NULL,           -- Format: YYYY-MM
    status payroll_status DEFAULT 'open' NOT NULL,
    closed_by UUID REFERENCES public.users(id),     -- Admin who closed period
    closed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT payroll_periods_closure_check CHECK (
        (status = 'open' AND closed_by IS NULL AND closed_at IS NULL) OR
        (status = 'closed' AND closed_by IS NOT NULL AND closed_at IS NOT NULL)
    )
);
```

**Note:** Locking a period prevents any further schedule changes for that month.

**Related Features:**

- **[Payroll System](features/payroll.md)** - Period management and salary calculation

#### 7. `recipes` - Drink Recipe Catalog

```sql
CREATE TABLE public.recipes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

**Purpose:**

- Serves as the read-only catalogue of pha chế (drink-making) recipes
- Supports localized Vietnamese copy for quicker onboarding of new staff
- Slug doubles as stable route identifier for the PWA

**Access Model:**

- RLS grants all authenticated users (`admin`, `supervisor`, `employee`) read access
- Only admins may create, update, or delete recipes

#### 8. `recipe_steps` - Step-by-Step Instructions

```sql
CREATE TABLE public.recipe_steps (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id UUID REFERENCES public.recipes(id) ON DELETE CASCADE NOT NULL,
    step_number INTEGER NOT NULL,
    instruction TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT recipe_steps_step_number_check CHECK (step_number > 0),
    CONSTRAINT recipe_steps_unique_step UNIQUE (recipe_id, step_number)
);
```

**Access Model:**

- Mirror of `recipes` policies: everyone authenticated can read, only admins mutate

#### 7. `allowance_rates` - Effective-Dated Allowances (Per-Day)

```sql
CREATE TABLE public.allowance_rates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    type allowance_type NOT NULL,                   -- e.g., 'lunch'
    amount_vnd INTEGER NOT NULL,                    -- VND amount per day
    effective_from DATE NOT NULL,
    effective_to DATE,                              -- NULL = current amount
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT allowance_rates_effective_period_check CHECK (effective_to IS NULL OR effective_to > effective_from)
);
```

**Features:**

- Effective-dated per-day allowances (initially lunch allowance)
- Used in payroll to add bonus on qualifying days (2 shifts/day)

**Access & RLS:**

- RLS enabled
- Everyone authenticated can `SELECT` for calculation and history
- Admins can `INSERT/UPDATE/DELETE` via Settings

**Example: Get applicable allowance for a date**

```sql
SELECT amount_vnd FROM allowance_rates
WHERE type = 'lunch' AND effective_from <= $1::date
  AND (effective_to IS NULL OR effective_to > $1::date)
ORDER BY effective_from DESC
LIMIT 1;
```

#### 9. `shift_registration_boards` - Weekly Registration Lock State

```sql
CREATE TABLE public.shift_registration_boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    week_start_date DATE NOT NULL UNIQUE,
    is_locked BOOLEAN DEFAULT false NOT NULL,
    locked_by UUID REFERENCES public.users(id),
    locked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT shift_registration_boards_lock_check CHECK (
        (is_locked = false AND locked_by IS NULL AND locked_at IS NULL) OR
        (is_locked = true  AND locked_by IS NOT NULL AND locked_at IS NOT NULL)
    )
);
```

**Note:** A missing row means the week is unlocked — no row needs to be created until an admin explicitly locks it.

**Access & RLS:**

- All authenticated users can `SELECT`
- Only `admin` role may `INSERT/UPDATE/DELETE`

#### 10. `shift_registrations` - Employee Shift Preferences

```sql
CREATE TABLE public.shift_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    week_start_date DATE NOT NULL,
    day_date DATE NOT NULL,
    shift_template shift_template NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    -- Annotation columns (migration 20260521000000)
    custom_start_time TIME,        -- null = use shift default
    custom_end_time   TIME,        -- null = use shift default
    note              TEXT,        -- max 200 chars enforced by application
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT shift_registrations_unique_slot UNIQUE (user_id, day_date, shift_template),
    CONSTRAINT chk_custom_time_order  CHECK (custom_end_time IS NULL OR custom_start_time IS NULL OR custom_end_time > custom_start_time),
    CONSTRAINT chk_morning_window     CHECK (shift_template <> 'morning'   OR ((custom_start_time IS NULL OR custom_start_time >= '06:00') AND (custom_end_time IS NULL OR custom_end_time <= '12:00'))),
    CONSTRAINT chk_afternoon_window   CHECK (shift_template <> 'afternoon' OR ((custom_start_time IS NULL OR custom_start_time >= '12:00') AND (custom_end_time IS NULL OR custom_end_time <= '18:00')))
);
```

**Features:**

- One row per (user, day, shift) slot; unique constraint prevents duplicates
- `registered_at` drives avatar display order in the registration grid (first-in, leftmost)
- Resubmit uses `ON CONFLICT DO UPDATE` to persist annotation changes; `registered_at` is excluded so avatar order is preserved
- Board lock enforced by `check_shift_registration_board_lock` trigger on `INSERT`, `UPDATE`, and `DELETE`
- Atomic submit via `submit_shift_registrations(p_week_start, p_user_id, p_slots)` SECURITY DEFINER RPC
- Annotation fields (`custom_start_time`, `custom_end_time`, `note`) are optional per-slot employee notes about partial attendance

**Access & RLS:**

- All authenticated users can `SELECT`
- Employees can `INSERT/DELETE` their own rows (defense-in-depth; normal path uses the RPC)
- Supervisors have read-only access

**Related Features:**

- **[Shift Registration](features/shift-registration.md)** — Employee self-service shift preference board
- **[Shift Registration Annotations](features/shift-registration-annotations.md)** — Per-slot partial-shift annotation (AC8)

#### 8. `payroll_employee_confirmations` - Employee Payroll Sign-off

```sql
CREATE TABLE public.payroll_employee_confirmations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    payroll_period_id UUID REFERENCES public.payroll_periods(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    confirmed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    paid_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    CONSTRAINT payroll_employee_confirmations_period_user UNIQUE (payroll_period_id, user_id)
);
```

**Note:** `paid_at` is set by an admin to acknowledge cash payout — it is distinct from the employee's own `confirmed_at`.

**Access & RLS:**

- Employees can read, create, and update only their own confirmation row.
- Admins and supervisors have read access to all confirmations.
- Admins may delete confirmations if a payroll adjustment is needed.

---

### Supabase Storage

#### `avatars` bucket

| Property           | Value                                                                 |
| ------------------ | --------------------------------------------------------------------- |
| Bucket ID          | `avatars`                                                             |
| Public             | `true` (CDN reads bypass RLS; no signed URLs needed)                  |
| File size limit    | 2 MB                                                                  |
| Allowed MIME types | `image/jpeg`, `image/png`, `image/webp`                               |
| Object path        | `{auth_user_id}/avatar` (one slot per user, overwritten on re-upload) |

**RLS Policies on `storage.objects`:**

> **Note:** Policies intentionally omit `TO authenticated`. Supabase Storage connects to Postgres as the `supabase_storage_admin` role — not `authenticated` — so `TO authenticated` policies are never matched. Auth is still enforced because `auth.uid()` returns `NULL` for unauthenticated requests, making the path-match condition false.

| Policy                               | Operation | Condition                                                                                                                      |
| ------------------------------------ | --------- | ------------------------------------------------------------------------------------------------------------------------------ |
| Users can upload their own avatar    | INSERT    | `bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text`                                                   |
| Users can update their own avatar    | UPDATE    | Same (both `USING` and `WITH CHECK`)                                                                                           |
| Users can delete their own avatar    | DELETE    | `bucket_id = 'avatars' AND (storage.foldername(name))[1] = auth.uid()::text`                                                   |
| Authenticated users can view avatars | SELECT    | `bucket_id = 'avatars'` (broad read needed for upsert's internal conflict check and for colleagues' avatars in calendar views) |

---

## 🔐 ROW LEVEL SECURITY (RLS)

All tables have RLS enabled with role-based policies:

### User Access Patterns

#### **Employees Can:**

- ✅ View their own profile (full access)
- ✅ View all colleagues' basic info (name, email, phone) - for coordination
- ✅ View all schedule shifts (read-only) - for schedule visibility
- ✅ View their own time entries and salary data
- ✅ View current activity rates and payroll periods
- ✅ Confirm and view their own payroll sign-off status
- ❌ Modify any shifts or admin data

#### **Admins Can:**

- ✅ Full CRUD access to all data
- ✅ Manage users, activities, rates, shifts, payroll periods
- ✅ View all employee data including roles and status
- ❌ Demote themselves or delete their own account (Business Rule #7)

#### **Supervisors Can:**

- ✅ View all management data (employees, schedules, payroll, settings)
- ✅ Audit payroll periods and schedule history in read-only mode
- ❌ Perform INSERT/UPDATE/DELETE operations on protected tables
- ❌ Promote/demote users or adjust statuses (UI + RLS guarded)

- `enforce_payroll_paid_at_rules` trigger: only admins can set or clear `paid_at`; payment cannot be marked before confirmation; timestamp is immutable once set unless explicitly cleared.
- `upsert_payroll_employee_confirmation(payroll_period_id, user_id, confirmed_at, paid_at)` RPC: sets both confirmation and payment timestamps atomically (admin/service use only).

---

## ⚖️ BUSINESS RULES & CONSTRAINTS

### Database-Enforced Rules

- **`check_shift_overlap`** trigger: prevents overlapping shifts per user; enforces max 2 shifts/day; day boundary evaluated in `Asia/Ho_Chi_Minh` (not UTC).
- **`prevent_role_self_change`** trigger: users cannot change their own role; last-admin protection (cannot demote or delete the final admin).
- **`handle_new_user`** trigger: creates a `users` profile on auth signup, auto-confirms the email, and assigns a placeholder phone (`+84000000XXX`) until the user provides a real one.

---

## 👨‍💻 DEVELOPMENT REFERENCE

### Admin Functions

```sql
-- Create admin user with email
SELECT create_admin_user('admin@example.com', 'password', 'Admin Name');

-- Promote existing user to admin
SELECT promote_user_to_admin('user@example.com');
```
