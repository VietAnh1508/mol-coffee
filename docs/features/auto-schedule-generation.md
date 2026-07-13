# Feature: Auto-Schedule Generation

## Overview

| Field            | Detail                   |
| ---------------- | ------------------------ |
| **Feature**      | Auto-Schedule Generation |
| **Epic**         | Staff Scheduling         |
| **Priority**     | High                     |
| **Target users** | Admin                    |

---

## User Story

**As an** admin,  
**I want to** click a button that converts this week's shift registrations into a finalised schedule,  
**So that** I no longer have to manually apply the scheduling rules and create each `schedule_shift` entry by hand.

---

## Background & Context

The shop uses `coffee-shift-scheduler.md` — a Claude skill that implements the scheduling algorithm as a multi-step interactive process. Once employees have registered their preferred shifts and the admin has locked the registration board, the admin currently runs the skill manually (step by step) and then creates each `schedule_shift` entry in the UI.

This feature automates that process: a single button runs the full algorithm and writes the resulting shifts to the database.

---

## Business Rules (sourced from `coffee-shift-scheduler.md`)

### Shop schedule

- Open Mon–Sat (T2–T7)
- Morning shift (Ca sáng): all days T2–T7, 06:00–12:00 VN
- Afternoon shift (Ca chiều): T2–T6 only, 12:00–18:00 VN
- Morning capacity: max **3** staff Mon–Fri, max **2** on Sat
- Afternoon capacity: exactly **1** staff

### Activities (maps to `activities` table)

| Skill role / task         | DB activity name |
| ------------------------- | ---------------- |
| Probation (Thử việc)      | `Thử việc`       |
| Manager (Quản lý)         | `Quản lý`        |
| Regular employee + coffee | `Cà phê`         |
| Regular employee + bread  | `Bánh mì`        |

Manager = DB role `admin`. Probation is user-specified at generation time (no stored field).

### Slot-limit cut algorithm (Steps 3a+3b)

Runs stateful across slots in fixed order: S2, S3, S4, S5, S6, S7, C2, C3, C4, C5, C6.

When a slot has more registrations than its limit, cut the employee with the highest score:

```
score(n) = remaining[n] × 1000 − cut_count[n] × 10 + ORDER.index(n)
```

- `remaining` = total shifts still assigned to the employee (decrements on each cut)
- `cut_count` = number of times this employee has already been cut
- `ORDER.index` = position in registration-order list (0 = first registered, later = cut first on tie)

This prioritises cutting the employee with the most remaining shifts; second, the one with the fewest prior cuts; third, the one who registered latest.

### Probation (TV) constraints (Steps 2a + 4)

- TV is removed from **all afternoon slots** before any other processing
- TV removals due to role constraints **do not** increment `cut_count`
- After slot-limit cuts, if a morning slot has **only TV** remaining → remove all TV from that slot

### Bread assignment (Step 5)

Bread requires ≥2 staff in the morning slot AND the slot is not exactly (1 TV + 1 regular).
One person per qualifying slot sells bread. Priority:

1. Regular employees (`chính thức`) in the slot who:
   - Were in the "didn't sell bread last week" list (auto-derived) **and** haven't sold bread yet this week → highest priority
   - Otherwise: haven't sold bread yet this week
   - Within each sub-group: fewest total shifts → earlier registration order
2. If all `chính thức` in the slot have already sold bread → pick fewest-shift chính thức for a second round (still before managers)
3. Managers sell bread only as absolute last resort (no `chính thức` in the slot at all)
4. TV **never** sells bread

---

## Algorithm Inputs & Sources

| Input               | Source                                                              | Notes                                                                                   |
| ------------------- | ------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Shift registrations | `shift_registrations` table (already loaded on page)                | Sorted by `registered_at` ASC → determines ORDER                                        |
| User roles          | `users` table (`allUsers` hook)                                     | `admin` → manager; `employee` → regular                                                 |
| Probation flags     | Admin-selected in pre-generation modal                              | Per-generation, not stored; shown as checkboxes over the registered employee list       |
| Activity IDs        | `activities` table (fetched inside mutation)                        | Looked up by name: `Cà phê`, `Bánh mì`, `Thử việc`, `Quản lý`                           |
| Last-week bread     | Previous week's `schedule_shifts` filtered by Bánh mì `activity_id` | Auto-derived inside mutation; shown in modal as read-only reference                     |
| Payroll lock state  | `payroll_periods` table                                             | Checked for both Monday and Saturday of the week; blocks generation if either is locked |

**Supervisors** are excluded from schedule generation entirely (they never appear as workers).

---

## Implementation Plan

### New files

