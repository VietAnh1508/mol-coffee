# Avatar Upload — Implementation Plan

_Issue: #7 | Status: Planned_

## Overview

Users can upload a profile photo from the Profile page. Wherever the app currently shows an initials placeholder, it displays the uploaded image instead and falls back to initials when no avatar is set.

---

## Affected Areas

| Area                        | File(s)                                                       |
| --------------------------- | ------------------------------------------------------------- |
| Database migration          | `supabase/migrations/<timestamp>_add_avatar_url.sql`          |
| Type definition             | `src/types/index.ts`                                          |
| New shared component        | `src/components/UserAvatar.tsx`                               |
| Upload/remove mutations     | `src/hooks/useAvatarMutation.ts`                              |
| Profile page                | `src/pages/ProfilePage.tsx`                                   |
| App layout (nav badge)      | `src/components/Layout.tsx`                                   |
| Shift registration calendar | `src/components/shift-registration/RegistrationCell.tsx`      |
| Shift annotation sheet      | `src/components/shift-registration/AnnotationBottomSheet.tsx` |
| Auth context                | `src/context/AuthContext.tsx` (or equivalent)                 |
| Docs                        | `docs/DATABASE.md`, this file                                 |

---

## Implementation Steps

### 1. Database Migration

File: `supabase/migrations/<timestamp>_add_avatar_url.sql`

- Add `avatar_url TEXT` column (nullable) to `public.users`.
- Create a `avatars` Supabase Storage bucket (public reads so avatar URLs are plain CDN links).
- Add Storage RLS policies:
  - Users can `INSERT`/`UPDATE`/`DELETE` only their own file at path `{auth_user_id}/avatar`.
  - All authenticated users can `SELECT` (read) any avatar object.

Write the migration idempotently (`ALTER TABLE … ADD COLUMN IF NOT EXISTS`, `DROP POLICY IF EXISTS` before each `CREATE POLICY`).

### 2. Type Update

`src/types/index.ts`:

- Add `avatar_url?: string | null` to the `User` interface.
- Update the `ShiftRegistration.user` Pick from `Pick<User, 'id' | 'name'>` to `Pick<User, 'id' | 'name' | 'avatar_url'>` so the calendar views can display avatars.

### 3. New `UserAvatar` Component

Create `src/components/UserAvatar.tsx`:

- **Props:** `name: string`, `avatarUrl?: string | null`, `size?: 'sm' | 'md' | 'lg'`, optional `userId?: string` (for deterministic fallback color), optional `className`.
- **Render logic:**
  - When `avatarUrl` is set: render `<img src={avatarUrl} … className="rounded-full object-cover" />` with an `onError` handler that switches to the initials fallback.
  - Fallback: initials `<div>` using existing `getInitials(name)` from `src/utils/nameUtils.ts`; background color via `avatarColor(userId)` from `src/utils/shiftRegistrationUtils.ts` when a `userId` is provided, otherwise a neutral muted color.
- **Size map:** `sm` = `h-8 w-8 text-xs`, `md` = `h-12 w-12 text-sm`, `lg` = `h-24 w-24 text-xl`.

This component replaces every current avatar/initials rendering site.

### 4. Upload / Remove Mutation Hook

Create `src/hooks/useAvatarMutation.ts`:

**`useUploadAvatar()`**

1. Client-side validation: accept JPEG, PNG, WebP only; reject files > 2 MB (show Vietnamese error toast).
2. Upload file to Supabase Storage at path `{userId}/avatar` (upsert to overwrite existing).
3. Retrieve the public URL from the bucket.
4. `UPDATE public.users SET avatar_url = <url> WHERE id = <userId>`.
5. Invalidate the user query so `useAuth` re-fetches and all avatar displays update.

**`useRemoveAvatar()`**

1. Delete the object from Storage at `{userId}/avatar`.
2. `UPDATE public.users SET avatar_url = NULL WHERE id = <userId>`.
3. Invalidate the user query.

### 5. ProfilePage

`src/pages/ProfilePage.tsx`:

- Replace the static `HiUser` placeholder with `<UserAvatar size="lg" name={user.name} avatarUrl={user.avatar_url} />`.
- Overlay a camera icon button on the avatar (always visible, outside of the name/phone edit mode).
- A hidden `<input type="file" accept="image/jpeg,image/png,image/webp" />` triggered by the camera button.
- Show a "Xóa ảnh" (remove) link/button only when `user.avatar_url` is set.
- Show a spinner overlay on the avatar while upload is in progress.

### 6. Layout (Nav Badge)

`src/components/Layout.tsx`:

- Replace the `HiUser` icon (currently line 65) with `<UserAvatar size="sm" name={user.name} avatarUrl={user.avatar_url} />`.

### 7. Shift Registration Views

Both components already receive `r.user?.name`. Once `avatar_url` is included in the `ShiftRegistration.user` Pick (step 2) and the Supabase query fetches it:

- `RegistrationCell.tsx`: replace the inline initials `<div>` with `<UserAvatar size="sm" name={r.user?.name} avatarUrl={r.user?.avatar_url} userId={r.user_id} />`. Keep passing `userId` so the deterministic `avatarColor` background still applies on the initials fallback.
- `AnnotationBottomSheet.tsx`: same substitution.

> **Verify:** Confirm the query that fetches `ShiftRegistration` rows JOINs `public.users` (not `auth.users`) so `avatar_url` is available in the result.

### 8. Auth Context

Ensure the auth context reads `avatar_url` when it queries `public.users` for the current user profile, so `user.avatar_url` is populated wherever `useAuth()` is called.

### 9. Docs

- `docs/DATABASE.md` — document the `avatar_url` column under the `users` table, and the `avatars` Storage bucket with its RLS policies.
- This file — update status from `Planned` to `Complete` when done.

---

## Constraints & Decisions

| Topic                     | Decision                                                                                                                      |
| ------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| Storage bucket visibility | **Public** — avatar URLs are plain CDN links; no signed URL overhead on every render                                          |
| Storage path              | `{auth_user_id}/avatar` (no extension) — one slot per user, overwrite on re-upload                                            |
| File limits               | JPEG, PNG, WebP; max 2 MB; validated client-side before upload                                                                |
| Fallback color            | `avatarColor(userId)` (deterministic hash) kept as background for initials; neutral muted color when no `userId` is available |
| Edit mode coupling        | Avatar upload is independent of the name/phone edit mode on the Profile page                                                  |

---

## Acceptance Criteria (from Issue #7)

- [ ] User can upload an avatar image from the Profile page
- [ ] Uploaded avatar is displayed on the Profile page immediately after upload
- [ ] All initials placeholders across the app are replaced with the user's avatar when one exists
- [ ] Initials fallback is shown when no avatar is uploaded
- [ ] Removing the avatar reverts to the initials fallback
- [ ] File-size and format validation prevents invalid uploads
- [ ] RLS prevents users from accessing other users' avatars in Storage
- [ ] Mobile layout handles the upload interaction correctly
