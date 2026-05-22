# Feature Spec: Shift Registration Annotations

## Overview

| Field            | Detail                                              |
| ---------------- | --------------------------------------------------- |
| **Feature**      | Partial Shift Annotation                            |
| **Parent story** | Shift Registration (`shift-registration.md`) — AC8  |
| **Epic**         | Staff Scheduling                                    |
| **Priority**     | Medium                                              |
| **Target users** | Employees (write); Admin / Supervisor (read-only)   |

---

## Problem

Employees sometimes work partial shifts — arriving late or leaving early — and currently have no way to communicate this when self-registering. The information is passed verbally to the admin, who must remember it separately. Adding per-slot annotation to the registration board captures this intent at the point of registration.

---

## UX Flow

### Employee annotating a slot

1. Employee taps a grid cell → slot is selected (cell turns indigo, existing behaviour).
2. The slot appears as a **chip** in the SummaryBar chip strip at the bottom.
3. Employee taps the chip body → `AnnotationBottomSheet` slides up.
4. Bottom sheet shows:
   - **Header:** slot label + shift window (e.g., `Thứ 2 · Ca sáng · 06:00–12:00`)
   - **Giờ đến** — `<input type="time">`, default = shift start, clamped to shift window
   - **Giờ về** — `<input type="time">`, default = shift end, clamped to shift window
   - **Ghi chú** — `<textarea>`, max 200 characters, placeholder: `"Vd: đến muộn do xe hỏng..."`
   - Buttons: `"Xoá ghi chú"` (ghost) · `"Lưu"` (indigo)
5. Inline validation: if Giờ về ≤ Giờ đến, show `"Giờ về phải sau Giờ đến"` and disable **Lưu**.
6. **Lưu** stores the annotation in local state and closes the sheet.
7. **Xoá ghi chú** clears annotation fields for that slot (resets to defaults).
8. Annotated chip displays a clock indicator (⏱) before the slot label.
9. The employee's avatar in that grid cell shows a small tick icon (✓).
10. All annotations are submitted in one tap of **Đăng ký** — no separate save step.

### Deselecting an annotated slot

- Tapping **×** on a chip (or re-tapping the selected grid cell) deselects the slot and discards its annotation.

### Reloading / pre-fill

- When the page loads with existing registrations, annotations are pre-filled into chips alongside the pre-selected slots.
- Annotations are preserved across resubmits as long as the slot remains selected (the RPC uses `ON CONFLICT DO UPDATE` for annotation fields while preserving `registered_at`).

### Admin / Supervisor inspect mode

- Tapping any cell — regardless of `isReadOnly` state — opens `AnnotationBottomSheet` in read-only mode.
- Sheet shows a list of registered users for that slot; each entry displays:
  - Avatar + name
  - Custom hours if set: `"Giờ đến: 08:00 · Giờ về: 11:00"`
  - Note text if present
- No edit controls; close button only.

### Locked board

- When the board is locked, employees cannot open or edit annotation sheets (cells are not tappable for employees).
- Admin/supervisor inspect mode still works on a locked board.

---

## Data Model

### Changes to `shift_registrations`

**Migration:** `supabase/migrations/20260521000000_shift_registration_annotations.sql`

New columns (all nullable — existing rows and unlabelled registrations are unaffected):

| Column               | Type   | Constraint                                              |
| -------------------- | ------ | ------------------------------------------------------- |
| `custom_start_time`  | `TIME` | Must be ≥ shift window start if set                     |
| `custom_end_time`    | `TIME` | Must be ≤ shift window end, and > `custom_start_time`   |
| `note`               | `TEXT` | No DB length limit; application validates ≤ 200 chars   |

DB constraints added:
- `chk_custom_time_order` — `custom_end_time > custom_start_time` (when both set)
- `chk_morning_window` — times within `06:00–12:00` for morning shifts
- `chk_afternoon_window` — times within `12:00–18:00` for afternoon shifts

### RPC change: `submit_shift_registrations`

The INSERT loop changes from `ON CONFLICT DO NOTHING` to:

```sql
ON CONFLICT (user_id, day_date, shift_template) DO UPDATE
    SET custom_start_time = EXCLUDED.custom_start_time,
        custom_end_time   = EXCLUDED.custom_end_time,
        note              = EXCLUDED.note,
        updated_at        = NOW()
-- registered_at is intentionally excluded — avatar order is preserved
```

When an employee resubmits without changing a previously-registered slot, the annotation is updated but `registered_at` stays the same.

### Lock trigger extension

The existing `check_shift_registration_board_lock` trigger is extended to fire on `BEFORE UPDATE` in addition to `BEFORE INSERT OR DELETE`, so direct UPDATE bypassing the RPC is also blocked when the board is locked.

---

## TypeScript Types

### `SlotAnnotation` (new)

```typescript
// src/types/index.ts
export interface SlotAnnotation {
  customStartTime: string | null  // "HH:MM" or null = use shift default
  customEndTime:   string | null
  note:            string | null
}
```

### `ShiftRegistration` (extended)

```typescript
// src/types/index.ts
export interface ShiftRegistration {
  // ... existing fields ...
  custom_start_time: string | null
  custom_end_time:   string | null
  note:              string | null
}
```

### `SubmitSlot` (extended, in `useShiftRegistrationMutations.ts`)

```typescript
interface SubmitSlot {
  day_date:          string
  shift_template:    ShiftTemplate
  custom_start_time: string | null
  custom_end_time:   string | null
  note:              string | null
}
```

---

## Component Breakdown

### New: `AnnotationBottomSheet`

`src/components/shift-registration/AnnotationBottomSheet.tsx`

Handles both employee edit mode and admin/supervisor read-only inspect mode via the `readOnly` prop. Slides up from the bottom with a dark backdrop. Uses `input[type="time"]` for the time fields (native mobile time picker) with `min`/`max` attributes set to the shift window boundary.

### Modified: `SummaryBar`

Replaces the plain-text slot summary with a horizontally-scrollable chip strip. Each chip is tappable (opens `AnnotationBottomSheet`) with a separate `×` deselect button. Chip state and `AnnotationBottomSheet` open state are managed here.

Prop change: `selectedSlots: Set<string>` → `selectedSlots: Map<string, SlotAnnotation>`, plus new `onAnnotate` callback.

### Modified: `RegistrationCell`

Accepts `myAnnotation: SlotAnnotation | null` and `onInspect?: () => void`. Renders an tick icon (✓) on the current user's avatar when the slot is selected and has annotation data. When `isReadOnly && onInspect`, tap calls `onInspect` instead of no-op.

### Modified: `RegistrationGrid`

Threads the new `selectedSlots` Map and `onInspect` prop down to each `RegistrationCell`. Derives per-cell annotation presence for the tick icon (✓) on colleague avatars.

### Modified: `ShiftRegistrationPage`

State changes from `Set<string>` to `Map<string, SlotAnnotation>`. Adds `handleAnnotate`. Pre-fill hydration populates both key and annotation from the server response. Adds inspect handler for admin/supervisor cell taps.

---

## Out of Scope

- Enforcing reduced hours in payroll — annotations are notes only; they do not drive payroll calculation.
- Admin editing another employee's annotation — admins can only read annotations.
- Annotations on the current week's schedule (the existing `schedule_shifts` feature has its own `note` field).
- Annotation history or audit log.
