# Shift Registration – Week Navigation & Board Delete (Admin/Supervisor)

## Goal

- **Admin & Supervisor**: See a week navigator on the Shift Registration page to browse any past or future week's registration board.
- **Admin only**: Delete a past week's board (all registrations + the board record).
- **Employee**: No UI change — still sees next week only, submit flow unchanged.

---

## UI Flow

### Employee (unchanged)

- Page loads, shows next week's board as today.
- No week picker shown.

### Admin / Supervisor

- Page defaults to next week (same as today).
- A **week navigator row** appears between the user pill and the board:
  - `[←]  T2 09/06 – T7 14/06/2026  [→]`
  - Left arrow navigates to the previous week.
  - Right arrow navigates to the next week.
- When viewing a **past week** (earlier than next week), an admin-only **"Xoá"** button appears in the navigator row.
- Clicking "Xoá" opens the shared `ConfirmationDialog` modal with the week range in the message body.
- After confirmed delete: board is cleared, query cache is invalidated, UI returns to an empty board for that week.

---

## Data / State Changes in `ShiftRegistrationPage`

| What               | How                                                                                                                                                                                             |
| ------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `weekStart`        | Convert from `useMemo` → `useState(getNextWeekMondayVN())`                                                                                                                                      |
| Week reset         | New `useEffect([weekStart])` that clears `selectedSlots` and resets `dirtyRef.current = false`. **Must be defined before** the existing server-sync effect so it runs first in the same commit. |
| `nextWeek`         | Keep as `useMemo` for gating: `isPastWeek = weekStart < nextWeek`                                                                                                                               |
| `confirmingDelete` | Local `useState<boolean>` for the inline confirm step                                                                                                                                           |

---

## New Helper – `dateUtils.ts`

```ts
export const addWeeks = (weekStart: string, n: number): string => {
  const d = new Date(weekStart + 'T00:00:00');
  d.setDate(d.getDate() + 7 * n);
  return formatDateLocal(d);
};
```

---

## New Mutation – `useShiftRegistrationMutations`

`deleteBoard` — calls the new `delete_shift_registration_board` RPC:

- Admin check (client-side guard + server enforced in RPC).
- On success: invalidates `shift-registrations` and `shift-registration-board` query keys for the week.

---

## New Migration

**File:** `supabase/migrations/20260609000000_admin_delete_shift_registration_board.sql`

**Why a SECURITY DEFINER RPC is required:**

- No admin DELETE policy exists on `shift_registrations` (only employee-self-delete).
- The `check_shift_registration_board_lock` trigger fires BEFORE DELETE on `shift_registrations` and blocks it when the board is locked. Direct client DELETE would be doubly blocked.
- Solution: a SECURITY DEFINER function that (1) unlocks the board first, (2) deletes all registrations, (3) deletes the board record. All three steps happen atomically.

```sql
CREATE OR REPLACE FUNCTION delete_shift_registration_board(p_week_start DATE)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    IF get_user_role(auth.uid()) <> 'admin' THEN
        RAISE EXCEPTION 'Chỉ admin mới có thể xoá bảng đăng ký ca.'
            USING ERRCODE = 'P0001';
    END IF;

    -- Unlock so the board-lock trigger allows the DELETE below.
    UPDATE public.shift_registration_boards
    SET is_locked = false, locked_by = NULL, locked_at = NULL
    WHERE week_start_date = p_week_start;

    DELETE FROM public.shift_registrations
    WHERE week_start_date = p_week_start;

    DELETE FROM public.shift_registration_boards
    WHERE week_start_date = p_week_start;
END;
$$;
```

---

## File Checklist

| File                                                                           | Change                                  |
| ------------------------------------------------------------------------------ | --------------------------------------- |
| `supabase/migrations/20260609000000_admin_delete_shift_registration_board.sql` | New — RPC                               |
| `src/utils/dateUtils.ts`                                                       | Add `addWeeks`                          |
| `src/hooks/useShiftRegistrationMutations.ts`                                   | Add `deleteBoard` mutation              |
| `src/pages/ShiftRegistrationPage.tsx`                                          | Week state, navigator UI, delete button |
| `docs/DATABASE.md`                                                             | Document new RPC                        |

---

## Open Questions / Decisions

1. **Future week cap**: ✅ Decided — right arrow is disabled when `weekStart >= nextWeek`. Navigation is capped at next week; the feature is intended for reviewing and cleaning up past weeks.
2. **Delete gating**: Delete button only shows for `weekStart < nextWeek`. Admins cannot delete the upcoming (active registration) week — this prevents accidentally nuking the week employees are currently filling. Adjust if needed.
3. **Week display format**: Using `formatWeekRangeCompact` (e.g. `09 – 14/06/2026`). Confirm this is acceptable vs. a native `<input type="week">` datepicker.
