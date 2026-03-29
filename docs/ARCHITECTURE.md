# MoL Coffee – Architecture & Design Decisions

> Rationale behind key technical choices. For project handbook, see `AGENTS.md`.

## Tech Stack Rationale

- **React 19 + TypeScript + Vite** — Modern, fast development with type safety
- **TanStack Query** — Powerful data fetching with caching, mutations, and background sync
- **TanStack Router** — Type-safe, file-based routing system
- **Tailwind CSS v4** — Latest version with Vite plugin (not PostCSS)
- **React Icons** — Heroicons v2 for consistent UI iconography
- **Supabase** — PostgreSQL + Auth + RLS for backend-as-a-service
- **pnpm** — Faster package management than npm
- **PWA** — Mobile-optimized without app store requirements

## Authentication Strategy

- **Direct Email Authentication** — Native Supabase email/password authentication
- **Progressive Profile Completion** — Minimal signup (email+password), profile completion modal on first login
- **Placeholder Phone System** — Auto-generated placeholder phones until user provides real number
- **Vietnamese Phone Validation** — 10-digit mobile number validation (03, 05, 07, 08, 09 prefixes)
- **Auto Email Confirmation** — All users auto-confirmed via trigger
- **Database Triggers** — Automatic user profile creation with placeholder data
- **Admin Functions** — SQL functions for admin user creation/promotion (email-based)

## Data Access Architecture

- **Supabase Client Integration** — Direct client-side queries with built-in caching
- **TanStack Query Layer** — Data fetching with background sync and optimistic mutations
- **Centralized Query Configuration** — Default `staleTime` (5 min) and retry logic in `App.tsx` QueryClient
- **RLS Policy Enforcement** — Database-level security prevents unauthorized access; no duplicate role gating in the client
- **Optimistic Updates** — Immediate UI feedback with automatic error rollback

## RLS Implementation Strategy

- Policies automatically enforce role-based access — trust the database, not the client
- Admins have full CRUD; employees see their own data plus all schedules (read-only)
- Supervisor role mirrors admin visibility but is read-only (no mutations); UI and backend guards must respect this separation
- Detailed policies documented in `docs/DATABASE.md`

## Supabase Usage Patterns

- **Authentication** — Direct email auth with auto-confirmation trigger
- **Database Queries** — Direct client queries via `supabase.from()` API
- **Mutations** — TanStack Query mutations with error handling and cache invalidation
- **File Uploads** — Storage bucket integration (future: employee photos, documents)
- **Edge Functions** — Server-side logic for complex operations (future: payroll calculations)

## Security

### Environment Variables
- `.env` contains ONLY client-safe variables (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`)
- `SUPABASE_ACCESS_TOKEN` must never be committed — use `npx supabase login` for CLI auth

### Database Security
- RLS policies enforce role-based access automatically
- Triggers prevent unauthorized role changes
- Database constraints and checks enforce input validation

## Database Admin SQL

```sql
-- Create admin user
SELECT create_admin_user('EMAIL', 'PASSWORD', 'NAME');

-- Promote existing user to admin
SELECT promote_user_to_admin('EMAIL');
```

---

_Last verified: October 2025_
