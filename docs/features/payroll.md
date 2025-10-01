# Payroll & Salary System

> **Feature Status:** ✅ **COMPLETED** - Phase 1 MVP with ⚠️ **Enhancement Opportunities**
> **Vietnamese Interface:** ✅ Fully localized with VND currency formatting
> **Role-Based Access:** ✅ Admins see all, Employees see own data only

## Overview

The payroll system provides comprehensive salary calculation and management based on scheduled work shifts. It features role-based access control, period management, and Vietnamese currency formatting for coffee shop operations.

## Core Features

### Schedule-Based Payroll Calculation
- **Direct Calculation:** Uses `schedule_shifts` table as source of truth (simplified approach)
- **Effective-Dated Rates:** Applies correct hourly rates based on work date and activity
- **Activity-Based Tracking:** Separate hour tracking and rate calculations per activity
- **Vietnamese Currency:** Proper VND formatting with Vietnamese number localization

### Role-Based Access Control
- **Admin Access:** View all employees' salary data and manage payroll periods
- **Employee Access:** View only own salary data with automatic redirection
- **Data Isolation:** Database-enforced privacy via Row Level Security

### Period Management
- **Monthly Periods:** Organize payroll by month (YYYY-MM format)
- **Period Locking:** Prevent schedule changes after payroll finalization
- **Admin Audit Trail:** Track who closed/opened periods and when
- **Status Tracking:** Open/closed period management

## Technical Implementation

### Database Schema

#### Payroll Periods Table
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

### Payroll Calculation Logic
```sql
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

#### Month Boundary Handling
- PostgreSQL stores `schedule_shifts.start_ts`/`end_ts` as `timestamptz`. To keep payroll periods aligned with Vietnam's local month we apply the `VN_TIMEZONE_OFFSET_MINUTES` (UTC+7) constant when building the ISO date range in `createMonthDateRange`.
- The range is shifted by the offset before converting to ISO, so filtering on `start_ts` with `.gte(start)`/`.lte(end)` returns exactly the local month's shifts while still catching overnight jobs that finish after midnight.

### Vietnamese Currency Formatting
```typescript
// Format: 25.000 ₫ (Vietnamese Dong formatting)
const formatMoney = (amount: number) =>
  new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND'
  }).format(amount);
