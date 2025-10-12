# Scheduling System

> **Feature Status:** ✅ **COMPLETED** - Phase 1 MVP
> **Vietnamese Interface:** ✅ Fully localized
> **Role-Based Access:** ✅ Employees view all, Admins modify

## Overview

The scheduling system provides comprehensive shift management for coffee shop employees with role-based access control, conflict prevention, and Vietnamese localization. Employees can view all colleagues' schedules for coordination while only admins can modify shifts.

## Key Features

### Schedule Visibility & Access Control
- **Employee Access:** Can view all employees' schedules (read-only) for coordination and receive their next scheduled shift on the dashboard ✅ **NEW**
- **Admin Access:** Full CRUD operations on all shifts
- **Role-based UI:** Different interfaces based on user permissions
- **Real-time Updates:** Live data synchronization with TanStack Query

### Shift Templates
- **Morning Shift:** 06:00–12:00 (orange indicators)
- **Afternoon Shift:** 12:00–18:00 (blue indicators)
- **Template System:** Simplified to morning/afternoon only (custom removed in migration 20250911000001)

### Business Rules (Database Enforced)
1. **Maximum 2 shifts per day per employee**
2. **No overlapping shifts per employee**
3. **Activities cannot change mid-shift**
4. **Smart assignment:** Prevents double-booking employees to same shift template on same date

### ✅ Payroll Period Lock Integration - COMPLETED
- [x] Fetch the payroll period for the `selectedDate` in `SchedulePage` using the shared payroll utilities/hooks (mirror the month-derivation used in payroll pages).
  - Treats "no matching payroll period" as **editable** to keep day-to-day scheduling unblocked.
  - Guards against timezone drift using Vietnam-local helpers (`deriveYearMonthVN` with UTC+7 offset).
- [x] When the resolved period has `status = 'closed'`, make the scheduling UI read-only for admins:
  - Disables "+ Thêm người", edit, and delete controls; prevents modals from opening when lock is detected.
  - Displays Vietnamese warning banner: "Bảng lương tháng {month}/{year} đã khóa, vui lòng mở lại trước khi chỉnh sửa ca".
- [x] Mutation-level safeguards: short-circuits create/update/delete mutations when a lock is active to prevent stale modal writes.
- [x] Database trigger enforcement: Supabase triggers reject schedule writes that fall inside a closed payroll period (migration `20251002140953_payroll_period_lock_enforcement.sql`).
- [x] Documentation updated to reflect completed implementation.

## Technical Implementation

### Database Schema
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

### Shift Templates Enum
```sql
-- Simplified to two templates (custom removed)
CREATE TYPE shift_template AS ENUM ('morning', 'afternoon');
```

### Business Rules Enforcement
```sql
-- Prevent overlapping shifts and enforce 2-shift maximum
CREATE OR REPLACE FUNCTION check_shift_overlap()
RETURNS TRIGGER AS $$
-- Database-level validation for shift conflicts
-- Enforces maximum 2 shifts per day per employee
-- Prevents overlapping time periods
```

## User Interface

### Schedule Calendar View
- **Day View Layout:** Vietnamese interface with date navigation
- **Deep Link Support:** Accepts `?date=YYYY-MM-DD` links (e.g., from payroll daily breakdown) and jumps directly to that day ✅ **NEW**
- **Multi-column Display:** One column per employee for admin view
- **Role-based Access:** Different UI capabilities for admin vs employee
- **Vietnamese Date Formatting:** Proper localization for Vietnamese users

### Shift Visual Design
- **Morning Shifts:** Orange activity badges with 06:00-12:00 timeframe
- **Afternoon Shifts:** Blue activity badges with 12:00-18:00 timeframe
- **White Cards:** Clean shift cards with colored activity indicators
- **Employee Names:** Clear identification of assigned employees

### Employee Experience Enhancements ✅ **NEW**
- **Dashboard Reminder:** Employees see "Ca làm tiếp theo" on the dashboard, showing morning/afternoon label and localized date for their upcoming shift (hidden when no future shift exists)

