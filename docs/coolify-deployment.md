# Coolify Deployment Plan

This repo is a monorepo with one API service and one frontend SPA.

## What to deploy

- `API`: Node/Express backend from `apps/api`
- `Web`: Vite frontend from the repo root
- `Database`: use the provided PostgreSQL instance, or deploy a Coolify Postgres service if you want the DB hosted inside Coolify

### Service count

- If you use the provided PostgreSQL URL: **2 pushes**
  - 1 API service
  - 1 Web/static site
- If you also move the database into Coolify: **3 resources**
  - API + Web + Postgres

## Recommended domains

- Frontend: `https://rbmc.testproject.cloud`
- API: `https://api.rbmc.testproject.cloud`

Using a separate API subdomain keeps the setup simple and works cleanly with cookies and CORS.

## API deployment

### Coolify service settings

- Type: Node.js application
- Root directory: repo root
- Build command: `npm ci && npm run prisma:generate --workspace=@bina/api && npm run build --workspace=@bina/api`
- Start command: `npm run start --workspace=@bina/api`
- Internal port: `4000`
- Persistent storage: mount a volume at `/data/uploads`

### API environment

Set these in Coolify:

```env
NODE_ENV=production
DATABASE_URL=postgresql://...
API_PORT=4000
JWT_SECRET=...
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
WEB_URL=https://rbmc.testproject.cloud
ADMIN_URL=https://rbmc.testproject.cloud
VITE_API_URL=https://api.rbmc.testproject.cloud
UPLOAD_PATH=/data/uploads
COOKIE_SECURE=true
COOKIE_SAMESITE=lax
COOKIE_DOMAIN=rbmc.testproject.cloud
ADMIN_COOKIE_NAME=bmi_admin_session
MAX_UPLOAD_SIZE=524288000
```

Notes:

- `DATABASE_URL` is now supported directly by the API config.
- `WEB_URL` and `ADMIN_URL` can both point to the same public origin because the app switches between public/admin views by path.
- Keep `COOKIE_DOMAIN` at the root domain so the auth cookie works across the API subdomain and the main site.

### Database

- Use the supplied PostgreSQL URL if the DB is already provisioned.
- After the API is live, run `prisma migrate deploy` once against production before opening the site.
- Run the seed only if you need the initial admin/data bootstrap.

## Frontend deployment

### Coolify service settings

- Type: Static site
- Root directory: repo root
- Build command: `npm ci && npm run build`
- Publish directory: `dist`

### Frontend environment

```env
VITE_API_URL=https://api.rbmc.testproject.cloud
```

The frontend reads `VITE_API_URL` at build time, so rebuild the site whenever the API URL changes.

## Deployment order

1. Create or confirm the PostgreSQL database.
2. Deploy the API service.
3. Run `prisma migrate deploy` on the API.
4. Deploy the frontend static site.
5. Smoke test `/`, `/admin`, login, and one API-backed page.

## Validation checklist

- `https://rbmc.testproject.cloud` loads the public site.
- `https://rbmc.testproject.cloud/admin` opens the admin UI.
- API health check responds on `https://api.rbmc.testproject.cloud/health`.
- Uploads persist across restarts.
- Cookies are set with `Secure` and the root domain.
