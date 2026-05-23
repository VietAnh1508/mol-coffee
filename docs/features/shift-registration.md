# User Story: Shift Registration

## Overview

| Field            | Detail                           |
| ---------------- | -------------------------------- |
| **Feature**      | Shift Registration               |
| **Epic**         | Staff Scheduling                 |
| **Priority**     | High                             |
| **Target users** | All employees; Admin; Supervisor |

---

## User Story

**As an** employee,  
**I want to** see how many of my colleagues have already registered for each shift next week, and select multiple shifts I want to work in one go,  
**So that** I can make informed choices that naturally balance the workload across the week — without needing to message the admin privately.

---

## Background & Context

Currently, employees message the admin privately each weekend to register their preferred shifts for the following week. This creates two problems:

1. Employees have no visibility into what others have registered, leading to uneven distribution — many registrations mid-week, few on Mondays, Fridays, and weekends.
2. The admin must manually collect, reconcile, and enter shifts into the scheduling app.

This feature introduces a self-service shift registration screen inside the existing web app. It does **not** replace the admin's final scheduling step — it only captures employee preferences and makes them mutually visible, so employees can self-balance before the admin finalises the schedule.

> **Role summary for this feature:**
>
> - **Employee** — registers shifts, can update until the board is locked.
> - **Admin** (`admin` role) — views the full grid, can lock/unlock the board.
> - **Supervisor** (`supervisor` role) — views the full grid, read-only; cannot register or lock/unlock.

---

## Acceptance Criteria

### AC1 — Registration screen is accessible from the main app

- A "Đăng ký ca" (Register shifts) entry point is visible in the app navigation for all logged-in users (employees, admins, and supervisors).
- The screen always displays **next week only** (Monday–Sunday of the following week). There is no week navigation — the current week is not accessible here.
- The current logged-in user's name and initials are shown in the top-right as a pill/avatar.
- The week date range is displayed in the header (e.g. _"Tuần 26 tháng 5 – 1 tháng 6"_) so employees know exactly which week they are registering for.

> **Scope boundary:** This screen is strictly for registering preferred shifts for next week. Current-week shifts are managed in the existing Scheduling screen and are not shown here.

---

### AC2 — Weekly grid shows all shifts with live occupancy

- The grid has one row per day (Monday to Sunday) and two columns: **Ca sáng / Morning (06:00–12:00)** and **Ca chiều / Afternoon (12:00–18:00)**.
- Saturday and Sunday are visually separated from weekdays (e.g. a divider line).
- Each cell displays:
  - The avatar initials of employees who have registered for that slot, **in registration order** — the first employee to register appears first (leftmost), and subsequent registrations are appended to the right. This order is preserved on every load and never re-sorted.
  - A numeric count of registrations.
  - A heat color indicating occupancy level:

| Heat level | Threshold — Morning (cap 3) | Threshold — Afternoon (cap 1) | Background | Border    | Text      |
| ---------- | --------------------------- | ----------------------------- | ---------- | --------- | --------- |
| Empty      | 0                           | 0                             | `#F4F4F4`  | `#DCDCDC` | `#AAAAAA` |
| Light      | 1–2                         | —                             | `#D6F5EC`  | `#85D4BC` | `#1A6B57` |
| Fulfilled  | 3                           | 1                             | `#A8E6CF`  | `#3BAF87` | `#135E3F` |
| Busy       | 4–5                         | 2–3                           | `#FFE8C8`  | `#F5A623` | `#7A4500` |
| Crowded    | 6+                          | 4+                            | `#FADDE4`  | `#E8819A` | `#7D1F3A` |
| Selected   | —                           | —                             | `#EEEDFE`  | `#7F77DD` | `#3C3489` |

Additional visual rules for each state:

- **Fulfilled**: display a `✓` checkmark in the top-right corner of the cell, in color `#3BAF87`.
- **Selected**: display a filled purple dot (`●`) in the top-right corner of the cell, in color `#534AB7`. The selected style overrides the heat background — a fulfilled+selected cell shows the purple selected style, not the green fulfilled style.
- **Afternoon / Light**: afternoon shifts have no Light state — they go directly from Empty (0) to Fulfilled (1).

> Morning shifts have a cap of 3 employees. Afternoon shifts have a cap of 1.
> **No slots are blocked or disabled** regardless of occupancy — the heat color is informational only. Employees can register for any slot at any time.