### Admin Features
- **Shift Assignment Modal:** Admin and employee selection with activity assignment
- **Shift Editing:** Time and activity adjustments with notes
- **Conflict Prevention:** Real-time validation and user feedback
- **Smart Filtering:** Excludes already assigned users from selection

## Core Functionality

### Shift Assignment
- **Assignable User Selection:** Dropdown includes both admins and employees who are eligible
- **Admin Self-Assignment:** Admins can take open shifts directly when coverage is needed
- **Activity Assignment:** Choose work activity per shift
- **Auto-selection:** When only one employee available
- **Form Validation:** Comprehensive error handling and feedback
- **Smart User Filtering:** Excludes users already assigned to same shift template

### Shift Editing
- **Time Adjustments:** Handle late arrivals and early departures
- **Activity Changes:** Switch activities within existing shifts
- **Admin Notes:** Add comments for adjustments and context
- **Template Preservation:** No conversion to custom shifts
- **Validation:** Ensure end time > start time

### Conflict Handling
- **Overlap Prevention:** Database-level validation
- **Maximum Shift Enforcement:** 2 shifts per day per employee
- **Template Conflicts:** Prevent double-booking same shift template
- **Real-time Feedback:** Immediate user notification of conflicts

## Development Status

### ✅ Completed Features (Phase 1)

- [x] **Schedule Calendar View**
  - [x] Day view layout with Vietnamese interface
  - [x] Deep link handling to open specific dates from other features ✅ **NEW**
  - [x] Admin: multi-column view (all employees) with modification rights
  - [x] Employee: can view all employees' schedules (read-only access)
  - [x] Role-based access control and UI differences
  - [x] Date navigation with Vietnamese date formatting

- [x] **Shift Display and Management**
  - [x] Morning shift template (06:00-12:00) with orange indicators
  - [x] Afternoon shift template (12:00-18:00) with blue indicators
  - [x] ~~Custom shift template with gray indicators~~ **REMOVED** - Simplified to morning/afternoon only
  - [x] White shift cards with colored activity badges
  - [x] Real-time data fetching with TanStack Query
  - [x] Loading states and error handling

- [x] **Shift Assignment**
  - [x] Admin/employee assignment modal with user selection
  - [x] Activity assignment per shift
  - [x] Auto-selection when only one employee available
  - [x] Form validation and error handling
  - [x] Smart user filtering - excludes already assigned users

- [x] **Shift Editing**
  - [x] ShiftEditModal for time and activity adjustments
  - [x] Handle real-world scenarios (late arrival, early departure)
  - [x] Activity switching within shifts
  - [x] Time validation (end > start)
  - [x] Notes field for admin comments
  - [x] Preserve original shift templates (no custom conversion)

- [x] **Shift Deletion**
  - [x] Delete functionality with confirmation dialog
  - [x] Role-based delete permissions (admin only)
  - [x] Toast notifications for user feedback

### Key Migrations
- **Migration 20250911000001:** Removed 'custom' shift template, simplified to morning/afternoon
- **Migration 20250911164958:** Enabled employees to view all schedules for coordination
- **Migration 20250911175745:** Allowed employees to view colleague contact information

### 📋 Detailed Implementation Progress

#### **Schedule Calendar View Features**
- [x] Day view layout with Vietnamese interface
- [x] Deep link handling to open specific dates from other features ✅ **NEW**
- [x] Admin: multi-column view (all employees) with modification rights
- [x] Employee: can view all employees' schedules (read-only access)
- [x] Role-based access control and UI differences
- [x] Date navigation with Vietnamese date formatting

#### **Shift Display and Management**
- [x] Morning shift template (06:00-12:00) with orange indicators
- [x] Afternoon shift template (12:00-18:00) with blue indicators
- [x] ~~Custom shift template with gray indicators~~ **REMOVED** - Simplified to morning/afternoon only
- [x] White shift cards with colored activity badges
- [x] Real-time data fetching with TanStack Query
- [x] Loading states and error handling

