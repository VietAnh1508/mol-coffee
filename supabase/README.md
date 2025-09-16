# Database Schema & Migrations

This directory contains the database schema and migrations for the Coffee Shop Management System.

## Setup

1. **Link to Supabase project:**
   ```bash
   pnpm run supabase link --project-ref kngqtplideqcsaculhek
   ```

2. **Apply migrations to remote database:**
   ```bash
   pnpm run db:push
   ```

## Available Commands

- `pnpm run db:push` - Apply local migrations to remote database
- `pnpm run db:pull` - Pull remote schema changes to local
- `pnpm run db:reset` - Reset local database to match migrations
- `pnpm run db:diff` - Show differences between local and remote
- `pnpm run db:migration <name>` - Create new migration file

## Migration Files

### 20250830000001_initial_schema.sql
- Creates all tables (users, activities, rates, schedule_shifts, time_entries, payroll_periods)
- Defines custom types and constraints
- Sets up indexes for performance
- Adds update timestamp triggers
- Note: time_entries table exists but payroll uses schedule_shifts directly

### 20250830000002_rls_policies.sql
- Enables Row Level Security on all tables
- Creates role-based access policies
- Employees can only see their own data
- Admins have full access

### 20250830000003_seed_data.sql
- Inserts default activities (Coffee, Bread, Cleaning, Training)
- Sets up initial hourly rates
- Creates user profile creation trigger
- Adds shift overlap validation

## Schema Overview

```
users
├── id (UUID)
├── phone (VARCHAR) - unique
├── name (VARCHAR)
├── role (admin|employee)
├── status (active|inactive)
└── auth_user_id (UUID) -> auth.users

activities
├── id (UUID)
├── name (VARCHAR) - unique
└── is_active (BOOLEAN)

rates
├── id (UUID)
├── activity_id (UUID) -> activities
├── hourly_vnd (INTEGER)
├── effective_from (DATE)
└── effective_to (DATE)

schedule_shifts (PRIMARY PAYROLL SOURCE)
├── id (UUID)
├── user_id (UUID) -> users
├── activity_id (UUID) -> activities
├── start_ts (TIMESTAMP)
├── end_ts (TIMESTAMP)
├── template_name (morning|afternoon|custom)
├── is_manual (BOOLEAN)
└── note (TEXT)
└── Note: Serves as both schedule and actual work record for payroll

time_entries (RESERVED FOR FUTURE)
├── id (UUID)
├── user_id (UUID) -> users
├── activity_id (UUID) -> activities
├── start_ts (TIMESTAMP)
├── end_ts (TIMESTAMP)
├── source (schedule|manual)
├── approved_by (UUID) -> users
└── approved_at (TIMESTAMP)
└── Note: Currently unused - payroll calculated from schedule_shifts

payroll_periods
├── id (UUID)
├── year_month (VARCHAR) - format: YYYY-MM
├── status (open|closed)
├── closed_by (UUID) -> users
└── closed_at (TIMESTAMP)
```

## Business Rules Enforced

- **Max 2 shifts per day** per employee
- **No overlapping shifts** for same employee
- **Activity immutability** within shifts
- **Email authentication** with progressive profile completion
- **Role-based data access** (RLS policies)
- **Automatic user profile creation** on auth signup
- **Payroll period locking** prevents changes to closed periods
- **Schedule-based payroll** - shifts serve as actual work records
- **Direct schedule editing** for late arrivals/early departures

## Payroll Calculation Model

**Simplified Approach**: Payroll is calculated directly from `schedule_shifts` table.

- **Data Source**: `schedule_shifts.start_ts` and `schedule_shifts.end_ts`
- **Rate Application**: `rates` table with effective dating
- **Formula**: `SUM(EXTRACT(EPOCH FROM (end_ts - start_ts))/3600 * hourly_vnd)`
- **Adjustments**: Admins edit schedule times directly for actual hours worked
- **Period Locking**: `payroll_periods` prevents schedule changes after payroll finalization

**Benefits**:
- Single source of truth (schedule = actual work)
- Simplified data model
- Real-time payroll calculations
- No duplicate timekeeping systems
