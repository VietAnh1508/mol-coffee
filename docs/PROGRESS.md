# MoL Coffee - Development Progress

## 📋 PROJECT STATUS

**Current Phase:** Phase 1 (MVP Foundation)  
**Last Updated:** September 9, 2025

---

## ✅ COMPLETED FEATURES

### 🏗️ **Technical Foundation**
- [x] React + TypeScript + Vite setup
- [x] Tailwind CSS v4 with Vite plugin
- [x] TanStack Router with file-based routing
- [x] TanStack Query for optimized data fetching & caching
- [x] PWA configuration (manifest, service worker)
- [x] Supabase client integration
- [x] Environment configuration (.env setup)
- [x] TypeScript types for all entities
- [x] Project structure (components, pages, hooks, context, types)

### 🔐 **Authentication System**
- [x] ~~Phone number → synthetic email conversion (@mol-coffee pattern)~~ **MIGRATED TO EMAIL**
- [x] Direct email authentication with Supabase
- [x] User registration with email + password + name
- [x] Login with email + password
- [x] Phone number stored as optional user information
- [x] Auto email confirmation for all users
- [x] User profile auto-creation via database trigger
- [x] Success message + redirect flow after signup
- [x] Admin user creation functions (email-based)

### 🗄️ **Database & Security**
- [x] Complete database schema (6 tables)
  - [x] users (email, phone, name, role, status, auth_user_id)
  - [x] activities (name, is_active)
  - [x] rates (activity_id, hourly_vnd, effective_from/to)
  - [x] schedule_shifts (user_id, activity_id, start_ts, end_ts, template_name)
  - [x] time_entries (user_id, activity_id, start_ts, end_ts, source, approved_by)
  - [x] payroll_periods (year_month, status, closed_by)
- [x] Row Level Security (RLS) policies
  - [x] Employees: own data only
  - [x] Admins: full access
