# Shift Registration — Technical Implementation Plan

> **User story:** `docs/features/shift-registration.md`  
> **Progress tracker:** `docs/features/shift-registration-progress.md`

---

## Key Architectural Decisions

1. **Atomic submit via Postgres RPC** — AC4 requires all-or-nothing registration. Client-side sequential DELETE + INSERT cannot guarantee this. A `submit_shift_registrations` Postgres function runs the diff inside a single transaction and preserves `registered_at` for unchanged rows (AC5 avatar order).
2. **`shift_template` enum reused** — the existing `'morning' | 'afternoon'` DB enum is reused as-is.
3. **Hex colors via inline `style` prop** — heat colors (`#F4F4F4`, `#D6F5EC`, etc.) are not Tailwind presets; must use `style={{ backgroundColor, borderColor, color }}`.
4. **Navigation: horizontal nav links row** added to `Layout.tsx` below the existing header bar. Visible to all logged-in users, scrollable on mobile.

---

## Phase 1 — Database Migration

**File:** `supabase/migrations/20260520000000_shift_registration.sql`

### Table: `shift_registration_boards`

```sql
CREATE TABLE public.shift_registration_boards (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    week_start_date DATE NOT NULL UNIQUE,
    is_locked BOOLEAN DEFAULT false NOT NULL,
    locked_by UUID REFERENCES public.users(id),
    locked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT shift_registration_boards_lock_check CHECK (
        (is_locked = false AND locked_by IS NULL AND locked_at IS NULL) OR
        (is_locked = true  AND locked_by IS NOT NULL AND locked_at IS NOT NULL)
    )
);
CREATE TRIGGER update_shift_registration_boards_updated_at
    BEFORE UPDATE ON public.shift_registration_boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

Mirrors the `payroll_periods` lock pattern exactly.

### Table: `shift_registrations`

```sql
CREATE TABLE public.shift_registrations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
    week_start_date DATE NOT NULL,
    day_date DATE NOT NULL,
    shift_template shift_template NOT NULL,
    registered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    CONSTRAINT shift_registrations_unique_slot UNIQUE (user_id, day_date, shift_template)
);
CREATE INDEX idx_shift_registrations_week_start ON public.shift_registrations(week_start_date);
CREATE INDEX idx_shift_registrations_user_week  ON public.shift_registrations(user_id, week_start_date);
CREATE TRIGGER update_shift_registrations_updated_at
    BEFORE UPDATE ON public.shift_registrations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

- `registered_at` drives avatar display order (queried `ORDER BY registered_at ASC`)
- `week_start_date` is denormalized for efficient weekly queries
- Natural key: `UNIQUE(user_id, day_date, shift_template)`

### Lock Enforcement Trigger (defense-in-depth)

Fires on INSERT/DELETE of `shift_registrations` to block modifications when the board is locked. When no board row exists for the week, `v_is_locked` is NULL — the check passes, meaning unlocked by default.

```sql
CREATE OR REPLACE FUNCTION check_shift_registration_board_lock()
RETURNS TRIGGER AS $$
DECLARE v_is_locked BOOLEAN; v_week_start DATE;
BEGIN
    IF TG_OP = 'DELETE' THEN v_week_start := OLD.week_start_date;
    ELSE v_week_start := NEW.week_start_date; END IF;
    SELECT is_locked INTO v_is_locked FROM public.shift_registration_boards
    WHERE week_start_date = v_week_start;
    IF v_is_locked = true THEN
        RAISE EXCEPTION 'Bảng đăng ký ca đã bị khoá. Liên hệ admin để thay đổi.'
            USING ERRCODE = 'P0001';
    END IF;
    IF TG_OP = 'DELETE' THEN RETURN OLD; ELSE RETURN NEW; END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER shift_registration_lock_check
    BEFORE INSERT OR DELETE ON public.shift_registrations
    FOR EACH ROW EXECUTE FUNCTION check_shift_registration_board_lock();
```

