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
- Trust RLS for access control — no duplicate role gating in the client unless UX requires a specific message.

## Key Docs

- `docs/ARCHITECTURE.md` — architecture rationale & design decisions
- `docs/PROGRESS.md` — feature status & roadmap; check before starting new work
- `docs/DATABASE.md` — authoritative schema, RLS policies, and business rules
- `docs/features/` — per-feature deep dives (auth, scheduling, payroll, settings, employee mgmt, recipes)
- `docs/FEATURE_PLANNING.md` — templates and process for planning new features

⚠️ **Do not modify** `src/routeTree.gen.ts` or other generated artifacts.

## Coding Standards & UX Expectations

- Custom CSS goes only in `src/index.css`; use Tailwind otherwise.
- All UI text, labels, and validation messages must be in Vietnamese.
  - Currency: `Intl.NumberFormat('vi-VN', { currency: 'VND' })`
  - Phone: prefixes 03/05/07/08/09, exactly 10 digits
- Auth flow: email/password signup → progressive profile completion modal (do not skip or bypass).
- **Supervisor role** mirrors admin visibility but is strictly read-only — no mutations, enforced in both UI and backend.

## Database & Schema Changes

- Triggers auto-create user profiles with placeholder data on signup.
- Payroll month boundaries use `VN_TIMEZONE_OFFSET_MINUTES` — don't use raw UTC.
- All migrations must be idempotent: `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`, `DROP TRIGGER IF EXISTS` before `CREATE TRIGGER`, `DROP POLICY IF EXISTS` before `CREATE POLICY`.

## New Feature Planning Workflow

When the user requests a new feature, **first ask** whether they want to go through the full planning workflow (user story + implementation plan + progress tracker) or whether it is a small change that can be implemented directly. Use judgement: a new screen, a new data model, or anything that touches multiple layers (DB + hooks + UI) warrants the full workflow; a one-file tweak or minor UI addition does not.

If they want the full workflow, read **`docs/FEATURE_PLANNING.md`** for the step-by-step process and the exact templates for all three planning documents. Follow it before writing any code.

---

## Agent Checklist

1. Read `docs/PROGRESS.md` and relevant feature doc before starting significant work.
2. For new features, follow the workflow in `docs/FEATURE_PLANNING.md` and get approval before writing code.
3. Update `docs/PROGRESS.md`, `docs/DATABASE.md`, and the feature's `*-progress.md` alongside code changes.
