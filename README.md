# MoL Coffee ☕

> **Vietnamese Coffee Shop Employee Scheduling & Payroll Management PWA**

A mobile-first Progressive Web App for managing coffee shop employee schedules, timekeeping, and payroll with Vietnamese localization.

## 🎯 Overview

**MoL Coffee** streamlines coffee shop operations with:
- 📱 **Mobile-optimized PWA** - No app store installation needed
- 📞 **Phone-based authentication** - Vietnamese phone numbers as usernames  
- 👥 **Role-based access** - Admin dashboard vs Employee self-service
- 🇻🇳 **Vietnamese interface** - Localized for Vietnamese coffee shops
- ⏰ **Smart scheduling** - Conflict prevention and business rules enforcement

## 🚀 Quick Start

### Prerequisites
- Node.js 20.15+ (or upgrade recommended)
- pnpm (recommended) or npm
- Supabase account

### Installation

```bash
# Clone and install
git clone <repository-url>
cd mol-coffee
pnpm install

# Setup environment
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
pnpm dev
```

### Database Setup

```bash
# Login to Supabase CLI (one time)
npx supabase login

# Link to project (one time) 
npx supabase link --project-ref YOUR_PROJECT_REF

# Apply database migrations
pnpm run db:push
```

### Create Admin User

In Supabase SQL Editor:
```sql
SELECT create_admin_user('YOUR_PHONE', 'YOUR_PASSWORD', 'Your Name');
```

## 🏗️ Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **Data Fetching:** TanStack Query (React Query) for caching & state management
- **Routing:** TanStack Router with file-based routing
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **PWA:** Service Worker + Manifest + Offline-ready
- **Package Manager:** pnpm
- **Deployment:** Vercel (Frontend) + Supabase Cloud

## 📱 Features

### ✅ **Implemented (Foundation)**
- Phone number authentication with Vietnamese UI
- User role management (Admin/Employee)
- Database schema with Vietnamese activities
- Row Level Security (RLS) for data privacy
- PWA configuration for mobile experience
- TanStack Query integration for optimized data fetching
- Settings management with real-time updates (Activities & Rates)

### 🚧 **In Development (Phase 1 MVP)**
- Employee management dashboard
- Schedule calendar interface
- Enhanced role-based dashboards

### 📋 **Planned (Phase 2+)**
- Time entry management
- Payroll calculation and reports  
- CSV export functionality
- Advanced scheduling features

## 🔐 Security Features

- **Phone-based Auth** - Secure authentication using Vietnamese phone numbers
- **Row Level Security** - Database-enforced access control
- **Role-based Access** - Admins see all data, employees see only their own
- **Environment Security** - Sensitive tokens excluded from git

## 📚 Documentation

- **[docs/CLAUDE.md](docs/CLAUDE.md)** - Full context for AI development assistance
- **[docs/PROGRESS.md](docs/PROGRESS.md)** - Development status and roadmap
- **[docs/requirements.md](docs/requirements.md)** - Original specification document
- **[supabase/README.md](supabase/README.md)** - Database schema guide

## 🛠️ Development Commands

```bash
# Development
pnpm dev                     # Start dev server
pnpm build                   # Build for production
pnpm preview                 # Preview production build
pnpm lint                    # Run ESLint

# Database Operations
pnpm run db:push             # Apply migrations to remote
pnpm run db:pull             # Pull remote schema changes
pnpm run db:diff             # Show local vs remote differences
pnpm run db:migration <name> # Create new migration file
```

## 🌐 Environment Variables

```env
# Required - Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Not needed in .env (use CLI login instead)
# SUPABASE_ACCESS_TOKEN - Use 'npx supabase login'
```

## 🎯 Project Status

**Phase:** Foundation Complete → Phase 1 MVP Development  
**Progress:** ~40% (Foundation + Data Layer + Settings Complete)

**Next Priorities:**
1. Employee Management Interface
2. Scheduling Calendar System
3. Enhanced Dashboards

**Recent Completions:**
- ✅ TanStack Query integration with optimized caching
- ✅ Settings pages for Activities & Rates management
- ✅ Real-time data mutations and updates

## 🤝 Contributing

This project follows Vietnamese coffee shop operational patterns and uses:
- **Vietnamese labels** in UI
- **Mobile-first design** principles
- **TypeScript strict mode** for reliability
- **Database-enforced business rules**

## 📄 License

[Add your license here]

---

**Built with ❤️ for Vietnamese coffee shops**
