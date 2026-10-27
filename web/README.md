# Supplier Portal (Next.js)

React / Next.js port of the HTML mock-up that lives one folder up (`../index.html`, `../app.js`, `../styles.css`). The mock-up files are unchanged and still open straight from disk; this app is the production-style version of the same prototype.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm run start
```

## What carried over
- `src/app/globals.css` is a copy of the mock-up's `styles.css`, so markup and class names match the mock-up.
- Same fictional seed data, rules and copy. Data is saved in the browser (`localStorage`, key `northstar-supplier-portal-v1`); use **Reset fictional demo data** in the sidebar to restore the seed. There is still no backend.

## Structure
- `src/app/(portal)/…` routes: `/onboarding`, `/onboarding/registration`, `/onboarding/tasks/[taskId]`, `/sample-requests` (+ `/new`, `/[id]`, `/[id]/respond`), `/profile`, `/notifications`, `/help`.
- `src/lib/` data and rules: `data.ts` (seed), `policy.ts` (sample-gate rules), `onboarding.ts`, `registration.ts` (field specs and validation), `docs.ts` (document versions, expiry, previews), `db.ts` (load/save), `store.tsx` (`usePortal()`: `db`, `mutate(fn)`, `toast`).
- `src/components/` page components grouped by area (`registration/`, `onboarding/`, `sample-requests/`, `profile/`).

## Not production-ready yet
File contents are not stored (previews only work for files chosen in the current session), the document watermark is a screen overlay, and maps are an embed without geocoding. See the stack notes in the project discussion for what a real backend needs (storage, server-side watermarking, auth, expiry jobs).

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