---

### AC3 — Employee can select multiple shifts in one action

- Tapping a cell toggles it selected/deselected.
- A selected cell is visually distinct: purple background, purple border, and a filled purple dot indicator in the top-right corner of the cell.
- Multiple cells across different days and shift types can be selected simultaneously.
- To register a full day, the employee selects both the Ca sáng and Ca chiều cells of the same day — there is no separate "Full day" option.
- A summary bar at the bottom of the screen updates live as cells are selected, showing:
  - Total number of shifts selected (e.g. `3 ca đã chọn`)
  - A compact list of selected slots (e.g. `T2 Sáng · T3 Chiều · T6 Sáng`)
- **Admins and supervisors cannot tap cells** — the grid is read-only for them.

---

### AC4 — Employee submits their registration in one tap

- The summary bar contains a **Đăng ký** (Submit) button, enabled as soon as at least one cell is selected.
- Tapping Submit saves all selected shifts as the employee's registration for the week.
- On success:
  - A confirmation toast is shown (e.g. _"Đăng ký ca thành công"_).
  - The grid refreshes to reflect the employee's registrations alongside others.
  - The employee's own selections are shown with their initials in the relevant cells.
- On failure (network error, etc.):
  - An error toast is shown with an option to retry.
  - No partial saves occur — registration is all-or-nothing per submission.

---

### AC5 — Employee can update their registration until the board is locked

- If the employee has already registered, the screen opens with their existing selections pre-highlighted.
- They can add or remove shifts and resubmit at any time while the board is **unlocked**.
- Resubmitting performs a **selective update**: rows for newly selected slots are inserted (with a fresh registration timestamp), and rows for deselected slots are deleted. Slots that were already registered and remain selected are **unchanged** — their original registration timestamp and position in the avatar order are preserved. This ensures the avatar display order (AC2) is not disturbed by an update.
- When the board is **locked** by the admin:
  - The grid becomes read-only for all employees — cells are not tappable and the Submit button is hidden.
  - A visible banner is shown on the registration screen informing employees that the board has been locked, e.g. _"Admin đã khoá đăng ký ca tuần này. Liên hệ trực tiếp với admin để thay đổi."_
  - Employees who want to change their shifts after the lock must contact the admin directly; the admin then updates the final schedule manually.

---

### AC6 — Admin can lock and unlock the registration board

- The admin has a dedicated **Khoá đăng ký** (Lock board) button, visible **only to accounts with the `admin` role**.
- Tapping **Khoá đăng ký** immediately sets the board to read-only for all employees.
- While the board is locked, the button changes to **Mở khoá** (Unlock board), allowing the admin to reopen registrations if needed (e.g. not enough coverage).
- The lock/unlock state is per-week — locking week N does not affect week N+1.
- Both admins and supervisors can view the full registration grid at all times regardless of lock state.

---

### AC9 — Admin can copy the week's registrations as plain text

- A **Copy** button is visible in the summary bar **only to accounts with the `admin` role**, and only when at least one registration exists for the week.
- Tapping **Copy** writes a compact text summary to the clipboard, grouped by employee, for easy sharing via chat (e.g. Zalo).
- Employees are listed in the order they first registered (earliest `registered_at` first).
- Each employee's shifts are sorted chronologically (earlier days first; morning before afternoon on the same day) and abbreviated as `s` (sáng) or `c` (chiều) followed by the Vietnamese day number (T**2**–T**7**).
- Example output:
  ```
  Kiệt: s2, c3
  Tâm: s3, s4, s5, c6
  ```
- After copying, the button label briefly changes to **✓ Đã copy** for 2 seconds as visual confirmation.
- Employees and supervisors do not see this button.

---

### AC8 — Employee can annotate a shift with custom hours and a note

- After selecting a shift cell, the slot appears as a chip in the summary bar at the bottom of the screen.
- Tapping the chip body opens an **annotation bottom sheet** for that slot, allowing the employee to optionally set:
  - **Giờ đến** (arrival time) — pre-filled with the shift's default start time (06:00 for morning, 12:00 for afternoon); clamped to within the shift window.
  - **Giờ về** (departure time) — pre-filled with the shift's default end time (12:00 for morning, 18:00 for afternoon); clamped to within the shift window.
  - **Ghi chú** — free-text note (max 200 characters), e.g. _"Đến muộn do xe hỏng"_.
