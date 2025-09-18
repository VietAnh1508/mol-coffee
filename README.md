# MoL Coffee ☕

> **Vietnamese Coffee Shop Employee Scheduling & Payroll Management PWA**

A mobile-first Progressive Web App for managing coffee shop employee schedules, timekeeping, and payroll with Vietnamese localization.

## 🎯 Overview

**MoL Coffee** streamlines coffee shop operations with:
- 📱 **Mobile-optimized PWA** - No app store installation needed
- 📧 **Email-based authentication** - Secure email authentication with profile completion
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
SELECT create_admin_user('YOUR_EMAIL', 'YOUR_PASSWORD', 'Your Name');
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

**Core Features Implemented:**
- Complete employee scheduling and payroll management system
- Email authentication with Vietnamese interface
- Role-based dashboards for admins and employees
- Real-time data management with optimistic updates

**For detailed feature list and development status, see [docs/PROGRESS.md](docs/PROGRESS.md)**

## 🔐 Security Features

- **Email-based Auth** - Secure authentication with progressive profile completion
- **Row Level Security** - Database-enforced access control
- **Role-based Access** - Admins see all data, employees see only their own
- **Environment Security** - Sensitive tokens excluded from git

## 📚 Documentation

- **[docs/requirements.md](docs/requirements.md)** - Business requirements and features specification
- **[docs/PROGRESS.md](docs/PROGRESS.md)** - Current development status and completed features
- **[docs/DATABASE.md](docs/DATABASE.md)** - Database schema, RLS policies, and technical details
- **[docs/CLAUDE.md](docs/CLAUDE.md)** - Development context and architectural patterns

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

**Phase:** Phase 1 MVP Complete
**Progress:** ~95% (Foundation + Complete Feature Set)

See **[docs/PROGRESS.md](docs/PROGRESS.md)** for detailed status, completed features, and development roadmap.

## 🤝 Contributing

This project follows Vietnamese coffee shop operational patterns with mobile-first design and TypeScript strict mode. See **[docs/CLAUDE.md](docs/CLAUDE.md)** for development guidelines and architectural patterns.

---

**Built with ❤️ for Vietnamese coffee shops**
