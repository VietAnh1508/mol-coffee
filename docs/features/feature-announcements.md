# Feature Announcement Banner

## Overview

When a major feature ships, there's no in-app mechanism to notify existing users. This feature adds a dismissable banner on the `DashboardPage` that surfaces one unacknowledged feature announcement at a time. Dismissal is stored per-user in the DB so the banner never reappears for that user.

---

## Design Decisions

**Feature definitions live in code, not the DB.** A TypeScript constants array controls what features exist and when they appear (`src/constants/featureAnnouncements.ts`). The DB only records which users dismissed which feature keys. This avoids needing an admin UI and matches the existing `shortcuts` array pattern in `DashboardPage.tsx`.

**Row existence = acknowledged.** No boolean column needed — the presence of a `(user_id, feature_key)` row means "seen." A `UNIQUE` constraint enforces this and guards against double-inserts.

**Show one banner at a time.** Only the first unacknowledged feature (by array order) is displayed. Stacking banners adds layout complexity without meaningful benefit given the coffee shop release cadence.

**Optimistic dismiss.** The banner disappears immediately on user action; the DB insert fires in the background. On error the banner reappears on next visit. This avoids blocking the UI on a network round-trip.

---

## Database Schema

**Table:** `feature_acknowledgments`

| Column            | Type                  | Notes                                       |
| ----------------- | --------------------- | ------------------------------------------- |
| `id`              | UUID PK               | `gen_random_uuid()`                         |
| `user_id`         | UUID FK → `users(id)` | `ON DELETE CASCADE`                         |
| `feature_key`     | TEXT                  | Immutable slug matching the constants array |
| `acknowledged_at` | TIMESTAMPTZ           | When the user dismissed the banner          |
| `created_at`      | TIMESTAMPTZ           | Auto-set                                    |
| `updated_at`      | TIMESTAMPTZ           | Auto-updated via trigger                    |

**Unique constraint:** `(user_id, feature_key)`

**RLS policies:**

- `SELECT`: `user_id = get_user_by_auth_id(auth.uid())`
- `INSERT`: `user_id = get_user_by_auth_id(auth.uid())`
- No UPDATE or DELETE — acknowledgment is permanent

> **Note:** RLS must use `get_user_by_auth_id(auth.uid())` (not raw `auth.uid()`) because `user_id` references `public.users(id)` (the internal UUID), not the Supabase auth UUID. This is the established pattern across all user-scoped tables.

---

## Implementation

### Files to Create

**`supabase/migrations/20260524000000_add_feature_acknowledgments.sql`**
Table DDL, index, updated_at trigger, RLS enable + policies.

**`src/constants/featureAnnouncements.ts`**

Defines the `FeatureAnnouncement` interface and exports the `FEATURE_ANNOUNCEMENTS` array:

```ts
export interface FeatureAnnouncement {
  key: string // IMMUTABLE — never rename or recycle
  title: string // Vietnamese
  description: string // Vietnamese
  to: string // TanStack Router route path
  icon: IconType
  iconBg: string // Tailwind bg class
}
```

> **Key contract:** `key` values are written to the DB. Once used, a key must never be renamed or recycled — even if the feature is removed from the array. Removing an entry is safe; renaming its key is not.

**`src/hooks/useFeatureAcknowledgments.ts`**

Three exports:

- `useFeatureAcknowledgments(userId: string | null)` — fetches `feature_key` values for the user, returns `Set<string>`. `enabled: !!userId`.
- `useNextUnacknowledgedFeature(userId: string | null)` — wraps the query above, returns the first `FeatureAnnouncement` whose key is not in the set, or `null` (also null during load to prevent flash).
- `useAcknowledgeFeature(userId: string)` — mutation that inserts `{ user_id, feature_key }`. Optimistically adds key to cache on `onMutate`, rolls back on `onError`, invalidates query on `onSuccess`.

**`src/components/FeatureAnnouncementBanner.tsx`**

Props: `{ feature: FeatureAnnouncement, onDismiss: () => void, onNavigate: () => void }`

- Blue accent (`border-blue-400/40 bg-blue-500/10`) — distinguishes from amber warning banners
- Left: feature icon in a `bg-{iconBg}` rounded square (matches shortcut card style)
- Right: X dismiss button (`aria-label="Đóng thông báo"`), disabled while mutation is pending
- Whole card is a button → calls `onNavigate`; X uses `e.stopPropagation()` → calls `onDismiss`

### Files to Modify

**`src/types/index.ts`** — add `FeatureAcknowledgment` interface

**`src/pages/DashboardPage.tsx`** — insert between `<header>` and shortcut grid:

```tsx
{
  nextFeature && (
    <FeatureAnnouncementBanner
      feature={nextFeature}
      onDismiss={() => acknowledgeFeature.mutate(nextFeature.key)}
      onNavigate={() => {
        acknowledgeFeature.mutate(nextFeature.key)
        router.navigate({ to: nextFeature.to })
      }}
    />
  )
}
```

---

## Implementation Order

1. SQL migration
2. `FeatureAcknowledgment` type in `src/types/index.ts`
3. `src/constants/featureAnnouncements.ts`
4. `src/hooks/useFeatureAcknowledgments.ts`
5. `src/components/FeatureAnnouncementBanner.tsx`
6. `src/pages/DashboardPage.tsx` integration

---

## Adding a New Announcement

1. Append a new entry to `FEATURE_ANNOUNCEMENTS` in `src/constants/featureAnnouncements.ts` with a new, unique `key`
2. Deploy — the banner will appear for all users who have not yet dismissed it
3. Users who dismissed a previous feature are unaffected (their row only covers the old key)

Do **not** modify or reuse existing keys.

---

## Verification

1. `pnpm build` — no type errors
2. Dev server: log in → banner appears for the first entry in `FEATURE_ANNOUNCEMENTS`
3. Click X → banner disappears immediately (optimistic), does not return on refresh
4. Log in as a different user → banner appears again (acknowledgment is per-user)
5. Click the banner card → navigates to the feature route, banner does not reappear
6. Supabase: `SELECT * FROM feature_acknowledgments` shows one row per dismiss action