```

## User Interface

### Admin Payroll Interface
- **Employee List View:** Overview of all employees with navigation to details
- **Monthly Summary Cards:** Total employees, hours, and salary for period
- **Period Management:** Create, lock, and unlock payroll periods
- **Individual Employee Details:** Dedicated pages for detailed salary breakdown

### Employee Payroll Interface
- **Auto-redirect:** Automatically navigate to own salary detail page
- **Personal Salary View:** Own monthly salary breakdown with activity details
- **Period Status:** Visual indicators for open/closed periods
- **Read-only Access:** Cannot modify any payroll data

### Data Display Components
- **PayrollDataDisplay:** Organized presentation of salary information
- **PayrollDailyBreakdown:** Expandable daily view with date-grouped details
- **Period Status Banners:** Vietnamese localized status indicators
- **Activity Breakdown:** Hour and rate details per activity type

## Key Components

### Period Management
- **PayrollPeriodManager:** Full CRUD operations for payroll periods
- **PayrollPeriodForm:** Period creation with validation
- **Period Locking System:** Prevents schedule modifications when closed
- **Admin Controls:** Lock/unlock periods with audit trail

### Salary Calculation
- **usePayrollCalculations Hook:** Centralized calculation logic
- **Real-time Updates:** TanStack Query caching with background sync
- **Activity-based Rates:** Apply correct rates based on effective dates
- **Daily Breakdown:** Granular day-by-day salary details

## Development Status

### ✅ Completed Features (Phase 1)

- [x] **Schedule-based Payroll Calculation System**
  - [x] Direct calculation from schedule_shifts table (simplified approach)
  - [x] Effective-dated rate application with time range validation
  - [x] Activity-based hour tracking and rate calculations
  - [x] Monthly salary totals with Vietnamese currency formatting

- [x] **Payroll Period Management (Admin only)**
  - [x] Create monthly payroll periods (YYYY-MM format)
  - [x] Period locking/unlocking mechanism to prevent schedule changes
  - [x] Period status tracking with admin audit trail
  - [x] PayrollPeriodManager component with full CRUD operations
  - [x] PayrollPeriodForm component for period creation

- [x] **Enhanced PayrollPage with Comprehensive Salary Display**
  - [x] Role-based access control (Admins see all, Employees see own data)
  - [x] Monthly summary cards (total employees, hours, salary)
  - [x] Employee salary breakdown with activity details
  - [x] PayrollDataDisplay component for organized data presentation
  - [x] Period status banners with Vietnamese localization

- [x] **Daily Breakdown and Transparency Features**
  - [x] PayrollDailyBreakdown component with expandable daily views
  - [x] Date-grouped salary details with day totals
  - [x] Activity-specific hour and rate breakdowns per day
  - [x] Vietnamese date formatting and currency display

- [x] **Utility Functions and Code Organization**
  - [x] Centralized payroll calculations in usePayrollCalculations hook
  - [x] formatMoney utility for consistent Vietnamese number formatting
  - [x] formatMonthName and date utilities for localization
  - [x] Component separation for maintainability

- [x] **Database Integration and Security**
  - [x] Leverages existing RLS policies for data access control
  - [x] Real-time payroll calculations with TanStack Query caching
  - [x] Optimized queries with proper indexing and joins
  - [x] Business rule enforcement (period locking prevents schedule modifications)

- [x] **UI/UX Improvements** ✅ **COMPLETED**
  - [x] Employee list view for admins (replace long scrolling page)
  - [x] Individual employee payroll detail page with dedicated route
  - [x] Click-to-navigate from employee list to detailed view
  - [x] Separate summary overview from individual employee details
  - [x] Improved mobile experience for payroll navigation
  - [x] Role-based auto-redirect for employees to their detail page

### 🚧 Future Enhancements (Phase 2)

- [x] **Lunch Allowance Bonus System** 🍽️
  - [x] Business logic to detect double shifts (morning + afternoon same day)
  - [x] Automatic lunch allowance calculation in payroll calculations
  - [x] Display lunch allowance as separate line item in payroll breakdown
  - [x] Update PayrollDailyBreakdown to show lunch allowance per qualifying day
  - [x] Vietnamese localization for lunch allowance terminology
  - [x] Database schema for lunch allowance rates (configurable amount per day)
  - [ ] Admin settings to configure lunch allowance rates
  - [ ] Integration with existing payroll period locking system
  
Note: Payroll now reads the lunch allowance from the database (`allowance_rates`), effective-dated by day. If no applicable rate exists, a safe fallback is used on the client to avoid disruption.

- [ ] **CSV Export Functionality**
  - [ ] Export monthly payroll data to CSV format
  - [ ] Include employee details, hours, activities, and salary totals
  - [ ] Vietnamese column headers and formatting

- [ ] **Advanced Reporting**
  - [ ] Historical payroll comparisons
  - [ ] Activity-based cost analysis
  - [ ] Payroll trend reports

### 📋 Detailed Implementation Progress

#### **Schedule-based Payroll Calculation System**
- [x] Direct calculation from schedule_shifts table (simplified approach)
- [x] Effective-dated rate application with time range validation
- [x] Activity-based hour tracking and rate calculations
- [x] Monthly salary totals with Vietnamese currency formatting

#### **Payroll Period Management (Admin only)**
- [x] Create monthly payroll periods (YYYY-MM format)
- [x] Period locking/unlocking mechanism to prevent schedule changes
- [x] Period status tracking with admin audit trail
- [x] PayrollPeriodManager component with full CRUD operations
- [x] PayrollPeriodForm component for period creation

#### **Enhanced PayrollPage with Comprehensive Salary Display**
- [x] Role-based access control (Admins see all, Employees see own data)
- [x] Monthly summary cards (total employees, hours, salary)
- [x] Employee salary breakdown with activity details
- [x] PayrollDataDisplay component for organized data presentation
- [x] Period status banners with Vietnamese localization

#### **Daily Breakdown and Transparency Features**
- [x] PayrollDailyBreakdown component with expandable daily views
- [x] Date-grouped salary details with day totals
- [x] Activity-specific hour and rate breakdowns per day
- [x] Vietnamese date formatting and currency display

#### **Utility Functions and Code Organization**
- [x] Centralized payroll calculations in usePayrollCalculations hook
- [x] formatMoney utility for consistent Vietnamese number formatting
- [x] formatMonthName and date utilities for localization
- [x] Component separation for maintainability (period management, data display, daily breakdown)

#### **Database Integration and Security**
- [x] Leverages existing RLS policies for data access control
- [x] Real-time payroll calculations with TanStack Query caching
- [x] Optimized queries with proper indexing and joins
- [x] Business rule enforcement (period locking prevents schedule modifications)

#### **UI/UX Improvements** ✅ **COMPLETED**
- [x] Employee list view for admins (replace long scrolling page)
- [x] Individual employee payroll detail page with dedicated route
- [x] Click-to-navigate from employee list to detailed view
- [x] Separate summary overview from individual employee details
- [x] Improved mobile experience for payroll navigation
- [x] Role-based auto-redirect for employees to their detail page

## Business Rules

### Payroll Calculation Rules
1. **Salary = sum(scheduled hours × applicable rate per activity) + allowances**
2. **Effective-dated rates:** Use rate valid for the work date
3. **Activity-based calculation:** Different rates for different work types
4. **Lunch allowance eligibility:** Employees working ≥2 shifts in a day receive the daily lunch allowance sourced from `allowance_rates` (with safe client fallback)
5. **Monthly organization:** Payroll calculated per calendar month

### Period Management Rules
6. **Payroll locking:** Closed periods prevent schedule changes
7. **Admin audit trail:** Track who closes/reopens periods
8. **Period uniqueness:** One period per month (YYYY-MM format)

### Access Control Rules
9. **Role-based visibility:** Admins see all data, employees see own data only
10. **Database-enforced privacy:** RLS prevents unauthorized access
11. **Auto-redirect:** Employees automatically go to their detail page

## API Reference

### Database Functions
```sql
-- Calculate total salary for employee in month
SELECT calculate_monthly_salary(user_id, 'YYYY-MM');

