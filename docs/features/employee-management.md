# Employee Management System

> **Feature Status:** ✅ **COMPLETED** - Phase 1 MVP
> **Admin-Only Feature:** ✅ Role-based access control enforced
> **Mobile-First Design:** ✅ Optimized for mobile coffee shop management

## Overview

The Employee Management system provides comprehensive admin controls for managing coffee shop staff with role-based access control, safety features, and mobile-optimized interface. This feature is exclusively available to admin users.

## Core Features

### Employee List & Overview
- **Real-time Employee Data:** Live fetching with TanStack Query
- **Mobile-First Design:** Card-based layout optimized for mobile devices
- **Status Indicators:** Visual badges for active/inactive employees
- **Role Management:** Promote/demote admin roles with business rule validation
- **Current User Identification:** "Bạn" badge for current user recognition

### Role-Based Access Control (RBAC)
- **Admin Roles:** Full CRUD access to users, schedules, activities, rates, and timekeeping
- **Employee Roles:** Read-only access to schedules and own salary data
- **Role Transition:** Secure promotion/demotion with validation (Admin ↔ Supervisor ↔ Employee)
- **Self-Management Prevention:** Admins cannot demote themselves
- **Supervisor Roles:** Read-only access to all management views (employees, schedules, payroll, settings) with UI safeguards that remove mutation controls.

### Safety Features
- **Admin Self-Management Prevention:** Business Rule #7 enforcement
- **Last Admin Protection:** Cannot demote the last remaining admin
- **System Manageability:** Ensures always at least one admin exists
- **Smart UI Controls:** Hide action buttons when operations not permitted

## Technical Implementation