### Atomic Submit RPC

`SECURITY DEFINER` — runs inside a single transaction. `ON CONFLICT DO NOTHING` preserves `registered_at` for unchanged rows (AC5 avatar order guarantee).

```sql
CREATE OR REPLACE FUNCTION submit_shift_registrations(
    p_week_start DATE, p_user_id UUID, p_slots JSONB
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    v_is_locked BOOLEAN;
    v_slot JSONB; v_day_date DATE; v_template shift_template;
BEGIN
    -- Ownership check
    IF p_user_id <> get_user_by_auth_id(auth.uid()) THEN
        RAISE EXCEPTION 'Không có quyền đăng ký ca cho người dùng khác.'
            USING ERRCODE = 'P0001';
    END IF;
    -- Lock check
    SELECT is_locked INTO v_is_locked FROM public.shift_registration_boards
    WHERE week_start_date = p_week_start;
    IF v_is_locked = true THEN
        RAISE EXCEPTION 'Bảng đăng ký ca đã bị khoá. Liên hệ admin để thay đổi.'
            USING ERRCODE = 'P0001';
    END IF;
    -- Delete deselected rows only
    DELETE FROM public.shift_registrations
    WHERE user_id = p_user_id AND week_start_date = p_week_start
      AND NOT EXISTS (
          SELECT 1 FROM jsonb_array_elements(p_slots) s
          WHERE (s->>'day_date')::DATE = day_date
            AND (s->>'shift_template')::shift_template = shift_template
      );
    -- Insert newly selected; ON CONFLICT DO NOTHING preserves registered_at
    FOR v_slot IN SELECT * FROM jsonb_array_elements(p_slots) LOOP
        v_day_date := (v_slot->>'day_date')::DATE;
        v_template := (v_slot->>'shift_template')::shift_template;
        INSERT INTO public.shift_registrations (user_id, week_start_date, day_date, shift_template)
        VALUES (p_user_id, p_week_start, v_day_date, v_template)
        ON CONFLICT (user_id, day_date, shift_template) DO NOTHING;
    END LOOP;
END;
$$;
```

### RLS Policies

```sql
ALTER TABLE public.shift_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_registration_boards ENABLE ROW LEVEL SECURITY;

-- shift_registrations
CREATE POLICY "Authenticated users can read shift registrations"
    ON public.shift_registrations FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Employees can insert own shift registrations"
    ON public.shift_registrations FOR INSERT
    WITH CHECK (user_id = get_user_by_auth_id(auth.uid()) AND get_user_role(auth.uid()) = 'employee');
CREATE POLICY "Employees can delete own shift registrations"
    ON public.shift_registrations FOR DELETE
    USING (user_id = get_user_by_auth_id(auth.uid()) AND get_user_role(auth.uid()) = 'employee');

-- shift_registration_boards
CREATE POLICY "Authenticated users can read shift registration boards"
    ON public.shift_registration_boards FOR SELECT USING (auth.role() = 'authenticated');
CREATE POLICY "Admins can manage shift registration boards"
    ON public.shift_registration_boards FOR ALL
    USING (get_user_role(auth.uid()) = 'admin')
    WITH CHECK (get_user_role(auth.uid()) = 'admin');
```

> The normal submit flow uses the `SECURITY DEFINER` RPC (bypasses RLS). The INSERT/DELETE RLS policies are defense-in-depth against direct API access.

---

## Phase 2 — TypeScript Types

**File:** `src/types/index.ts` — append:

```typescript
export interface ShiftRegistration {
  id: string
  user_id: string
  week_start_date: string          // YYYY-MM-DD
  day_date: string                  // YYYY-MM-DD
  shift_template: ShiftTemplate
  registered_at: string             // ISO timestamp — drives avatar display order
  created_at: string
  updated_at: string
  user?: Pick<User, 'id' | 'name'>
}

export interface ShiftRegistrationBoard {
  id: string
  week_start_date: string
  is_locked: boolean
  locked_by: string | null
  locked_at: string | null
  created_at: string
  updated_at: string
  locked_by_user?: Pick<User, 'id' | 'name'>
}
```

