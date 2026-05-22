# Progress: Shift Registration Annotations

**Spec:** [shift-registration-annotations.md](./shift-registration-annotations.md)
**Status:** Complete
**Last updated:** 2026-05-22

---

## Database

- [x] Migration `supabase/migrations/20260521000000_shift_registration_annotations.sql`
  - [x] Add `custom_start_time TIME` (nullable)
  - [x] Add `custom_end_time TIME` (nullable)
  - [x] Add `note TEXT` (nullable)
  - [x] Add `chk_custom_time_order` constraint
  - [x] Add `chk_morning_window` constraint
  - [x] Add `chk_afternoon_window` constraint
- [x] Update `submit_shift_registrations` RPC: `ON CONFLICT DO NOTHING` → `ON CONFLICT DO UPDATE` (annotation fields + `updated_at`; preserve `registered_at`)
- [x] Extend `check_shift_registration_board_lock` trigger to fire on `BEFORE UPDATE`
- [x] Update `docs/DATABASE.md`

## TypeScript Types

- [x] Add `SlotAnnotation` interface to `src/types/index.ts`
- [x] Extend `ShiftRegistration` with `custom_start_time`, `custom_end_time`, `note`
- [x] Extend `SubmitSlot` in `useShiftRegistrationMutations.ts`

## Components

### New: `AnnotationBottomSheet` (`src/components/shift-registration/AnnotationBottomSheet.tsx`)
- [x] Slide-up bottom sheet with dark backdrop
- [x] Header: slot label + shift window
- [x] **Giờ đến** `<input type="time">` — default = shift start, `min`/`max` = shift window
- [x] **Giờ về** `<input type="time">` — default = shift end, `min`/`max` = shift window
- [x] **Ghi chú** `<textarea>` — max 200 chars, placeholder text
- [x] Inline validation: Giờ về ≤ Giờ đến → show error, disable Lưu
- [x] **Lưu** button — stores annotation in local state, closes sheet
- [x] **Xoá ghi chú** button — resets annotation fields to defaults
- [x] `readOnly` prop: admin/supervisor inspect mode
  - [x] Shows list of registered users (avatar + name + custom hours + note)
  - [x] No edit controls; close button only

### Modified: `SummaryBar`
- [x] Replace plain-text slot summary with horizontally-scrollable chip strip
- [x] Each chip tappable → opens `AnnotationBottomSheet`
- [x] Chip has separate `×` deselect button
- [x] Annotated chip shows clock indicator (⏱) before slot label
- [x] Prop: `selectedSlots: Set<string>` → `Map<string, SlotAnnotation>`
- [x] Add `onSaveAnnotation` / `onClearAnnotation` / `onDeselect` callback props

### Modified: `RegistrationCell`
- [x] Accept `myAnnotation: SlotAnnotation | null` prop
- [x] Accept `onInspect?: () => void` prop
- [x] Render ✓ tick on avatar when annotated (current user uses local state; others use server data)
- [x] When `isReadOnly && onInspect`, tap calls `onInspect` instead of no-op

### Modified: `RegistrationGrid`
- [x] Thread `selectedSlots` Map and `onInspect` down to `RegistrationCell`
- [x] Derive per-cell annotation presence for tick icon on colleague avatars

### Modified: `ShiftRegistrationPage`
- [x] State: `Set<string>` → `Map<string, SlotAnnotation>`
- [x] Add `handleSaveAnnotation` / `handleClearAnnotation` / `handleDeselect` handlers
- [x] Pre-fill hydration: populate annotation from server response alongside slot key (normalises `HH:MM:SS` → `HH:MM`)
- [x] Add inspect handler for admin/supervisor cell taps
- [x] Locked board: employees cannot open annotation sheets (cells not tappable)

## Behaviour

- [x] Deselecting a slot (chip × or re-tap cell) discards its annotation
- [x] Reloading pre-fills annotations from existing registrations
- [x] Annotations preserved across resubmits when slot remains selected
- [x] Locked board: admin/supervisor inspect still works; employees cannot edit

## Testing & Wrap-up

- [x] Run `pnpm typecheck` with no errors
- [x] Run `pnpm lint` with no errors
- [ ] Manual smoke test: employee annotate → submit → reload → verify pre-fill
- [ ] Manual smoke test: admin inspect mode on annotated slot
- [ ] Manual smoke test: locked board (employee blocked, admin can inspect)
- [ ] Update `docs/PROGRESS.md` to list this feature as complete
