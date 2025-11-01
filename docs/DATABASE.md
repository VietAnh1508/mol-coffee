# MoL Coffee - Database Documentation

> **Purpose:** Comprehensive database schema documentation for the MoL Coffee scheduling and payroll system. This document serves as the single source of truth for understanding the database structure, eliminating the need to read multiple migration files and documentation.

## 🏗️ ARCHITECTURE OVERVIEW

**Database System:** PostgreSQL via Supabase
**Authentication:** Email-based with progressive profile completion
**Security Model:** Row Level Security (RLS) with role-based access control
**Language Support:** Vietnamese interface with localized data

### Key Design Principles
- **Single-branch MVP** - No multi-location support initially
- **Role-based data isolation** - Employees see own data, Admins see all
- **Schedule transparency** - Employees can view all schedules for coordination
- **Business rules enforcement** - Database-level constraints and triggers
- **Vietnamese localization** - Default activities and currency in Vietnamese

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

**Related Features:**
- **[Authentication System](features/authentication.md)** - User registration and login implementation
- **[Employee Management](features/employee-management.md)** - Role and status management

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

**Features:**
- Effective-dated rates for historical accuracy
- Vietnamese Dong (VND) currency
- Rate history preservation

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

**Features:**
- Period locking prevents schedule changes after payroll finalization
- Admin audit trail for period closures
- Monthly organization (YYYY-MM format)

**Related Features:**
- **[Payroll System](features/payroll.md)** - Period management and salary calculation

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

**Features:**
- Logs when an employee confirms their payroll for a specific period.
- Tracks when an admin acknowledges payout completion via `paid_at`.
- Enforces a single confirmation per employee-period pair with automatic timestamps.
- Cascades removals alongside payroll periods or user deletion.

**Access & RLS:**
- Employees can read, create, and update only their own confirmation row.
- Admins and supervisors have read access to all confirmations.
- Admins may delete confirmations if a payroll adjustment is needed.

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

### Key RLS Policies

```sql
-- Employee schedule coordination (Migration 20250911164958)
CREATE POLICY "Employees can view all shifts" ON public.schedule_shifts
    FOR SELECT USING (true);

-- Employee colleague information (Migration 20250911175745)
CREATE POLICY "Employees can view colleagues basic info" ON public.users
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Admin & supervisor data visibility
CREATE POLICY "Admins can view all users" ON public.users
    FOR SELECT USING (get_user_role(auth.uid()) IN ('admin', 'supervisor'));

-- Payroll confirmation visibility and ownership
CREATE POLICY "Employees can view their payroll confirmations" ON public.payroll_employee_confirmations
    FOR SELECT USING (user_id = get_user_by_auth_id(auth.uid()));

CREATE POLICY "Employees can upsert their payroll confirmations" ON public.payroll_employee_confirmations
    FOR INSERT WITH CHECK (user_id = get_user_by_auth_id(auth.uid()));

CREATE POLICY "Employees can maintain their payroll confirmations" ON public.payroll_employee_confirmations
    FOR UPDATE USING (user_id = get_user_by_auth_id(auth.uid()))
    WITH CHECK (user_id = get_user_by_auth_id(auth.uid()));

CREATE POLICY "Management can view all payroll confirmations" ON public.payroll_employee_confirmations
    FOR SELECT USING (get_user_role(auth.uid()) IN ('admin', 'supervisor'));

CREATE POLICY "Admins can manage payroll confirmations" ON public.payroll_employee_confirmations
    FOR ALL USING (get_user_role(auth.uid()) = 'admin');
```

- `enforce_payroll_paid_at_rules` trigger ensures only admins can set or clear `paid_at`, prevents marking payment before confirmation, and maintains an immutable payment timestamp unless explicitly cleared.
- `upsert_payroll_employee_confirmation(payroll_period_id, user_id, confirmed_at, paid_at)` helper allows backfills to set both confirmation and payment timestamps atomically (admin/service usage only).

---

## ⚖️ BUSINESS RULES & CONSTRAINTS

### Database-Enforced Rules

#### 1. Shift Overlap Prevention
```sql
CREATE OR REPLACE FUNCTION check_shift_overlap()
RETURNS TRIGGER AS $$
-- Prevents overlapping shifts for same user
-- Enforces maximum 2 shifts per day per employee
-- Evaluates Asia/Ho_Chi_Minh local day to respect Vietnam schedule boundaries (Migration 20251021090000)
```

#### 2. Admin Self-Management Prevention
```sql
CREATE OR REPLACE FUNCTION prevent_role_self_change()
RETURNS TRIGGER AS $$
-- Prevents users from changing their own role
-- Last admin protection (Business Rule #7)
```

#### 3. Auto Profile Creation
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
-- Creates user profile on auth signup
-- Auto-confirms emails
-- Generates placeholder phone numbers
```

---

## 📈 PERFORMANCE OPTIMIZATION

### Database Indexes
```sql
-- User lookups
CREATE INDEX idx_users_auth_user_id ON public.users(auth_user_id);
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_phone ON public.users(phone);

-- Schedule queries
CREATE INDEX idx_schedule_shifts_user_id ON public.schedule_shifts(user_id);
CREATE INDEX idx_schedule_shifts_time_range ON public.schedule_shifts(start_ts, end_ts);

-- Rate lookups
CREATE INDEX idx_rates_effective_period ON public.rates(effective_from, effective_to);

