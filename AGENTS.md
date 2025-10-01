# MoL Coffee – Agent Handbook
_Last verified: October 2025 (update if project context changes)_

## Project Snapshot
- **Product:** Progressive Web App for MoL Coffee’s employee scheduling & payroll.
- **Audience:** Vietnamese admins & employees; single-branch MVP.
- **Core Tenets:** Mobile-first PWA, Vietnamese UI, email auth with progressive profile completion, strict role-based data isolation.
- **Phase:** MVP foundation complete (~98%); next priorities center on advanced reporting, timekeeping, and PWA polish.

## Tech Stack & Architecture
- **Frontend:** React 19, TypeScript (strict), Vite, Tailwind CSS v4, React Icons.
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
  components/     # Reusable UI pieces (Layout, Toast, PasswordPolicy, etc.)
  pages/          # Page-level components (LoginPage, ProfilePage, PayrollPage…)
  routes/         # TanStack Router route files (do not edit generated routeTree.gen.ts)
  hooks/          # Custom hooks (auth, TanStack Query wrappers)
  context/        # React contexts (AuthContext, ToastContext, etc.)
  utils/          # Helpers (formatMoney, date ranges, validation)
  constants/      # Business constants (password policy, VN timezone offset)
  lib/            # Supabase client and shared config
docs/
  CLAUDE.md       # Comprehensive project context (read this first)
  PROGRESS.md     # Feature status & roadmap
  DATABASE.md     # Schema, RLS, and business rules
  features/       # Deep dives (auth, scheduling, payroll, settings, employee mgmt)
supabase/
  migrations/     # Git-tracked SQL migrations (YYYYMMDDHHMMSS_description.sql)
scripts/          # Tooling scripts
public/, src/assets/  # Static & bundled assets
```
- ✅ Keep `.env` client-safe (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`); never commit secrets.
- ✅ Use `npx supabase login` for CLI auth; don’t persist tokens.
- ⚠️ **Do not modify** `src/routeTree.gen.ts` or other generated artifacts.

## Development Workflow
- `pnpm dev` – Vite dev server.
- `pnpm lint` – ESLint (React hooks rules enforced).
- `pnpm build` – Type-check + production build.
- Database (Supabase CLI required):
  - `pnpm run db:push`, `db:pull`, `db:diff`, `db:migration <name>`.
- Before large changes, run lint and build; ensure migrations mirror docs updates.
- No formal test runner yet; co-locate future tests as `*.test.ts(x)`.

## Coding Standards & UX Expectations
- 2-space indentation, single quotes, trailing commas.
- React function components (PascalCase); variables/functions camelCase; route filenames lowercase.
- Tailwind-first styling; limit custom CSS to `src/index.css` when unavoidable.
- Maintain Vietnamese localization for labels, validation, and currency (`Intl.NumberFormat('vi-VN', { currency: 'VND' })`).
- Enforce Vietnamese phone validation (prefixes 03/05/07/08/09; 10 digits).
- Preserve auth flow: email/password signup → progressive profile completion modal.
- Keep QueryClient configuration centralized; hooks stay lean and typed.

## Feature & Product State (September–October 2025)
- ✅ **Authentication/System Foundation:** Email auth with progressive profile, password policy modules, Vietnamese localization.
- ✅ **Employee Management:** Admin-only CRUD, role management, business rule #7 (no self-demotion).
- ✅ **Settings Management:** Activities & rates with effective dating; real-time TanStack Query sync.
- ✅ **Scheduling System:** Day view calendar, morning/afternoon templates, conflict prevention, role-based editing.
- ✅ **User Profile & Password:** Profile editing, change password, mobile-first layout.
- ✅ **Payroll System:** Schedule-driven payroll, monthly periods with lock/unlock, lunch allowance bonus via `allowance_rates`, dedicated admin/employee views.
- 📌 **Next priorities:** Advanced timekeeping, CSV/export tooling, offline/push notifications (see `docs/PROGRESS.md`).

## Database & Security Notes
- Supabase tables documented in `docs/DATABASE.md`; follow RLS policies (admins vs employees).
- Triggers auto-create user profiles and enforce placeholder data on signup.
- Payroll calculations derive from `schedule_shifts` + rate effective dates; month boundaries adjusted using `VN_TIMEZONE_OFFSET_MINUTES`.
- When altering schema:
  1. Create migration `supabase/migrations/YYYYMMDDHHMMSS_description.sql`.
  2. Update `docs/DATABASE.md` + relevant feature doc.
  3. Confirm RLS coverage and triggers remain idempotent.

## Agent Operating Checklist
1. Read/update `docs/CLAUDE.md`, `docs/PROGRESS.md`, and relevant feature docs before major work.
2. Preserve Vietnamese UX, PWA responsiveness, and role-based behaviours.
3. Prefer surgical changes; avoid broad refactors unless requested.
4. Run lint/build before handing off significant code edits.
5. Surface residual risks or testing gaps when work cannot be fully validated.
6. Coordinate documentation updates (PROGRESS, DATABASE, feature specs) alongside code changes.

## Reference Index
- `docs/CLAUDE.md` – Full context & architecture rationale.
- `docs/PROGRESS.md` – Status tracker and roadmap.
- `docs/DATABASE.md` – Schema, RLS, business rules.
- `docs/features/*.md` – Feature-level specs (auth, scheduling, payroll, employee mgmt, settings).
- `README.md` – Setup & command quickstart.
