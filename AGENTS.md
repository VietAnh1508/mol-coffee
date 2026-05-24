# MoL Coffee – Agent Handbook

_Last verified: March 2026 (update if project context changes)_

> For tech stack, commands, env vars, and docs index see `README.md`.

## Project Snapshot

- **Product:** Progressive Web App for MoL Coffee's employee scheduling & payroll.
- **Audience:** Vietnamese admins & employees; single-branch MVP.
- **Core Tenets:** Mobile-first PWA, Vietnamese UI, email auth with progressive profile completion, strict role-based data isolation.
- **Phase:** MVP foundation complete (~98%); next priorities center on advanced reporting, timekeeping, and PWA polish.

## Architecture & Patterns

- **State/Data:** TanStack Router (file-based) + TanStack Query with shared QueryClient config (default `staleTime` 5 min, global retry logic).
- **Backend:** Supabase (PostgreSQL + Auth + Storage); heavy reliance on RLS and triggers.
- **Pattern Expectations:**
  - Fetch server data via TanStack Query hooks; avoid manual `useEffect` fetches.
  - Prefer React contexts for app-level state; keep server state in Query cache.
  - Optimistic updates with error rollbacks for mutations.
  - Trust RLS for access control—no duplicate role gating in the client unless UX requires messaging.

## Repository Map & Guardrails

```
src/
  components/     # Reusable UI pieces, organized by domain
  pages/          # Page-level components (LoginPage, ProfilePage, PayrollPage…)
  routes/         # TanStack Router route files (do not edit generated routeTree.gen.ts)
  hooks/          # Custom hooks (auth, TanStack Query wrappers)
  context/        # React contexts (AuthContext, ToastContext, etc.)
  utils/          # Helpers (formatMoney, date ranges, validation)
  constants/      # Business constants (password policy, VN timezone offset)
  types/          # Shared TypeScript type definitions
  lib/            # Supabase client and shared config
  assets/         # Bundled static assets
docs/
  ARCHITECTURE.md # Architecture rationale & design decisions
  PROGRESS.md     # Feature status & roadmap
  DATABASE.md     # Schema, RLS, and business rules
  features/       # Deep dives (auth, scheduling, payroll, settings, employee mgmt, recipes)
supabase/
  migrations/     # Git-tracked SQL migrations (YYYYMMDDHHMMSS_description.sql)
scripts/          # Tooling scripts
public/           # Static assets served at root
```

- ✅ Keep `.env` client-safe (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); never commit secrets.
- ✅ Use `npx supabase login` for CLI auth; don't persist tokens.
- ⚠️ **Do not modify** `src/routeTree.gen.ts` or other generated artifacts.

## Coding Standards & UX Expectations

- 2-space indentation, single quotes, trailing commas.
- React function components (PascalCase); variables/functions camelCase; route filenames lowercase.
- Tailwind-first styling; limit custom CSS to `src/index.css` when unavoidable.
- Use `pnpm` (not `npx`) for all project scripts. Co-locate tests as `*.test.ts(x)` next to the file under test.
- Maintain Vietnamese localization for labels, validation, and currency (`Intl.NumberFormat('vi-VN', { currency: 'VND' })`).
- Enforce Vietnamese phone validation (prefixes 03/05/07/08/09; 10 digits).
- Preserve auth flow: email/password signup → progressive profile completion modal.
- Keep QueryClient configuration centralized; hooks stay lean and typed.
- **Supervisor role** mirrors admin visibility but is read-only — never allow mutations for Supervisor, enforce both in UI guards and backend logic.

## Feature & Product State (March 2026)

- ✅ **Authentication/System Foundation:** Email auth with progressive profile, password policy modules, forgot password flow, Vietnamese localization.
- ✅ **Employee Management:** Admin-only CRUD, role management, no self-demotion rule.
- ✅ **Settings Management:** Activities & rates with effective dating; real-time TanStack Query sync.
- ✅ **Scheduling System:** Day + week view calendar, morning/afternoon templates, conflict prevention, role-based editing.
- ✅ **User Profile & Password:** Profile editing, change password, mobile-first layout.
- ✅ **Payroll System:** Schedule-driven payroll, monthly periods with lock/unlock, lunch allowance bonus via `allowance_rates`, dedicated admin/employee views.
- ✅ **Recipes:** Admin CRUD for recipes; read-only view for employees.
- 📌 **Next priorities:** Advanced timekeeping, CSV/export tooling, offline/push notifications (see `docs/PROGRESS.md`).

## Database & Security Notes

- Supabase tables documented in `docs/DATABASE.md`; follow RLS policies (admins vs employees).
- Triggers auto-create user profiles and enforce placeholder data on signup.
- Payroll calculations derive from `schedule_shifts` + rate effective dates; month boundaries adjusted using `VN_TIMEZONE_OFFSET_MINUTES`.
- When altering schema:
  1. Create migration `supabase/migrations/YYYYMMDDHHMMSS_description.sql`.
  2. Update `docs/DATABASE.md` + relevant feature doc.
  3. Confirm RLS coverage and triggers remain idempotent.
  4. **Write all migrations idempotently:** use `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`, and `DROP POLICY IF EXISTS` before `CREATE POLICY`. This allows safe re-runs without errors.

## Agent Operating Checklist

1. Read/update `docs/ARCHITECTURE.md`, `docs/PROGRESS.md`, and relevant feature docs before major work.
2. Preserve Vietnamese UX, PWA responsiveness, and role-based behaviours.
3. Prefer surgical changes; avoid broad refactors unless requested.
4. Run lint/build before handing off significant code edits.
5. Surface residual risks or testing gaps when work cannot be fully validated.
6. Coordinate documentation updates (PROGRESS, DATABASE, feature specs) alongside code changes.