-- Get payroll period status
SELECT status FROM payroll_periods WHERE year_month = 'YYYY-MM';

-- Close payroll period
UPDATE payroll_periods
SET status = 'closed', closed_by = ?, closed_at = NOW()
WHERE year_month = 'YYYY-MM';
```

### Frontend Hooks
```typescript
// Payroll calculations
const { data: payrollData } = usePayrollCalculations(yearMonth, userId);

// Period management
const { data: periods } = usePayrollPeriods();
const { mutate: createPeriod } = useCreatePayrollPeriod();
const { mutate: lockPeriod } = useLockPayrollPeriod();

// Salary data
const { data: salaryBreakdown } = useSalaryBreakdown(yearMonth, userId);
```

## Testing

### Calculation Testing
- **Rate Application:** Test effective-dated rate calculations
- **Activity Breakdown:** Verify correct activity-based calculations
- **Monthly Totals:** Test month boundary calculations
- **Currency Formatting:** Verify Vietnamese number formatting

### Access Control Testing
- **Role Isolation:** Ensure employees see only own data
- **Admin Access:** Verify full data visibility for admins
- **Auto-redirect:** Test employee automatic navigation
- **Period Restrictions:** Test locked period behavior

### Business Logic Testing
- **Period Locking:** Test schedule modification prevention
- **Audit Trail:** Verify period closure tracking
- **Data Consistency:** Test calculation accuracy across components

## Related Documentation

- **Database Schema:** [docs/DATABASE.md](../DATABASE.md) - Payroll periods and calculation queries
- **Scheduling:** [scheduling.md](scheduling.md) - Source data for payroll calculations
- **Settings:** [settings.md](settings.md) - Activity rates configuration
- **Employee Management:** [employee-management.md](employee-management.md) - User role management

---

**Last Updated:** September 19, 2025
**Status:** Production Ready ✅ with Enhancement Opportunities