- [x] Business rules enforcement
  - [x] Max 2 shifts per day per employee
  - [x] No overlapping shifts  
  - [x] Shift time validation
  - [x] Admin self-management prevention (Business Rule #7)
    - [x] Frontend validation with hidden UI controls
    - [x] Visual feedback for current user identification
    - [x] Last admin protection to prevent system lockout
- [x] Git-tracked migrations with Supabase CLI
- [x] Vietnamese default activities (Thử việc, Cà phê, Bánh mì, Quản lý)
- [x] Default hourly rates (20k-28k VND)

### 🎨 **UI Components & Data Layer**  
- [x] Login/Signup page with Vietnamese labels
- [x] Success/error message handling
- [x] Mobile-responsive design
- [x] Responsive layout component with navigation
  - [x] MoL House logo integration
  - [x] User dropdown menu with profile info
  - [x] Clean navigation header design
- [x] Loading states and error handling
- [x] Success/error message display
- [x] Auth context provider (optimized with useMemo)
- [x] Dashboard with role-based navigation
- [x] Settings page with tab navigation
- [x] TanStack Query hooks for data fetching (useActivities, useRates, useUsers, etc.)
- [x] Mutation hooks for CRUD operations with optimistic updates
- [x] Automatic cache invalidation and background data synchronization
- [x] React Icons integration throughout UI
- [x] Toast notification system with useToast hook
  - [x] Reusable Toast component with success/error/info states
  - [x] Custom useToast hook for clean state management
  - [x] Auto-dismiss functionality with manual close option
  - [x] Non-intrusive positioning and smooth animations

---

## 🚧 PENDING FEATURES (Phase 1 MVP)

### 👥 **Employee Management (Admin Only)** ✅ **COMPLETED**
- [x] Employee list page (mobile-first design)
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
- [ ] Employee profile editing
- [ ] Employee deletion (temporarily removed - requires Auth Admin API or database functions)

### ⚙️ **Settings (Admin Only)** ✅ **COMPLETED**
- [x] Activities management (powered by TanStack Query)
  - [x] Add/edit/archive activities with real-time updates
  - [x] Activity status toggle with optimistic UI
  - [x] Loading states during mutations
  - [x] React Icons integration for action buttons
- [x] Rates management (powered by TanStack Query)
  - [x] Set hourly rates per activity
  - [x] Rate effective dating
  - [x] Rate history view with automatic refresh
  - [x] React Icons integration for action buttons
- [x] Data persistence with automatic cache invalidation
- [x] Error handling and user feedback

### 📅 **Scheduling System** ✅ **COMPLETED**
- [x] Schedule calendar view
  - [x] Day view layout with Vietnamese interface
  - [x] Admin: multi-column view (all employees)
  - [x] Employee: single column view (own shifts only)
  - [x] Role-based access control and UI differences
  - [x] Date navigation with Vietnamese date formatting
- [x] Shift display and management
  - [x] Morning shift template (06:00-12:00) with orange indicators
  - [x] Afternoon shift template (12:00-18:00) with blue indicators
  - [x] Custom shift template with gray indicators
  - [x] White shift cards with colored activity badges
  - [x] Real-time data fetching with TanStack Query
  - [x] Loading states and error handling
- [x] Shift assignment
  - [x] Employee assignment modal with user selection
  - [x] Activity assignment per shift
  - [x] Auto-selection when only one employee available
  - [x] Form validation and error handling
- [x] Shift deletion
  - [x] Delete functionality with confirmation dialog
  - [x] Role-based delete permissions (admin only)
  - [x] Toast notifications for user feedback

### 🔒 **User Profile & Settings**
- [ ] Change password functionality
- [ ] Profile editing (name, phone)
- [ ] User preferences

---

## 🎯 PENDING FEATURES (Phase 2)

### ⏱️ **Timekeeping**
- [ ] Time entries management (Admin only)
  - [ ] Create/edit/delete time entries
  - [ ] Copy schedule → time entries
  - [ ] Time entry approval workflow
- [ ] Time tracking views
  - [ ] Daily/weekly time summaries
  - [ ] Attendance tracking

### 💰 **Payroll & Salary**
- [ ] Monthly salary calculation
  - [ ] Hours by activity
  - [ ] Rate application (effective dating)
  - [ ] Subtotals and totals
- [ ] Payroll periods
  - [ ] Period management (open/close)
  - [ ] Period locking mechanism
  - [ ] Reopen closed periods (admin only)
- [ ] Salary reports
  - [ ] Employee salary view (own data)
  - [ ] Admin salary overview (all employees)
  - [ ] Daily breakdown transparency
  - [ ] CSV export functionality

---

## 🔮 PENDING FEATURES (Phase 3)

### 🎨 **PWA Polish**
- [ ] Offline functionality
- [ ] App icons and splash screens
- [ ] Install prompts
- [ ] Push notifications
- [ ] Offline data sync

### 📊 **Advanced Features**
- [ ] Rate effective dating UI
- [ ] Advanced reporting
- [ ] Data analytics dashboard
- [ ] Bulk operations

---

## 🚀 FUTURE FEATURES

### 🏢 **Multi-Branch Support**
- [ ] Branch management
- [ ] Cross-branch scheduling
- [ ] Branch-specific rates

### 📱 **Employee Self-Service**
- [ ] Self clock-in/out
- [ ] Shift swap requests
- [ ] Schedule notifications
- [ ] Time-off requests

### 🔔 **Notifications**
- [ ] Schedule reminders
- [ ] Shift changes
- [ ] Payroll notifications

---

## 🐛 KNOWN ISSUES

- [x] ~~AuthContext value object recreated on every render (performance warning)~~ - Fixed with useMemo
- [x] ~~Need to optimize re-renders with useMemo~~ - Completed

---

## 📝 DEVELOPMENT NOTES

### **Database Admin Setup**
```sql
-- Create admin user
SELECT create_admin_user('PHONE_NUMBER', 'PASSWORD', 'NAME');

-- Promote existing user to admin
SELECT promote_user_to_admin('PHONE_NUMBER');
```

### **Migration Commands**
```bash
# First time setup - login to Supabase CLI
npx supabase login

# Link to project (one time)
npx supabase link --project-ref kngqtplideqcsaculhek

# Database operations
pnpm run db:push    # Apply migrations
pnpm run db:pull    # Pull remote changes
pnpm run db:diff    # Show differences
pnpm run db:migration <name>  # Create new migration
```

### **Security Notes**
- ✅ **SUPABASE_ACCESS_TOKEN** removed from .env (use CLI login instead)
- ✅ **.env excluded from git** (contains client-safe variables only)
- ⚠️ **Never commit access tokens** - use `npx supabase login` for CLI auth

### **Current Tech Stack**
- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **Data Fetching:** TanStack Query (React Query) with optimized caching
- **Routing:** TanStack Router (file-based, type-safe)
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Package Manager:** pnpm
- **Authentication:** Phone → synthetic email pattern
- **Deployment:** Ready for Vercel + Supabase Cloud

---

## 🎯 NEXT PRIORITIES

1. ~~**Employee Management Page** - Admin can view/manage all employees~~ ✅ **COMPLETED**
2. ~~**Settings Page** - Admin can manage activities and rates~~ ✅ **COMPLETED**
3. ~~**Scheduling System** - Complete shift management with assignment and deletion~~ ✅ **COMPLETED**
4. **User Profile & Settings** - Change password, profile editing
5. **Advanced Features** - Shift editing, conflict detection, bulk operations

---

**Progress:** ~80% complete (Foundation + Auth + Data Layer + Settings + Employee Management + Complete Scheduling System + UX Enhancements ✅)

### **Recent Achievements:**
- ✅ **Complete Scheduling System** - Full shift management with assignment, deletion, and role-based access
- ✅ **Employee Assignment Modal** - Intuitive shift assignment with employee and activity selection
- ✅ **Shift Deletion with Confirmation** - Secure deletion workflow with confirmation dialogs
- ✅ **Visual Design Improvements** - White cards with colored activity badges for better readability
- ✅ **Auto-Selection Features** - Smart defaults when only one employee is available
- ✅ **Shift Constants System** - Centralized time templates for consistency across the app
- ✅ **Component Architecture** - Reusable ShiftCard and ConfirmationDialog components
- ✅ **Settings Management Complete** - Full CRUD for Activities and Rates with real-time UI
- ✅ **Employee Management Complete** - Mobile-first design with comprehensive admin controls
- ✅ **Admin Safety Features** - Self-management prevention and last admin protection (Business Rule #7)
- ✅ **Toast Notification System** - Reusable useToast hook with success/error/info feedback
- ✅ **Mobile-First UX** - Card-based layout with modal details for optimal mobile experience
- ✅ **Email Authentication Migration** - Converted from phone-based synthetic emails to direct email auth

---

## 📧 EMAIL AUTHENTICATION MIGRATION (September 9, 2025)

### **Migration Overview**
Successfully migrated from phone-based synthetic email system (`phone@mol-coffee`) to direct email authentication for improved UX and native Supabase integration.

### **Key Changes Made**
**Database Schema:**
- ✅ Added `email` column to users table (required, unique)
- ✅ Kept `phone` column as optional user information
- ✅ Updated database functions (`create_admin_user`, `promote_user_to_admin`)
- ✅ Removed @mol-coffee email pattern restrictions
- ✅ Updated indexes and constraints

**Frontend Code:**
- ✅ Updated `AuthContext` to use direct email authentication
- ✅ Modified `LoginPage` UI (phone input → email input)
- ✅ Updated `User` TypeScript interface (`phone?: string`, `email: string`)
- ✅ Updated all query hooks to select email instead of/alongside phone
- ✅ Modified employee management components to display email

**Benefits Achieved:**
- ✅ **Simplified Authentication** - No more synthetic email conversion
- ✅ **Standard UX** - Users expect email login patterns
- ✅ **Native Supabase** - Direct email auth support
- ✅ **Flexible Data Model** - Phone as optional contact info
- ✅ **Future-Ready** - Enables email verification, password recovery

### **Migration Files**
- `supabase/migrations/20250909034138_change_phone_to_email_auth.sql`
- `scripts/insert-test-users.sql` (updated with real emails)

---