- Giờ về must be after Giờ đến; an inline Vietnamese error is shown if the constraint is violated and the **Lưu** button is disabled until resolved.
- Tapping **Lưu** closes the sheet and saves the annotation in local state; tapping **Xoá ghi chú** clears any annotation for that slot.
- If a slot has any custom hours or note, the chip shows a clock indicator (⏱) before the slot label, and a small tick icon (✓) appears on the employee's avatar in that grid cell.
- The annotation is submitted together with the slot selection in the same **Đăng ký** action — no separate save step.
- On reload, existing annotations are pre-filled back into the chips alongside the pre-selected slots.
- **Admins and supervisors** can tap any cell to open the bottom sheet in **read-only inspect mode**, which lists all registered users for that slot along with their custom hours and notes. No editing is possible from this view.
- When the board is locked, employees cannot open or edit annotations; the inspect mode for admin/supervisor still works.

> Annotations are informational — they do not restrict which shifts an employee can register for, nor do they affect the heat level or avatar display order in the grid.

---

### AC7 — Legend is always visible

- A compact legend row is displayed below the header, showing all five heat states plus the Selected indicator with labels: **Trống, Nhẹ, Đủ, Đông, Quá đông, Đã chọn**.
- Each legend item displays a color swatch using the exact background color defined in AC2.
- The legend is static and always visible (not collapsible) to orient new users quickly.

---

## Technical Alignment

These notes orient implementers within the existing project. Full schema details belong in `docs/DATABASE.md` and the migration files.

**Route:** `/shift-registration` (nested under `_authenticated/`, file `shift-registration.tsx`).

**New DB tables required:**

- `shift_registrations` — one row per (user, week_start_date, shift_template). Must record `registered_at` to preserve insertion order for avatar display. Week boundaries must be computed with `VN_TIMEZONE_OFFSET_MINUTES` (matching the pattern used in payroll). Includes optional annotation columns: `custom_start_time TIME`, `custom_end_time TIME`, `note TEXT` (see `docs/features/shift-registration-annotations.md`).
- `shift_registration_boards` — one row per week_start_date storing lock state (`is_locked`, `locked_by`, `locked_at`). Follows the same per-period lock pattern as `payroll_periods`.

**Hook naming convention:**

- `useShiftRegistrations(weekStart)` — query hook returning registrations for the week.
- `useShiftRegistrationBoard(weekStart)` — query hook returning lock state.
- `useShiftRegistrationMutations()` — mutation hook with `submit` and `toggleLock` methods.

**RLS:** Employees may INSERT/DELETE their own rows; all authenticated users may SELECT. Only `admin` role may update `shift_registration_boards`. Supervisor role follows the existing read-only pattern (`SELECT` only on all tables).

**Migration:** Create as `YYYYMMDDHHMMSS_shift_registration.sql`.

---

## Out of Scope (for this story)

- Automatic shift allocation or scheduling logic.
- Syncing registered shifts into the existing `schedule_shifts` scheduling feature (to be considered in a follow-up story).
- Admin editing or overriding individual employee registrations directly in the grid (changes after lock go through the final schedule, not the registration board).
- Push notifications or reminders to employees.
- Historical view of past weeks' registrations.
- Payroll integration.

---

## UI Reference

The following screens were designed and approved during the discovery phase:

- **Registration grid** — weekly 7×2 grid with heat colors, avatar dots, and multi-select tap interaction.
- **Summary bar** — sticky bottom bar showing selected count, slot labels, and Submit CTA.

> Figma / design file link: _(to be added)_

---

## Definition of Done

- [ ] All 9 acceptance criteria are implemented and verified on mobile (iOS and Android) and desktop browsers.
- [ ] Grid data loads within 2 seconds on a standard mobile connection.
- [ ] The feature is covered by unit tests (cell selection logic, submit flow, lock/unlock state, resubmit-preserves-order) and at least one end-to-end test (full registration journey, and admin lock flow).
- [ ] The locked-board banner is shown correctly to employees when the admin locks the board.
- [ ] The Lock / Unlock button is visible only to `admin` role accounts — not to employees or supervisors.
- [ ] Supervisors see the full grid read-only with no registration controls.
- [ ] `docs/DATABASE.md` is updated with the new tables.
- [ ] The UI matches the approved design reference.
- [ ] The feature has been reviewed and signed off by the admin (product owner).