#### **Shift Assignment System**
- [x] Admin/employee assignment modal with user selection
- [x] Activity assignment per shift
- [x] Auto-selection when only one employee available
- [x] Form validation and error handling
- [x] Smart user filtering - excludes already assigned users

#### **Shift Editing Capabilities**
- [x] ShiftEditModal for time and activity adjustments
- [x] Handle real-world scenarios (late arrival, early departure)
- [x] Activity switching within shifts
- [x] Time validation (end > start)
- [x] Notes field for admin comments
- [x] Preserve original shift templates (no custom conversion)

#### **Shift Deletion Management**
- [x] Delete functionality with confirmation dialog
- [x] Role-based delete permissions (admin only)
- [x] Toast notifications for user feedback

## API Reference

### Database Queries
```sql
-- Get employee schedule for a specific date
SELECT ss.*, u.name, a.name as activity_name
FROM schedule_shifts ss
JOIN users u ON ss.user_id = u.id
JOIN activities a ON ss.activity_id = a.id
WHERE DATE(ss.start_ts) = '2025-09-17';

-- Check for shift conflicts
SELECT COUNT(*) FROM schedule_shifts
WHERE user_id = ?
  AND DATE(start_ts) = ?
  AND template_name = ?;
```

### Frontend Hooks
```typescript
// Schedule data fetching
const { data: shifts, isLoading } = useScheduleShifts(selectedDate);

// Shift mutations
const { mutate: createShift } = useCreateShift();
const { mutate: updateShift } = useUpdateShift();
const { mutate: deleteShift } = useDeleteShift();

// Employee data
const { data: employees } = useUsers();
const { data: activities } = useActivities();
```

## Business Rules

### Shift Constraints
1. **Maximum 2 shifts per day per employee**
2. **No overlapping shifts per employee per day**
3. **Activities fixed per shift (cannot change mid-shift via splitting)**
4. **Admin can manually adjust times for real-world scenarios**

### Access Control Rules
5. **Employees can view all schedules but cannot modify any shifts**
6. **Only admins can create, edit, or delete shifts**
7. **Smart shift assignment prevents double-booking employees**

## User Experience

### Admin Workflow
1. **View Schedule:** See all employees' shifts in multi-column day view
2. **Assign Shifts:** Click on time slot → select employee and activity
3. **Edit Shifts:** Click on existing shift → adjust time or activity
4. **Handle Real-world Changes:** Use edit modal for late arrivals/early departures
5. **Delete Shifts:** Remove shifts with confirmation dialog

### Employee Workflow
1. **View All Schedules:** See when colleagues are working for coordination
2. **Check Own Schedule:** Review personal shifts and activities
3. **Coordinate with Team:** Access to colleague contact information
4. **Read-only Access:** Cannot modify any shift data

## Testing

### Conflict Testing
- **Overlap Prevention:** Test overlapping time periods
- **Maximum Shift Enforcement:** Test 3+ shifts per day
- **Template Conflicts:** Test double-booking same shift template
- **Cross-day Validation:** Test shifts spanning midnight

### Role Access Testing
- **Admin Capabilities:** Verify full CRUD operations
- **Employee Restrictions:** Ensure read-only access enforced
- **UI Differences:** Test role-based interface changes
- **Data Visibility:** Confirm appropriate data access

### Business Logic Testing
- **Smart Filtering:** Test employee exclusion from assignment
- **Activity Assignment:** Test activity selection and validation
- **Time Validation:** Test start/end time constraints
- **Note Handling:** Test admin comment functionality

## Related Documentation

- **Database Schema:** [docs/DATABASE.md](../DATABASE.md) - Schedule shifts table and constraints
- **Employee Management:** [employee-management.md](employee-management.md) - User role management
- **Settings:** [settings.md](settings.md) - Activities configuration
- **Development Context:** [docs/CLAUDE.md](../CLAUDE.md) - Architecture patterns

---

**Last Updated:** October 2, 2025
**Status:** Production Ready ✅ with Payroll Period Lock Integration