-- Time entries (future)
CREATE INDEX idx_time_entries_approved ON public.time_entries(approved_at) WHERE approved_at IS NOT NULL;
```

### Query Patterns
- **TanStack Query** for client-side caching (5-minute staleTime)
- **Optimistic updates** for immediate UI feedback
- **Background sync** for real-time data consistency
- **RLS-aware queries** via Supabase client

---

## 🗄️ MIGRATION HISTORY

### Key Migrations Timeline

| Date | Migration | Purpose |
|------|-----------|---------|
| 2025-08-30 | `20250830000001_initial_schema` | Core tables and enums |
| 2025-08-30 | `20250830000002_rls_policies` | Row Level Security setup |
| 2025-08-30 | `20250830000003_seed_data` | Vietnamese activities and rates |
| 2025-08-30 | `20250830000004_admin_functions` | Admin user management functions |
| 2025-09-09 | `20250909034138_change_phone_to_email_auth` | **Migration to email authentication** |
| 2025-09-09 | `20250909063909_update_handle_new_user_trigger_with_phone` | Placeholder phone system |
| 2025-09-11 | `20250911000001_remove_custom_shift_template` | Simplified shift templates |
| 2025-09-11 | `20250911164958_allow_employees_view_all_shifts` | **Employee schedule visibility** |
| 2025-09-11 | `20250911175745_allow_employees_view_colleagues_info` | Employee coordination access |
| 2025-09-19 | `20250919123000_allowance_rates` | Lunch allowance system |
| 2025-10-02 | `20251002140953_payroll_period_lock_enforcement` | Prevent edits to locked periods |
| 2025-10-21 | `20251021090000_update_shift_limit_timezone` | Asia/Ho_Chi_Minh day boundary fix |
| 2025-11-08 | `20251108090000_add_supervisor_role` | Added `supervisor` enum value |
| 2025-11-08 | `20251108090100_update_supervisor_policies` | Updated role safeguards and read policies |

### Major Schema Changes
1. **Authentication Migration (Sep 9, 2025):** Moved from phone-based synthetic emails to direct email authentication with progressive profile completion
2. **Schedule Visibility Enhancement (Sep 11, 2025):** Enabled employees to view all colleagues' schedules while maintaining admin-only modification rights
3. **Shift Template Simplification (Sep 11, 2025):** Removed custom shift support, standardized to morning/afternoon only

---

## 👨‍💻 DEVELOPMENT REFERENCE

### TypeScript Types
Located in `src/types/index.ts`:

```typescript
interface User {
  id: string
  email: string      // Added in migration 20250909034138
  phone: string      // Vietnamese mobile format
  name: string
  role: 'admin' | 'employee'
  status: 'active' | 'inactive'
  auth_user_id: string
}

interface ScheduleShift {
  id: string
  user_id: string
  activity_id: string
  start_ts: string
  end_ts: string
  template_name: 'morning' | 'afternoon'  // 'custom' removed
  is_manual: boolean
  note?: string
}
```

### Admin Functions
```sql
-- Create admin user with email
SELECT create_admin_user('admin@example.com', 'password', 'Admin Name');

-- Promote existing user to admin
SELECT promote_user_to_admin('user@example.com');
```

### Common Queries
```sql
-- Get employee schedule for a date
SELECT ss.*, u.name, a.name as activity_name
FROM schedule_shifts ss
JOIN users u ON ss.user_id = u.id
JOIN activities a ON ss.activity_id = a.id
WHERE DATE(ss.start_ts) = '2025-09-17';

-- Calculate monthly salary for user
SELECT
  u.name,
  SUM(EXTRACT(epoch FROM (ss.end_ts - ss.start_ts))/3600) as total_hours,
  SUM(EXTRACT(epoch FROM (ss.end_ts - ss.start_ts))/3600 * r.hourly_vnd) as total_salary_vnd
FROM schedule_shifts ss
JOIN users u ON ss.user_id = u.id
JOIN rates r ON ss.activity_id = r.activity_id
WHERE u.id = ? AND DATE_TRUNC('month', ss.start_ts) = '2025-09-01'
  AND ss.start_ts >= r.effective_from
  AND (r.effective_to IS NULL OR ss.start_ts <= r.effective_to);
```

---

## 🌍 VIETNAMESE LOCALIZATION

### Data Localization
- **Activities:** Vietnamese names (Thử việc, Cà phê, Bánh mì, Quản lý)
- **Currency:** Vietnamese Dong (VND) with proper formatting
- **Phone Format:** Vietnamese mobile (+84, 10 digits, specific prefixes)
- **Interface:** Vietnamese labels and error messages

### Phone Number Validation
```typescript
// Vietnamese mobile pattern: 10 digits starting with 03, 05, 07, 08, 09
const VIETNAMESE_PHONE_PATTERN = /^(03|05|07|08|09)\d{8}$/;
```

### Currency Display
```typescript
// Format: 25.000 ₫ (Vietnamese Dong formatting)
const formatMoney = (amount: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
```

---

## 🔄 CURRENT STATUS

**Phase:** Phase 1 MVP Complete (~95%)
**Last Updated:** October 31, 2025

### ✅ Completed Database Features
- Complete schema with 6 core tables
- Row Level Security with employee schedule visibility
- Business rules enforcement via triggers
- Vietnamese data localization
- Email authentication with progressive profile completion
- Payroll period management with locking
- Admin functions for user management

### 🚧 Future Database Enhancements (Phase 2+)
- Advanced time entries system (separate from schedules)
- Real-time subscriptions for live updates
- Multi-branch support (additional tables)
- Audit logging for administrative actions
- Database-level shift swap workflows
- Advanced reporting views and materialized tables

---

**For more information:**
- Technical setup: `docs/CLAUDE.md`
- Development progress: `docs/PROGRESS.md`
- Feature documentation: `docs/features/` directory
- Migration files: `supabase/migrations/`