---

## Phase 3 — Utilities

### `src/utils/dateUtils.ts` — add `getNextWeekMondayVN`

```typescript
export const getNextWeekMondayVN = (): string => {
  const vnNowMs = Date.now() + VN_TIMEZONE_OFFSET_MINUTES * 60 * 1000
  const vnDate = new Date(vnNowMs)
  const dayOfWeek = vnDate.getUTCDay() // 0=Sun
  const diffToThisMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek
  const nextMonday = new Date(vnNowMs)
  nextMonday.setUTCDate(nextMonday.getUTCDate() + diffToThisMonday + 7)
  const yyyy = nextMonday.getUTCFullYear()
  const mm = String(nextMonday.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(nextMonday.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}
```

Uses UTC arithmetic shifted by `VN_TIMEZONE_OFFSET_MINUTES` to avoid browser-locale day-boundary ambiguity.

### `src/utils/shiftRegistrationUtils.ts` — new file

| Export | Description |
|--------|-------------|
| `HeatLevel` | `'empty' \| 'light' \| 'fulfilled' \| 'busy' \| 'crowded' \| 'selected'` |
| `SHIFT_CAPS` | `{ morning: 3, afternoon: 1 }` |
| `getHeatLevel(count, template, isSelected)` | Returns heat level; `isSelected` overrides all |
| `HEAT_STYLES` | Exact hex values for bg/border/text per heat level |
| `getDayLabel(date)` | T2/T3/.../T7/CN |
| `getShiftLabel(template)` | Sáng / Chiều |
| `formatSelectedSlots(Set<string>)` | "T2 Sáng · T3 Chiều" |
| `slotKey(dayDate, template)` | `"YYYY-MM-DD_morning"` composite key |

Heat level mapping:
- **Morning** (cap 3): 0→empty, 1-2→light, 3→fulfilled, 4-5→busy, 6+→crowded
- **Afternoon** (cap 1): 0→empty, 1→fulfilled, 2-3→busy, 4+→crowded _(no light state)_
- `isSelected=true` always returns `'selected'` regardless of count

`HEAT_STYLES` hex values:

| Level | bg | border | text |
|-------|----|--------|------|
| empty | `#F4F4F4` | `#DCDCDC` | `#AAAAAA` |
| light | `#D6F5EC` | `#85D4BC` | `#1A6B57` |
| fulfilled | `#A8E6CF` | `#3BAF87` | `#135E3F` |
| busy | `#FFE8C8` | `#F5A623` | `#7A4500` |
| crowded | `#FADDE4` | `#E8819A` | `#7D1F3A` |
| selected | `#EEEDFE` | `#7F77DD` | `#3C3489` |

### `src/utils/nameUtils.ts` — add `getInitials`

```typescript
export function getInitials(name: string): string {
  return name.split(' ').filter(Boolean).map((w) => w[0]).join('').toUpperCase().slice(0, 2)
}
```

Check if the file already exists before creating it. Add alongside `abbreviateName` if present.

---

## Phase 4 — Hooks

### `src/hooks/useShiftRegistrations.ts`

- Query key: `['shift-registrations', weekStart]`
- Select: `*, user:users(id, name)`
- Filter: `.eq('week_start_date', weekStart)`
- Order: `.order('registered_at', { ascending: true })` — critical for avatar order

### `src/hooks/useShiftRegistrationBoard.ts`

- Query key: `['shift-registration-board', weekStart]`
- Uses `.maybeSingle()` — returns `null` when no board row exists (= unlocked by default)

### `src/hooks/useShiftRegistrationMutations.ts`

