# Settings Management System

> **Feature Status:** ✅ **COMPLETED** - Phase 1 MVP
> **Admin-Only Feature:** ✅ Exclusive admin access with role validation
> **Real-time Updates:** ✅ TanStack Query with optimistic UI

## Overview

The Settings Management system provides comprehensive admin controls for configuring coffee shop operations, including work activities and hourly rates with effective dating. This feature enables dynamic pricing and operational flexibility.

## Core Features

### Activities Management
- **Work Activity Types:** Define different types of work (Coffee, Bread, Management, etc.)
- **Activity Status Control:** Enable/disable activities with archive functionality
- **Real-time Updates:** Live data synchronization with optimistic UI
- **Vietnamese Localization:** Default activities in Vietnamese

### Rates Management
- **Activity-based Hourly Rates:** Set different rates for different work types
- **Effective Dating:** Historical rate tracking with date-based transitions
- **Rate History:** Complete audit trail of rate changes
- **Vietnamese Currency:** VND formatting and Vietnamese number display

### Data Management
- **Persistent Storage:** Automatic database synchronization
- **Cache Invalidation:** Intelligent data refresh and background sync
- **Error Handling:** Graceful failure handling with user feedback
- **Optimistic Updates:** Immediate UI response with automatic rollback

## Technical Implementation

### Database Schema

#### Activities Table
```sql
CREATE TABLE public.activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);
```

#### Rates Table
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

### Default Vietnamese Activities
Seeded during initial setup:
- **Thử việc** (Trial work) - 20,000 VND/hour
- **Cà phê** (Coffee service) - 22,000 VND/hour
- **Bánh mì** (Bread/food service) - 25,000 VND/hour
- **Quản lý** (Management) - 28,000 VND/hour

### Rate Effective Dating Logic
```sql
-- Get current rate for activity
SELECT hourly_vnd FROM rates
WHERE activity_id = ? AND effective_from <= CURRENT_DATE
  AND (effective_to IS NULL OR effective_to > CURRENT_DATE)
ORDER BY effective_from DESC LIMIT 1;

-- Historical rate lookup for specific date
SELECT hourly_vnd FROM rates
WHERE activity_id = ? AND effective_from <= ?
  AND (effective_to IS NULL OR effective_to > ?)
ORDER BY effective_from DESC LIMIT 1;
```

## User Interface

### Settings Page Layout
- **Tab Navigation:** Organized tabs for Activities and Rates management
- **Mobile-Responsive:** Optimized for mobile coffee shop management
- **Real-time Data:** Live updates with TanStack Query integration
- **Action Buttons:** React Icons integration for intuitive controls
- **Dark Mode Ready:** Token-based colors adapt to the system theme for consistent contrast

### Activities Management UI
- **Activity List:** Display all activities with status indicators
- **Add/Edit Forms:** Create and modify activity details
- **Status Toggle:** Enable/disable activities with visual feedback
- **Archive System:** Soft delete with ability to reactivate

### Rates Management UI
- **Rate History View:** Complete historical rate tracking
- **Date-based Organization:** Chronological rate display
- **Add Rate Form:** Set new rates with effective dating
- **Current Rate Highlighting:** Visual emphasis on active rates

## Core Functionality

### Activities Administration
- **Create Activities:** Add new work activity types
- **Edit Activities:** Modify existing activity details
- **Toggle Status:** Enable/disable activities for scheduling
- **Archive Management:** Soft delete with recovery option
- **Validation:** Unique name constraints and data validation

### Rates Administration
- **Set Hourly Rates:** Define VND rates per activity
- **Effective Dating:** Schedule rate changes for future dates
- **Rate Transitions:** Automatic rate switching based on effective dates
- **Historical Preservation:** Maintain complete rate audit trail
- **Current Rate Management:** Clearly identify active rates

### Data Synchronization
- **Real-time Updates:** Immediate UI reflection of changes
- **Background Sync:** Automatic data refresh and cache updates
- **Optimistic UI:** Instant feedback with error rollback
- **Cache Invalidation:** Smart cache management for data consistency

## Development Status

### ✅ Completed Features (Phase 1)

- [x] **Activities Management (powered by TanStack Query)**
  - [x] Add/edit/archive activities with real-time updates
  - [x] Activity status toggle with optimistic UI
  - [x] Loading states during mutations
  - [x] React Icons integration for action buttons

- [x] **Rates Management (powered by TanStack Query)**
  - [x] Set hourly rates per activity
  - [x] Rate effective dating system
  - [x] Rate history view with automatic refresh
  - [x] React Icons integration for action buttons

