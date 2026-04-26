# Fleet Combat Resolver (Next.js)

This project is a **Next.js** app (App Router).

## Local run

```bash
npm install
npm run dev
```

## Vercel deployment notes (404 fix)

If you see a Vercel `404 NOT_FOUND` page:

1. In Vercel project settings, make sure **Root Directory** is the repository root (where `package.json` is located).
2. Framework should be **Next.js** (the included `vercel.json` enforces this).
3. Build command should be `npm run build` and install command `npm install`.
4. Redeploy after changing settings.

The app route is `/` (`app/page.tsx`) and the API route is `/api/resolve`.
