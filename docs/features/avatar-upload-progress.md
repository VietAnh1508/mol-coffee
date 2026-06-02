# Avatar Upload — Progress

_Issue: #7 | Plan: [avatar-upload-plan.md](./avatar-upload-plan.md)_

## Status

| Step | Area                                                                   | Status                                                                     |
| ---- | ---------------------------------------------------------------------- | -------------------------------------------------------------------------- |
| 1    | Database migration (`avatar_url` column + `avatars` bucket + RLS)      | ✅ Done                                                                    |
| 2    | Type update (`User` interface + `ShiftRegistration.user` Pick)         | ✅ Done                                                                    |
| 3    | New `UserAvatar` component                                             | ✅ Done                                                                    |
| 4    | Upload / remove mutation hook                                          | ✅ Done                                                                    |
| 5    | ProfilePage — upload UI                                                | ✅ Done                                                                    |
| 6    | Layout — nav badge                                                     | ✅ Done                                                                    |
| 7    | Shift registration views (`RegistrationCell`, `AnnotationBottomSheet`) | ✅ Done                                                                    |
| 8    | Auth context — expose `avatar_url`                                     | ✅ Done — `useUserProfile` selects `*`, column flows through automatically |
| 9    | Docs (`DATABASE.md`, plan status)                                      | ⏳ Pending                                                                 |

## Notes

- Storage bucket is **public** — read access bypasses RLS intentionally so colleagues' avatars render in the shift calendar. Write policies are scoped to the owner's `auth.uid()`.
- Storage path: `{auth_user_id}/avatar` (auth uid, not PK) — required for the `auth.uid()` RLS check on upload.
- Cache-buster (`?v=<timestamp>`) appended to the public URL on each upload so the browser re-fetches despite the stable path.
- `useShiftRegistrations` updated to `select("*, user:users(id, name, avatar_url)")` so calendar views receive avatar URLs.
