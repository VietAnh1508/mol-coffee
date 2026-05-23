# Admin Export: Shift Registration Clipboard Copy

## Context

Admins need a quick way to share the week's shift schedule with employees (e.g., via Zalo/chat). The current UI shows a visual grid but offers no way to extract a text summary. This feature adds a single **Copy** button visible only to admins in the `SummaryBar`, which formats all registrations as a compact, human-readable text and copies it to the clipboard.

---

## Abbreviation Rules

| Shift template | Prefix      |
| -------------- | ----------- |
| morning        | `s` (sáng)  |
| afternoon      | `c` (chiều) |

Day of week number matches the Vietnamese label: T**2** = Monday, T**3** = Tuesday … T**7** = Saturday.

Derivation: `new Date(day_date + "T00:00:00").getDay()` returns 1 for Monday → add 1 → `2`. Works for Mon–Sat (the shop's 6-day grid).

**Example output:**

```
Kiệt: s2, c3
Tâm: s3, s4, s5, c6
```

---

## Data Flow

### Current SummaryBar props

`SummaryBar` currently only receives `selectedSlots: Map<string, SlotAnnotation>` (the current employee's own selections). It does **not** receive the full `registrations: ShiftRegistration[]` array.

### What admin export needs

The `registrations` array in `ShiftRegistrationPage.tsx` contains **all employees' registrations** for the week, each with `user?.name`, `day_date`, and `shift_template`. This is already fetched by `useShiftRegistrations(weekStart)`.

---

## Implementation Plan

### 1. New utility function — `src/utils/shiftRegistrationUtils.ts`

Add `buildExportText(registrations: ShiftRegistration[]): string`:

```ts
function abbreviateSlot(reg: ShiftRegistration): string {
  const date = new Date(reg.day_date + "T00:00:00");
  const dayNum = date.getDay() + 1; // Mon=1→2, Tue=2→3, ..., Sat=6→7
  const prefix = reg.shift_template === "morning" ? "s" : "c";
  return `${prefix}${dayNum}`;
}

export function buildExportText(registrations: ShiftRegistration[]): string {
  // Group by user_id (not name) to avoid collisions when two employees share a name
  const byUserId = new Map<string, ShiftRegistration[]>();
  for (const reg of registrations) {
    if (!byUserId.has(reg.user_id)) byUserId.set(reg.user_id, []);
    byUserId.get(reg.user_id)!.push(reg);
  }

  // Sort employees by earliest registered_at across their slots (first registered appears first)
  return [...byUserId.values()]
    .sort((a, b) => {
      const firstA = a.reduce(
        (min, r) => (r.registered_at < min ? r.registered_at : min),
        a[0].registered_at,
      );
      const firstB = b.reduce(
        (min, r) => (r.registered_at < min ? r.registered_at : min),
        b[0].registered_at,
      );
      return firstA.localeCompare(firstB);
    })
    .map((regs) => {
      const name = regs[0].user?.name ?? regs[0].user_id;
      const sorted = [...regs].sort((a, b) => {
        if (a.day_date !== b.day_date)
          return a.day_date.localeCompare(b.day_date);
        if (a.shift_template === b.shift_template) return 0;
        return a.shift_template === "morning" ? -1 : 1;
      });
      return `${name}: ${sorted.map(abbreviateSlot).join(", ")}`;
    })
    .join("\n");
}
```

### 2. New prop on SummaryBar — `src/components/shift-registration/SummaryBar.tsx`

Add optional prop:

```ts
allRegistrations?: ShiftRegistration[];
```

Add a **Copy** button rendered when `isAdmin && allRegistrations && allRegistrations.length > 0`:

```tsx
{
  isAdmin && allRegistrations && allRegistrations.length > 0 && (
    <button
      type="button"
      onClick={async () => {
        const text = buildExportText(allRegistrations);
        await navigator.clipboard.writeText(text);
        // brief visual feedback (optional toast or button label swap)
      }}
      className="shrink-0 rounded-lg border border-subtle px-3 py-2 text-xs font-medium text-primary"
    >
      Copy
    </button>
  );
}
```

Use a local `copied` state (boolean, auto-resets after 2 s) to swap label to "✓ Đã copy" for feedback, avoiding a toast dependency.

### 3. Pass prop from page — `src/pages/ShiftRegistrationPage.tsx`

Find the `<SummaryBar ... />` render call and add:

```tsx
allRegistrations = { registrations };
```

`registrations` is already in scope from `useShiftRegistrations(weekStart).data`.

---

## Files to Modify

| File                                               | Change                                    |
| -------------------------------------------------- | ----------------------------------------- |
| `src/utils/shiftRegistrationUtils.ts`              | Add `buildExportText` helper              |
| `src/components/shift-registration/SummaryBar.tsx` | Add `allRegistrations` prop + Copy button |
| `src/pages/ShiftRegistrationPage.tsx`              | Pass `registrations` to `SummaryBar`      |

---

## Verification

1. Log in as admin, navigate to shift registration for a week that has registrations.
2. Tap/click **Copy** — button label should briefly change to "✓ Đã copy".
3. Paste into a text editor and verify:
   - Employees are sorted alphabetically.
   - Slots are sorted by day then morning-before-afternoon.
   - Abbreviations match: Monday morning = `s2`, Tuesday afternoon = `c3`, etc.
4. Verify the Copy button is **not visible** for employee or supervisor roles.
5. Verify the Copy button is **not visible** when there are no registrations for the week.