| File                                                      | Purpose                                                   |
| --------------------------------------------------------- | --------------------------------------------------------- |
| `src/utils/autoSchedule.ts`                               | Pure function implementing the full algorithm             |
| `src/hooks/useAutoScheduleMutation.ts`                    | Fetches remote data, runs algorithm, writes to DB         |
| `src/components/shift-registration/AutoScheduleModal.tsx` | Pre-generation modal (probation selection + confirmation) |

### Modified files

| File                                               | Change                                                   |
| -------------------------------------------------- | -------------------------------------------------------- |
| `src/components/shift-registration/SummaryBar.tsx` | Add "Tạo lịch tự động" button (admin, locked board only) |
| `src/pages/ShiftRegistrationPage.tsx`              | Wire up modal state and mutation                         |

### `src/utils/autoSchedule.ts`

```typescript
interface AutoScheduleInput {
  registrations: ShiftRegistration[]; // ordered by registered_at
  users: User[];
  activities: Activity[];
  probationUserIds: Set<string>;
  lastWeekBreadUserIds: Set<string>; // auto-derived from previous week
}

interface GeneratedShift {
  user_id: string;
  activity_id: string;
  start_ts: string; // UTC ISO timestamp
  end_ts: string;
  template_name: ShiftTemplate;
  is_manual: false; // always false — allows safe bulk-replace
  note: null;
}

interface AutoScheduleResult {
  shifts: GeneratedShift[];
  adjustments: AdjustmentLog[]; // human-readable log of cuts / TV removals
}

function generateSchedule(input: AutoScheduleInput): AutoScheduleResult;
```

Steps executed in order:

1. Build `ORDER[]` from `registered_at` (earliest first)
2. Group registrations into slot map (`S2`…`S7`, `C2`…`C6`)
3. Step 2a — remove TV from afternoon slots
4. Step 3a+3b — apply slot limits (stateful cut loop in fixed slot order)
5. Step 4 — remove TV from morning slots where they'd be alone
6. Step 5 — assign bread + build final `GeneratedShift[]`

### `src/hooks/useAutoScheduleMutation.ts`

```typescript
mutationFn: async ({ registrations, users, probationUserIds }) => {
  // 1. Auth guard (admin only)
  // 2. Check payroll lock for weekStart (Monday) and weekStart+5 (Saturday)
  // 3. Fetch activities by name
  // 4. Fetch last week's schedule_shifts → extract Bánh mì user IDs
  // 5. Run generateSchedule(...)
  // 6. Delete existing is_manual=false shifts for the week
  //    (start_ts >= Monday 00:00 VN UTC, start_ts < Sunday 00:00 VN UTC)
  // 7. Bulk-insert new shifts
  // 8. Return { shiftCount, adjustments }
};
onSuccess: () => invalidate(['schedule-shifts']);
```

Re-generating replaces only `is_manual = false` shifts, so any manual corrections made after a prior auto-generation are preserved.

### `AutoScheduleModal`

- Bottom-sheet-style overlay, consistent with existing `AnnotationBottomSheet` pattern
- Shows registered employees list (derived from `registrations` prop, deduped by user)
- Each employee has a "Thử việc" toggle (probation checkbox)
- Shows last-week bread assignments as a read-only reference pill per employee (fetched inside mutation on submit)
- "Tạo lịch" button triggers mutation; shows spinner while pending
- On success: closes modal, toast "Đã tạo X ca làm việc"
- On error: shows error message inside modal

### SummaryBar change

Add a "Tạo lịch" button next to the Lock/Unlock button:

- Visible to admin only (`isAdmin` prop)
- Enabled only when `isLocked === true` (board must be locked first)
- Opens `AutoScheduleModal`

---

## Edge Cases & Decisions

| Scenario                                      | Handling                                                                            |
| --------------------------------------------- | ----------------------------------------------------------------------------------- |
| Activity name not found in DB                 | Throw error before any DB writes                                                    |
| Payroll period locked                         | Block generation, show error message                                                |
| No registrations for a slot                   | Slot is simply skipped (no shift created)                                           |
| All staff in a morning slot are TV            | Remove all TV; slot left empty                                                      |
| Re-generating after manual edits              | Manual shifts (`is_manual = true`) are preserved; only auto-generated ones replaced |
| Week spans two payroll months                 | Check lock for both the Monday and Saturday of the week                             |
| Supervisor registered (shouldn't happen, but) | Supervisor slots are filtered out — supervisors are excluded from generation        |

---

## Out of Scope (this iteration)

- Preview of generated schedule before confirming (show adjustments log in result toast instead)
- Partial re-generation (e.g., regenerate only one day)
- Storing probation status persistently on the user record
