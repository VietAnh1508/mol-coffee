# Investigation: Mobile shows Vercel 404 after leaving app idle

## Observed Symptom

Users who leave the app open in a mobile browser and return after a new deployment
see a full **Vercel 404: NOT_FOUND** page instead of the app. A manual refresh recovers.

This is a server-level 404 — Vercel's edge network returns it before React runs.
It is distinct from the "Failed to fetch dynamically imported module" JS error that
happens _inside_ a loaded app.

## Root Cause

Two failure modes stack on top of each other. The first (navigation-level) is the
primary cause of the Vercel 404 page. The second (chunk-level) would remain after
fixing the first.

### Failure mode 1 — Navigation-level 404 (primary, causes the visible error)

The app has no `vercel.json`. For a Vite SPA, Vercel does not automatically add
catch-all rewrite rules; it only serves files that exist in `dist/`. Any URL other
than `/` has no matching file, so Vercel returns 404.

Under normal conditions the PWA service worker (via `vite-plugin-pwa`'s
`navigateFallback`) intercepts navigation requests and serves the cached
`index.html`, masking the missing rewrite. The 404 surfaces when the SW is
bypassed — exactly what happens on mobile when:

1. The browser discards a background tab from memory.
2. A new deployment lands (new SW waiting, old SW no longer controlling the page).
3. The user returns; the browser makes a fresh HTTP GET to the last path
   (e.g. `/schedule`).
4. The new SW has not yet claimed the client → raw request reaches Vercel → 404.

### Failure mode 2 — Stale chunk 404 (secondary, JS-level crash)

Vite builds JS with content-hashed chunk filenames (e.g. `employees-CAQ37Tud.js`).
After a new deployment those hashes change. If `index.html` loads successfully but
the old SW serves a stale version referencing old chunk URLs:

1. React lazy-loads a route chunk → requests the old URL.
2. Old URL is gone from the CDN → Vercel returns 404 for the asset.
3. Vite fires a `vite:preloadError` event on `window`.
4. No handler exists → unhandled error → white screen or app crash.

The current PWA config (`registerType: "autoUpdate"` without
`cleanupOutdatedCaches`) means old precache entries are not purged after a
deployment, so the old SW may continue serving stale cached chunk URLs.

Note: `skipWaiting` and `clientsClaim` are already forced to `true` by
`registerType: "autoUpdate"` in vite-plugin-pwa ≥ 0.12.2 — no explicit config
needed for those.

## Fix

Apply in this order — layer 1 fixes the visible Vercel 404; layers 2–4 harden
against the stale-chunk crash that would remain after layer 1.

### Layer 1 — `vercel.json` SPA catch-all rewrite _(primary fix)_

Create `vercel.json` at the project root:

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

With this in place Vercel serves `index.html` for every path regardless of SW
state. If chunks are stale, the page loads and the JS-level fixes below take over.

### Layer 2 — `src/main.tsx` — Global preload error handler

Vite fires `vite:preloadError` when a dynamic import fails. Reload on this event
to fetch the new `index.html` and correct chunk URLs.

```ts
window.addEventListener("vite:preloadError", () => {
  window.location.reload();
});
```

Add before `createRoot(...)`.

### Layer 3 — `vite.config.ts` — Harden the PWA service worker

```ts
workbox: {
  globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
  cleanupOutdatedCaches: true,  // purge caches from old SW versions
},
```

`clientsClaim` and `skipWaiting` are already `true` via `registerType:
"autoUpdate"` (vite-plugin-pwa ≥ 0.12.2) and do not need to be set explicitly.

### Layer 4 — `src/routes/__root.tsx` — Root error boundary (UX fallback)

Catches any uncaught React render error that slips past layer 2, and gives the
user a clear reload CTA:

```tsx
export const Route = createRootRoute({
  component: RootComponent,
  errorComponent: () => (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6 text-center">
      <p className="text-gray-600">Đã xảy ra lỗi. Vui lòng tải lại trang.</p>
      <button
        className="px-4 py-2 bg-amber-600 text-white rounded-lg"
        onClick={() => window.location.reload()}
      >
        Tải lại
      </button>
    </div>
  ),
});
```

## Verification

1. `pnpm build` — must succeed with no errors.
2. `pnpm tsc --noEmit` — no TypeScript errors.
3. `pnpm preview` — confirm app loads normally at root and at deep routes.
4. Manual: deploy to Vercel, open app in mobile browser on a deep route, trigger a
   new deployment, return to the tab — should auto-reload instead of showing 404.

## Related

- GitHub issue: #6
