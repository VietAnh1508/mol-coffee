# Shift Registration — Implementation Progress

> **User story:** `docs/features/shift-registration.md`  
> **Technical plan:** `docs/features/shift-registration-plan.md`

---

## Status

| Phase | Area | Status |
|-------|------|--------|
| 1 | Database migration | ✅ Done |
| 2 | TypeScript types | ✅ Done |
| 3 | Utility functions | ✅ Done |
| 4 | Hooks | ✅ Done |
| 5 | Components | ✅ Done |
| 6 | Page | ✅ Done |
| 7 | Route | ✅ Done |
| 8 | Navigation | ✅ Done |
| 9 | Docs updates | ⬜ Not started |

---

## Phase 1 — Database Migration

**File:** `supabase/migrations/20260520000000_shift_registration.sql`

- [x] `shift_registration_boards` table + lock CHECK constraint + trigger
- [x] `shift_registrations` table + unique constraint + indexes + trigger
- [x] Lock enforcement trigger function `check_shift_registration_board_lock`
- [x] Atomic submit RPC `submit_shift_registrations`
- [x] RLS policies for both tables
- [x] Migration applied to local Supabase (`npx supabase db push`)

---

## Phase 2 — TypeScript Types

**File:** `src/types/index.ts`

- [x] `ShiftRegistration` interface added
- [x] `ShiftRegistrationBoard` interface added

---

## Phase 3 — Utilities

- [x] `getNextWeekMondayVN()` added to `src/utils/dateUtils.ts`
- [x] `src/utils/shiftRegistrationUtils.ts` created with all exports:
  - [x] `HeatLevel` type
  - [x] `SHIFT_CAPS`
  - [x] `getHeatLevel`
  - [x] `HEAT_STYLES` (exact hex values)
  - [x] `getDayLabel` (note: `getShiftLabel` replaced by `SHIFT_TEMPLATES[template].label` from `src/constants/shifts.ts`)
  - [x] `formatSelectedSlots`
  - [x] `slotKey`
- [x] `getInitials` added to `src/utils/nameUtils.ts`

---

## Phase 4 — Hooks

- [x] `src/hooks/useShiftRegistrations.ts` created
- [x] `src/hooks/useShiftRegistrationBoard.ts` created
- [x] `src/hooks/useShiftRegistrationMutations.ts` created (`submit` + `toggleLock`)
- [x] All three exported from `src/hooks/index.ts`

---

## Phase 5 — Components

**Directory:** `src/components/shift-registration/`

- [x] `RegistrationCell.tsx` — heat colors, avatar dots, selection indicator, tap handler
- [x] `RegistrationGrid.tsx` — 7×2 grid, legend row, weekend divider
- [x] `SummaryBar.tsx` — sticky bottom bar, count, submit/lock buttons
- [x] `LockedBanner.tsx` — amber locked state banner

---

## Phase 6 — Page

- [x] `src/pages/ShiftRegistrationPage.tsx` created
  - [x] `weekStart` computed and memoized
  - [x] `selectedSlots` state + sync from existing registrations on load
  - [x] Role guards for `isReadOnly`, submit, lock
  - [x] Submit handler with toast feedback
  - [x] Toggle lock handler with toast feedback

---

## Phase 7 — Route

- [x] `src/routes/_authenticated/shift-registration.tsx` created
- [x] Route appears in generated `routeTree.gen.ts` (run dev server or `pnpm run build`)

---

## Phase 8 — Navigation

- [x] "Đăng ký ca" shortcut card added to `src/pages/DashboardPage.tsx`

---

## Phase 9 — Docs Updates

- [ ] `docs/DATABASE.md` updated with new tables
- [ ] `docs/PROGRESS.md` updated with Shift Registration feature status

---

## Acceptance Criteria Sign-off

| AC | Description | Status |
|----|-------------|--------|
| AC1 | Screen accessible from nav; shows next week only; user pill visible | ⬜ |
| AC2 | Grid shows all shifts with live occupancy + heat colors + avatar order | ⬜ |
| AC3 | Employee can select multiple shifts; summary bar updates live | ⬜ |
| AC4 | Submit is all-or-nothing; toast on success/failure | ⬜ |
| AC5 | Re-submit preserves existing `registered_at` order; board locked = read-only | ⬜ |
| AC6 | Admin lock/unlock button; per-week state | ⬜ |
| AC7 | Legend always visible | ⬜ |

---

## Notes / Decisions Log

| Date | Note |
|------|------|
| 2026-05-20 | Plan drafted. Atomic submit via Postgres RPC chosen over client-side sequential mutations. Navigation entry point chosen as horizontal nav row in Layout.tsx. |
| 2026-05-20 | Phases 1–3 complete. `getShiftLabel` removed from utils — shift labels now read from `SHIFT_TEMPLATES[template].label` in `src/constants/shifts.ts`. |
| 2026-05-20 | Phases 5–8 complete. Navigation implemented as a dashboard shortcut card (teal, FaClipboardList icon) instead of a horizontal nav row. |
