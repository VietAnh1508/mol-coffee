# Database Migrations

This directory contains the database migrations for the Coffee Shop Management System.

> **📋 For comprehensive database schema documentation, see [`docs/DATABASE.md`](../docs/DATABASE.md)**

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

## Migration Notes

### Important Schema Changes
- **Migration 20250909034138**: Converted from phone-based to email authentication
- **Migration 20250911000001**: Removed 'custom' shift template, simplified to morning/afternoon
- **Migration 20250911164958**: Enabled employees to view all schedules (coordination)
- **Migration 20250911175745**: Allowed employees to view colleague contact info

### Payroll Model
- **Current approach**: Direct calculation from `schedule_shifts` table
- **Future enhancement**: Separate `time_entries` system for advanced timekeeping
- **Period locking**: Prevents schedule changes after payroll finalization