### Database Schema
```sql
-- User roles and status
CREATE TYPE user_role AS ENUM ('admin', 'employee');
CREATE TYPE user_status AS ENUM ('active', 'inactive');

CREATE TABLE public.users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(15) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    role user_role DEFAULT 'employee' NOT NULL,
    status user_status DEFAULT 'active' NOT NULL,
    auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

### Business Rules Enforcement
```sql
-- Prevent admin self-management (Business Rule #7)
CREATE OR REPLACE FUNCTION prevent_role_self_change()
RETURNS TRIGGER AS $$
BEGIN
    -- Users cannot change their own role
    IF OLD.role = 'admin' AND NEW.role != 'admin' AND
       OLD.auth_user_id = auth.uid() THEN
        RAISE EXCEPTION 'Admins cannot demote themselves';
    END IF;

    -- Prevent last admin demotion
    IF OLD.role = 'admin' AND NEW.role != 'admin' THEN
        IF (SELECT COUNT(*) FROM users WHERE role = 'admin' AND id != OLD.id) = 0 THEN
            RAISE EXCEPTION 'Cannot demote the last remaining admin';
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Admin Functions
```sql
-- Create admin user (email-based)
CREATE OR REPLACE FUNCTION create_admin_user(
    admin_email VARCHAR(255),
    admin_password VARCHAR(255),
    admin_name VARCHAR(100)
) RETURNS UUID AS $$
-- Creates new admin user with email authentication
-- Returns user UUID for reference
```

## User Interface

### Employee List Page
- **Mobile-Responsive Cards:** Touch-friendly employee cards
- **Status Badges:** Visual indicators for active/inactive status
- **Role Badges:** Clear admin/employee role identification
- **Action Buttons:** Role management and status toggle controls
- **Current User Indicator:** "Bạn" badge for self-identification

### Modal Interactions
- **Employee Details Modal:** Comprehensive employee information display
- **Confirmation Dialogs:** Safe role changes and status updates
- **Toast Notifications:** Real-time feedback for user actions
- **Loading States:** Visual feedback during API operations

### Smart UI Features
- **Conditional Controls:** Show/hide buttons based on permissions
- **Optimistic Updates:** Immediate UI response with error rollback
- **Real-time Sync:** Background data updates with TanStack Query
- **Error Handling:** Graceful failure handling with user feedback

## Core Functionality

### Role Management
- **Promote to Admin:** Elevate employee to admin role
- **Assign Supervisor Role:** Provide read-only management access across scheduling, payroll, settings, and employee lists
- **Demote to Employee:** Reduce admin or supervisor to employee role
- **Role Validation:** Enforce business rules during transitions (self-demote prevention, last-admin protection)
- **Permission Checks:** Verify user has permission for role changes

### Status Management
- **Activate Employee:** Enable employee account for work
- **Deactivate Employee:** Disable employee account (soft delete)
- **Status Toggle:** Quick status switching with confirmation
- **Optimistic Updates:** Immediate UI feedback

### Safety Controls
- **Self-Management Prevention:** Users cannot modify their own role/status
- **Last Admin Protection:** System prevents removing all admins
- **Permission Validation:** UI enforces role-based access control
- **Audit Trail:** Track changes for administrative oversight

## Development Status

### ✅ Completed Features (Phase 1)

- [x] **Employee List Page (Mobile-first design)**
  - [x] View all employees with real-time data fetching
  - [x] Mobile-friendly card layout with modal details
  - [x] Employee status (active/inactive) with visual badges
  - [x] Promote/demote admin & supervisor roles with business rule validation
  - [x] Deactivate/reactivate employees with safety checks
  - [x] Admin self-management prevention (Business Rule #7)
  - [x] Last admin protection to ensure system manageability
  - [x] Visual indicators for current user ("Bạn" badge)
  - [x] Smart UI: hide action buttons when not permitted
  - [x] Toast notifications for user feedback
  - [x] Optimistic status toggle for improved UX

### 🚧 Future Enhancements (Phase 2)
- [ ] **Employee Profile Editing**
  - [ ] Admin ability to edit employee profiles
  - [ ] Bulk employee operations
  - [ ] Advanced employee search and filtering

- [ ] **Employee Deletion**
  - [ ] Currently removed for security (requires Auth Admin API)
  - [ ] Alternative: Database functions for safe employee removal
  - [ ] Audit trail for deleted employees

### 📋 Detailed Implementation Progress

#### **Employee List Page Features**
- [x] View all employees with real-time data fetching
- [x] Mobile-friendly card layout with modal details
- [x] Employee status (active/inactive) with visual badges
- [x] Promote/demote admin roles with business rule validation
- [x] Deactivate/reactivate employees with safety checks
- [x] Admin self-management prevention (Business Rule #7)
- [x] Last admin protection to ensure system manageability
- [x] Visual indicators for current user ("Bạn" badge)
- [x] Smart UI: hide action buttons when not permitted
- [x] Toast notifications for user feedback
- [x] Optimistic status toggle for improved UX

#### **Technical Implementation Details**
- [x] Mobile-first design with touch-friendly interactions
- [x] Real-time data synchronization with TanStack Query
- [x] Role-based access control with UI enforcement
- [x] Business rule validation at database and UI level
- [x] Error handling with graceful fallbacks
- [x] Vietnamese localization for all user-facing text

## Business Rules

### Role Management Rules
1. **Default Role:** Employees can only register as employees
2. **Admin Promotion:** Only admins can promote users to admin
3. **Self-Management Prevention:** Admins cannot demote themselves
4. **Last Admin Protection:** Cannot demote the last remaining admin
5. **System Access:** Ensure system always has at least one admin

### Employee Access Rules
6. **Admin Full Access:** Admins can view and manage all employee data
7. **Employee Limited Access:** Employees can view colleague info but not roles/status
8. **Data Privacy:** Role and salary data restricted per user permissions
9. **Schedule Coordination:** Employees can view colleague schedules and contact info

## API Reference

### Database Functions
```sql
-- Create new admin user
SELECT create_admin_user('admin@example.com', 'password123', 'Admin Name');

-- Promote existing user to admin
SELECT promote_user_to_admin('user@example.com');

-- Get user role (utility)
SELECT get_user_role(auth.uid());

-- Check if user is admin
SELECT is_admin(auth.uid());
```

### Frontend Hooks
```typescript
// Employee data management
const { data: employees, isLoading } = useUsers();

// Role management mutations
const { mutate: promoteToAdmin } = usePromoteToAdmin();
const { mutate: demoteToEmployee } = useDemoteToEmployee();

// Status management
const { mutate: toggleUserStatus } = useToggleUserStatus();

// Current user context
const { user, isAdmin } = useAuth();
```

## Testing

### Role Management Testing
- **Promotion/Demotion:** Test role transitions and validation
- **Self-Management:** Verify prevention of self-role changes
- **Last Admin:** Test protection against removing all admins
- **Permission Validation:** Ensure UI reflects user permissions

### Status Management Testing
- **Status Toggle:** Test active/inactive transitions
- **Access Control:** Verify inactive users cannot access system
- **UI Updates:** Test optimistic updates and error handling
- **Business Logic:** Validate status change business rules

### User Interface Testing
- **Mobile Responsiveness:** Test on various screen sizes
- **Touch Interactions:** Verify mobile-friendly touch targets
- **Loading States:** Test loading indicators and error states
- **Real-time Updates:** Verify live data synchronization

## Access Control Matrix

| User Role | View All Employees | View Employee Roles | Promote/Demote | Activate/Deactivate | Self-Management |
|-----------|-------------------|-------------------|---------------|-------------------|-----------------|
| **Admin** | ✅ Yes | ✅ Yes | ✅ Yes | ✅ Yes | ❌ No |
| **Employee** | ✅ Yes (basic info) | ❌ No | ❌ No | ❌ No | ❌ No |

## Related Documentation

- **Authentication:** [authentication.md](authentication.md) - User registration and login system
- **Database Schema:** [docs/DATABASE.md](../DATABASE.md) - User table and RLS policies
- **Scheduling:** [scheduling.md](scheduling.md) - Employee schedule coordination
- **Settings:** [settings.md](settings.md) - Admin configuration controls

---

**Last Updated:** September 19, 2025
**Status:** Production Ready ✅