**`submit` mutation:**
- Validates `isEmployee(user.role)` before calling
- Calls `supabase.rpc('submit_shift_registrations', { p_week_start, p_user_id, p_slots })`
- On success: invalidates `['shift-registrations', weekStart]`

**`toggleLock` mutation:**
- Validates `isAdmin(user.role)` before calling
- Upserts `shift_registration_boards` with `onConflict: 'week_start_date'`
- Sets `is_locked / locked_by / locked_at` based on `!currentlyLocked`
- On success: invalidates `['shift-registration-board', weekStart]`

### `src/hooks/index.ts` — add re-exports for all three hooks

---

## Phase 5 — Components

All new components in `src/components/shift-registration/`.

### `RegistrationCell.tsx`

Props: `dayDate`, `template`, `registrations` (pre-filtered + ordered), `isSelected`, `isReadOnly`, `onToggle`

- `position: relative; border-radius: 8px; min-height: 72px` with inline heat-color styles
- Top-right badge: `✓` (`#3BAF87`) when fulfilled and not selected; `●` (`#534AB7`) when selected
- Avatar row: up to 4 circles (20×20px) with initials from `getInitials(name)`, then "+N" overflow. Color each circle by hashing `user.id` against a 6-color palette.
- Count: `{n} người` in `text-xs`
- `role="button"`, `tabIndex={isReadOnly ? -1 : 0}`, `onKeyDown` (Enter/Space)
- When `isReadOnly`: `pointer-events: none; opacity: 0.8`

### `RegistrationGrid.tsx`

Props: `weekDays`, `registrations`, `selectedSlots`, `isReadOnly`, `onToggleSlot`

Layout: `grid-cols-[52px_1fr_1fr]` (same as `WeekScheduleView.tsx`)

Rows:
1. Legend (6 heat swatches + labels; inline, not a sub-component)
2. Column headers: "Ca sáng / 06:00–12:00" | "Ca chiều / 12:00–18:00"
3. 7 day rows; insert `col-span-3 border-t` divider between index 4 (Fri) and index 5 (Sat)

### `SummaryBar.tsx`

Props: `selectedSlots`, `isLocked`, `isAdmin`, `isSubmitting`, `isTogglingLock`, `onSubmit`, `onToggleLock`

- `sticky bottom-0 z-40 bg-surface/95 backdrop-blur border-t`
- Page container needs `pb-28` to prevent content hiding behind the bar
- Left: `{n} ca đã chọn` + compact slot labels; "Bảng đã khoá" when locked
- Right: "Đăng ký" button (employees, unlocked, `selectedSlots.size > 0`); "Khoá / Mở khoá" button (admin only)

### `LockedBanner.tsx`

Props: `lockedByName?: string`

Amber banner (`border-amber-400/40 bg-amber-500/10 rounded-2xl`):  
"Admin đã khoá đăng ký ca tuần này. Liên hệ trực tiếp với admin để thay đổi."

---

## Phase 6 — Page

**File:** `src/pages/ShiftRegistrationPage.tsx`

```
weekStart      = useMemo(() => getNextWeekMondayVN(), [])   // stable for page lifetime
weekDays       = useMemo(...)                                // 7 Date objects Mon–Sun
registrations  = useShiftRegistrations(weekStart)
board          = useShiftRegistrationBoard(weekStart)
{ submit,
  toggleLock } = useShiftRegistrationMutations()

isLocked       = board?.is_locked ?? false
isReadOnly     = !isEmployee(user.role) || isLocked
selectedSlots  = useState<Set<string>>
```

- `useEffect` syncs `selectedSlots` from own registrations on load (pre-populates for returning users)
- `handleToggleSlot`: guards `if (isReadOnly) return`; uses functional setState
- `handleSubmit`: `submit.mutateAsync(...)` → `showSuccess` / `showError`
- `handleToggleLock`: `toggleLock.mutateAsync(...)` → `showSuccess` / `showError`
- Week header label: `formatWeekRangeCompact(weekDays[0], weekDays[6])`

