# MoL Coffee - Claude Context File

> **Purpose:** This file provides comprehensive context for Claude to understand the project structure, decisions made, and current state. Always read this file when working on this project.

## 🎯 PROJECT OVERVIEW

**MoL Coffee** is a Vietnamese coffee shop employee scheduling and payroll management Progressive Web App (PWA).

### Key Characteristics:
- **Mobile-first PWA** - No native app installation required
- **Phone-based authentication** - Uses Vietnamese phone numbers as usernames
- **Role-based access control** - Admins vs Employees with strict data isolation
- **Vietnamese interface** - Labels and activities in Vietnamese
- **Single-branch MVP** - No multi-location support initially

## 🏗️ ARCHITECTURE DECISIONS

### **Tech Stack Rationale:**
- **React 19 + TypeScript + Vite** - Modern, fast development with type safety
- **TanStack Query (React Query)** - Powerful data fetching with caching, mutations, and background sync
- **TanStack Router** - Type-safe, file-based routing system
- **Tailwind CSS v4** - Latest version with Vite plugin (not PostCSS)
- **React Icons** - Heroicons v2 for consistent UI iconography
- **Supabase** - PostgreSQL + Auth + RLS for backend-as-a-service
- **pnpm** - Faster package management than npm
- **PWA** - Mobile-optimized without app store requirements

### **Authentication Strategy:**
- **Phone → Email Conversion** - `phone@mol-coffee` pattern for Supabase compatibility
- **Auto Email Confirmation** - Since emails are synthetic, auto-confirm via trigger
- **Database Triggers** - Automatic user profile creation on signup
- **Admin Functions** - SQL functions for admin user creation/promotion

### **Database Design:**
- **6 Core Tables** - users, activities, rates, schedule_shifts, time_entries, payroll_periods
- **Row Level Security (RLS)** - Database-enforced access control
- **Business Rules Enforcement** - Triggers prevent overlaps, enforce 2-shift max
- **Vietnamese Data** - Default activities: Thử việc, Cà phê, Bánh mì, Quản lý

### **Data Access Architecture:**
- **Supabase Client Integration** - Direct client-side queries with built-in caching
- **TanStack Query Layer** - Powerful data fetching with background sync and mutations
- **RLS Policy Enforcement** - Database-level security prevents unauthorized access
- **Role-Based Data Filtering** - Policies automatically filter data based on user role
- **Optimistic Updates** - Immediate UI feedback with automatic error rollback
- **Real-time Subscriptions** - Live data updates across sessions (future enhancement)

### **RLS Implementation Strategy:**
```sql
-- Employee policies: can only access own data
-- Admin policies: unrestricted access to all data
-- Public read access: activities and rates (for employee visibility)
-- Automatic policy application: no client-side role checking required
```

### **Supabase Usage Patterns:**
- **Authentication** - Phone → synthetic email conversion with auto-confirmation
- **Database Queries** - Direct client queries via `supabase.from()` API
- **Mutations** - TanStack Query mutations with error handling and cache updates
- **File Uploads** - Storage bucket integration (future: employee photos, documents)
- **Edge Functions** - Server-side logic for complex operations (future: payroll calculations)

## 📁 PROJECT STRUCTURE

```
mol-coffee/
├── docs/                   # Project documentation & context files
├── src/
│   ├── components/         # Reusable UI components
│   ├── pages/              # Page components (LoginPage, DashboardPage, SettingsPage)
│   ├── context/            # React contexts for state management
│   ├── hooks/              # Custom React hooks (TanStack Query, auth, mutations)
│   ├── routes/             # TanStack Router route definitions
│   ├── lib/                # Utilities & configurations (Supabase client)
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Helper functions
├── supabase/
│   ├── migrations/         # Database schema migrations & seeds
│   └── README.md           # Database documentation
└── scripts/                # Build & deployment scripts
```

## 🔐 SECURITY IMPLEMENTATION

