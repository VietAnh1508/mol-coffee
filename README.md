# MoL Coffee ☕

> **Vietnamese Coffee Shop Employee Scheduling & Payroll Management PWA**

A mobile-first Progressive Web App for managing coffee shop employee schedules, timekeeping, and payroll with Vietnamese localization.

## Tech Stack

- **Frontend:** React 19 + TypeScript + Vite + Tailwind CSS v4
- **Data Fetching:** TanStack Query for caching & state management
- **Routing:** TanStack Router with file-based routing
- **Backend:** Supabase (PostgreSQL + Auth + RLS)
- **Package Manager:** pnpm
- **Deployment:** Vercel (Frontend) + Supabase Cloud

## Quick Start

### Prerequisites
- Node.js 20.15+
- pnpm
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

## Development Commands

```bash
pnpm dev                     # Start dev server
pnpm build                   # Type-check + build for production
pnpm preview                 # Preview production build
pnpm lint                    # Run ESLint
pnpm test                    # Run Vitest suite

# Database
pnpm run db:push             # Apply migrations to remote
pnpm run db:pull             # Pull remote schema changes
pnpm run db:diff             # Show local vs remote differences
pnpm run db:migration <name> # Create new migration file
```

## Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Not needed in .env — use 'npx supabase login' for CLI auth
# SUPABASE_ACCESS_TOKEN
```

## Documentation

- **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** - Architecture rationale & design decisions
- **[docs/PROGRESS.md](docs/PROGRESS.md)** - Development status and roadmap
- **[docs/DATABASE.md](docs/DATABASE.md)** - Database schema, RLS policies, and business rules
- **[docs/features/](docs/features/)** - Feature-level specs (auth, scheduling, payroll, employee mgmt, settings, recipes)

---

**Built with ❤️ for Vietnamese coffee shops**