---

## Phase 7 — Route

**File:** `src/routes/_authenticated/shift-registration.tsx`

```typescript
import { createFileRoute } from '@tanstack/react-router'
import { ShiftRegistrationPage } from '../../pages/ShiftRegistrationPage'

export const Route = createFileRoute('/_authenticated/shift-registration')({
  component: ShiftRegistrationPage,
})
```

No search params — always shows next week.

---

## Phase 8 — Navigation

**File:** `src/components/Layout.tsx`

Add a second `<div>` below the existing `<nav>` (h-16 header), inside the `{user && (...)}` block:

```tsx
<div className="border-b border-subtle bg-surface">
  <div className="mx-auto flex max-w-7xl gap-1 overflow-x-auto px-4 sm:px-6 lg:px-8">
    <NavLink to="/dashboard">Tổng quan</NavLink>
    <NavLink to="/schedule">Ca làm việc</NavLink>
    <NavLink to="/shift-registration">Đăng ký ca</NavLink>
    <NavLink to="/recipes">Công thức</NavLink>
    {canAccessManagement(user.role) && <NavLink to="/employees">Nhân viên</NavLink>}
    {canAccessManagement(user.role) && <NavLink to="/payroll">Lương</NavLink>}
  </div>
</div>
```

`NavLink` — local wrapper using TanStack Router `Link` with `activeProps={{ className: 'active' }}` to apply `border-b-2 border-blue-500 text-primary` on the active route. `overflow-x-auto` handles mobile scroll.

---

## Phase 9 — Docs Updates

- **`docs/DATABASE.md`** — add schema for `shift_registrations` and `shift_registration_boards`; document `registered_at` ordering; add RPC atomicity note; add to migration history table
- **`docs/PROGRESS.md`** — add Shift Registration to feature status

---

## Risk Register

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Submit not atomic | High | Eliminated — Postgres RPC runs in single transaction |
| Avatar order disturbed on re-submit | High | Eliminated — `ON CONFLICT DO NOTHING` preserves `registered_at` |
| Supervisor bypasses RLS via direct API | High | RLS policies require `get_user_role = 'employee'`; RPC checks `auth.uid()` ownership |
| VN timezone week boundary ambiguity | Medium | `getNextWeekMondayVN` uses UTC arithmetic with `VN_TIMEZONE_OFFSET_MINUTES` |
| Hex colors misrendered as Tailwind classes | Low | All heat colors use inline `style` prop from `HEAT_STYLES` constant |
| Admin lock race (two admins simultaneously) | Low | `upsert onConflict: 'week_start_date'` is last-write-wins; fine for small team |
| Occupancy staleness | Low | `refetchOnWindowFocus` + `invalidateQueries` on submit; Supabase realtime deferred to v2 |
| Layout height change on all pages | Low | ~40px nav row; no content clipping (`<main>` uses `py-6`) |
| `weekStart` drift across midnight on Sunday | Low | Acceptable for v1; page refresh picks up new week |

---

## Verification Checklist

- [ ] Apply migration: `npx supabase db push`
- [ ] TypeScript build passes: `pnpm run build`
- [ ] Lint passes: `pnpm run lint`
- [ ] **Employee:** tap cells → submit → initials appear in grid, toast shown
- [ ] **Employee:** reload → existing selections pre-highlighted
- [ ] **Employee:** deselect one slot, re-submit → slot removed, others preserve avatar order
- [ ] **Admin:** lock board → banner visible, cells inert, submit hidden
- [ ] **Employee (locked):** cannot tap, no submit button, sees banner
- [ ] **Admin:** unlock → employees can register again
- [ ] **Supervisor:** sees full grid, no tap/submit/lock controls
- [ ] **Mobile 375px:** grid renders, SummaryBar sticky, nav scrollable
- [ ] Heat colors are correct hex values (inspect element)