- [x] **Data Persistence and User Experience**
  - [x] Data persistence with automatic cache invalidation
  - [x] Error handling and user feedback
  - [x] Real-time data synchronization
  - [x] Mobile-responsive design with tab navigation

### Vietnamese Localization Features
- [x] **Default Vietnamese Activities:** Pre-seeded with coffee shop activities
- [x] **VND Currency Display:** Proper Vietnamese Dong formatting
- [x] **Interface Localization:** Vietnamese labels and error messages
- [x] **Number Formatting:** Vietnamese number format (25.000 ₫)

### 📋 Detailed Implementation Progress

#### **Activities Management Features**
- [x] Add/edit/archive activities with real-time updates
- [x] Activity status toggle with optimistic UI
- [x] Loading states during mutations
- [x] React Icons integration for action buttons
- [x] Activity list display with status indicators
- [x] Form validation and error handling
- [x] Archive system with soft delete and recovery

#### **Rates Management Features**
- [x] Set hourly rates per activity
- [x] Rate effective dating system
- [x] Rate history view with automatic refresh
- [x] React Icons integration for action buttons
- [x] Current rate highlighting and identification
- [x] Date-based rate organization
- [x] Historical rate preservation

#### **Data Management & User Experience**
- [x] Data persistence with automatic cache invalidation
- [x] Error handling and user feedback
- [x] Real-time data synchronization
- [x] Mobile-responsive design with tab navigation
- [x] Optimistic updates with error rollback
- [x] Background sync for data consistency

## Business Rules

### Activity Management Rules
1. **Unique Names:** Activity names must be unique across the system
2. **Archive vs Delete:** Activities are archived (soft delete) to preserve historical data
3. **Status Control:** Inactive activities cannot be assigned to new shifts
4. **Data Integrity:** Activities with existing shifts cannot be permanently deleted

### Rate Management Rules
5. **Effective Dating:** Rates must have valid effective date ranges
6. **Non-overlapping Periods:** No overlapping effective periods for same activity
7. **Current Rate Identification:** Only one active rate per activity at any time
8. **Historical Preservation:** Old rates preserved for payroll calculations
9. **VND Currency:** All rates stored and displayed in Vietnamese Dong

### Access Control Rules
10. **Admin-Only Access:** Settings management restricted to admin users
11. **Role Validation:** Database and UI enforce admin-only access
12. **Real-time Security:** Role checks enforced on all mutations

## API Reference

### Database Queries
```sql
-- Get all active activities
SELECT * FROM activities WHERE is_active = true ORDER BY name;

-- Get current rate for activity
SELECT r.* FROM rates r
WHERE r.activity_id = ? AND r.effective_from <= CURRENT_DATE
  AND (r.effective_to IS NULL OR r.effective_to > CURRENT_DATE)
ORDER BY r.effective_from DESC LIMIT 1;

-- Get rate history for activity
SELECT * FROM rates WHERE activity_id = ? ORDER BY effective_from DESC;
```

### Frontend Hooks
```typescript
// Activities management
const { data: activities, isLoading } = useActivities();
const { mutate: createActivity } = useCreateActivity();
const { mutate: updateActivity } = useUpdateActivity();
const { mutate: toggleActivityStatus } = useToggleActivityStatus();

// Rates management
const { data: rates } = useRates();
const { mutate: createRate } = useCreateRate();
const { mutate: updateRate } = useUpdateRate();

// Settings context
const { isAdmin } = useAuth(); // Access control
```

## Testing

### Activities Testing
- **CRUD Operations:** Test create, read, update, archive operations
- **Status Management:** Test activity enable/disable functionality
- **Validation:** Test unique name constraints and data validation
- **UI Feedback:** Test loading states and error handling

### Rates Testing
- **Effective Dating:** Test rate transitions and date-based logic
- **Historical Data:** Test rate history preservation and display
- **Currency Formatting:** Test Vietnamese Dong display
- **Business Logic:** Test rate calculation and application

### Access Control Testing
- **Admin Restriction:** Verify settings access restricted to admins
- **Role Validation:** Test role-based UI and API access
- **Security:** Test unauthorized access prevention

### Integration Testing
- **Scheduling Integration:** Test activity selection in shift assignment
- **Payroll Integration:** Test rate application in salary calculations
- **Real-time Updates:** Test live data synchronization across components

## Related Documentation

- **Database Schema:** [docs/DATABASE.md](../DATABASE.md) - Activities and rates table schema
- **Employee Management:** [employee-management.md](employee-management.md) - Admin role requirements
- **Scheduling:** [scheduling.md](scheduling.md) - Activity assignment in shifts
- **Payroll:** [payroll.md](payroll.md) - Rate application in salary calculations

---

**Last Updated:** October 14, 2025
**Status:** Production Ready ✅
