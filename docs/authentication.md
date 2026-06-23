# Authentication & Authorization

This module is implemented in `apps/api` and uses:

- JWT access tokens
- database-backed refresh tokens
- Prisma sessions
- bcrypt password hashing
- Zod validation
- role-based authorization middleware

## Endpoints

- `POST /api/auth/login`
- `POST /api/auth/logout`
- `POST /api/auth/refresh`
- `POST /api/auth/forgot-password`
- `POST /api/auth/reset-password`
- `GET /api/auth/me`
- `PATCH /api/auth/profile`
- `PATCH /api/auth/change-password`

## Authorization

Use `authenticate()` before protected routes and `authorize('permission.key')` for fine-grained access control.

Examples:

- `authorize('properties.create')`
- `authorize('pages.publish')`
- `authorize('settings.edit')`

## Bootstrap Account

- Email: `admin@bmi-realestate.com`
- Username: `admin`
- Password: `Admin@123456`

The backend seed script provisions the default super admin role and permissions.
