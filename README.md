# Fleet Combat Resolver (Next.js)

This project is a **Next.js** app.

## Local run

```bash
npm install
npm run dev
```

## Vercel 404 (`NOT_FOUND`) fix checklist

If Vercel shows `404: NOT_FOUND`, verify these settings and redeploy:

1. **Root Directory** must be the repo root (where `package.json` is).
2. **Framework Preset** should be **Next.js**.
3. Remove any custom **Output Directory** value.
4. Keep build command as `npm run build` (or default for Next.js).
5. Confirm the deployment logs include Next.js route generation.

This repo includes:
- `/` page route in `app/page.tsx`
- `/api/resolve` API route in `app/api/resolve/route.ts`
- `vercel.json` using `@vercel/next` builder to force Next.js deployment
