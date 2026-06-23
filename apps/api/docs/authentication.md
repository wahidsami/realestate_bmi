# Authentication & Authorization

## Overview

The backend uses JWT access tokens and database-backed refresh tokens with session tracking and revocation.

## Default Admin

- Email: `admin@bmi-realestate.com`
- Username: `admin`
- Password: `Admin@123456`
- The first login should force a password change in the application flow.

## Endpoints

### `POST /api/auth/login`

Login with `identifier` and `password`.

`identifier` can be either email or username.

### `POST /api/auth/logout`

Revokes the active refresh token and session.

### `POST /api/auth/refresh`

Rotates the refresh token and returns a new access token.

### `POST /api/auth/forgot-password`

Creates a password reset token.

### `POST /api/auth/reset-password`

Consumes a reset token and sets a new password.

### `GET /api/auth/me`

Returns the authenticated user profile and permissions.

### `PATCH /api/auth/profile`

Updates the authenticated user profile.

### `PATCH /api/auth/change-password`

Changes the authenticated user password.

## Authorization

Use `authenticate()` to resolve the current user and `authorize('permission.key')` to enforce permissions.

Examples:

- `authorize('properties.create')`
- `authorize('pages.publish')`
- `authorize('settings.edit')`

## Security Controls

- bcrypt password hashing
- JWT access token expiry: 15 minutes
- JWT refresh token expiry: 30 days
- refresh token rotation
- refresh token database storage
- login rate limiting
- account lock after repeated failed logins
- input validation with Zod
- central error handling
- secure cookie support