### **Environment Variables:**
- ✅ `.env` contains ONLY client-safe variables
- ✅ `SUPABASE_ACCESS_TOKEN` removed (use CLI login instead)
- ✅ `.env` excluded from Git via `.gitignore`

### **Database Security:**
- ✅ **RLS Policies** - Employees see own data, Admins see all
- ✅ **Role Validation** - Triggers prevent unauthorized role changes
- ✅ **Input Validation** - Database constraints and checks
- ✅ **Synthetic Email Safety** - Auto-confirmation for @mol-coffee emails

## 📊 CURRENT STATUS

### **Completed (Foundation + Data Layer Phase):**
- ✅ Full tech stack setup with TanStack Query integration
- ✅ Database schema with Vietnamese localization
- ✅ Authentication system with success flows
- ✅ RLS security policies
- ✅ Git-tracked database migrations
- ✅ PWA configuration
- ✅ Clean TypeScript architecture
- ✅ Modern data fetching with caching and mutations
- ✅ Settings management (Activities & Rates) with real-time updates
- ✅ Comprehensive hook system for data management

### **Progress:** ~45% complete (Foundation + Data Layer + Settings Complete)

## 🎯 NEXT DEVELOPMENT PRIORITIES

1. **Employee Management Page** - Admin dashboard for user management
2. ~~**Settings Pages** - Activities and rates management~~ ✅ **COMPLETED**
3. **Scheduling Interface** - Calendar view for shift management
4. **Enhanced Dashboard** - Role-specific content display

## 🛠️ DEVELOPMENT COMMANDS

### **Common Operations:**
```bash
# Development
pnpm dev                    # Start dev server
pnpm build                  # Build for production
pnpm lint                   # Run ESLint

# Database (requires supabase CLI login)
pnpm run db:push            # Apply migrations
pnpm run db:pull            # Pull remote changes
pnpm run db:diff            # Show differences
pnpm run db:migration <name> # Create new migration
```

### **Database Admin:**
```sql
-- Create admin user
SELECT create_admin_user('PHONE', 'PASSWORD', 'NAME');

-- Promote existing user
SELECT promote_user_to_admin('PHONE');
```

## 🚨 IMPORTANT NOTES FOR CLAUDE

### **When Working on This Project:**

1. **Always maintain Vietnamese context** - UI labels, error messages, data
2. **Respect RLS policies** - Test data access from both admin and employee perspectives  
3. **Follow phone-based auth pattern** - Never break the `@mol-coffee` email conversion
4. **Use TypeScript strictly** - All new code must be properly typed
5. **Mobile-first design** - Tailwind classes should prioritize mobile experience
6. **Update PROGRESS.md** - Mark completed features and update status

### **Code Patterns to Follow:**
- **Components:** Use function components with TypeScript
- **Data Fetching:** Use TanStack Query hooks, avoid manual fetch in useEffect
- **State:** Prefer TanStack Query for server state, React context for app state
- **Mutations:** Use mutation hooks with optimistic updates and error handling
- **Styling:** Use Tailwind CSS classes, avoid custom CSS
- **Database:** Always use RLS-aware queries through Supabase client
- **Auth:** Use the AuthContext, never bypass the auth system

### **Testing Strategy:**
- **Auth Flow:** Test signup → success message → login flow
- **Role Access:** Verify admin vs employee data visibility
- **Mobile UX:** Test all interfaces on mobile viewport
- **Vietnamese Support:** Ensure proper character encoding and display

## 📚 REFERENCE DOCUMENTS

- **`requirements.md`** - Original detailed specification
- **`PROGRESS.md`** - Current development status and roadmap  
- **`supabase/README.md`** - Database schema and migration guide
- **`README.md`** - Project setup and getting started guide

---

**Last Updated:** August 31, 2025  
**Phase:** Foundation + Data Layer Complete, Phase 1 MVP Development In Progress
