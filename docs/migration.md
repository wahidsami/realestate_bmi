# Migration Notes

## Goal

Refactor the original single Vite React application into a monorepo layout without changing UI behavior or removing functionality.

## Target Layout

- `apps/web` for the public website
- `apps/admin` for the admin dashboard and page builder
- `apps/api` reserved for the future Node.js backend API
- `packages/shared` for shared repositories and domain wiring
- `packages/ui` for shared UI contexts and components
- `packages/types` for shared TypeScript types
- `packages/utils` for shared helper utilities
- `uploads` for temporary file uploads
- `docs` for migration documentation

## What Changed

1. Moved the shared type model into `packages/types`.
2. Moved UI contexts and reusable components into `packages/ui`.
3. Moved the localStorage-backed repositories into `packages/shared`.
4. Added browser storage helpers in `packages/utils` so UI code no longer talks to `localStorage` or `sessionStorage` directly.
5. Split the application shell into:
   - `apps/web/src/App.tsx` for the public site shell
   - `apps/admin/src/App.tsx` for the admin shell
6. Updated the root app to compose the new app shells while keeping the existing public/admin toggle behavior.
7. Added workspace package manifests and root workspace configuration.
8. Added path aliases for the new monorepo structure.
9. Introduced the first backend-backed property module with PostgreSQL persistence and API-first repository wiring.
10. Added a temporary property migration bridge so legacy browser property data can be seeded into PostgreSQL without losing existing content.

## Temporary Decisions

- Most legacy repositories are still browser-storage backed while the rollout continues.
- Property data now has a database-backed API path, with legacy browser storage retained only as a temporary migration bridge.
- The backend API exists but is still being expanded module by module.
- The current root Vite app remains the runnable entrypoint during migration.
- Property data now prefers the API and only falls back to browser storage if the backend is temporarily unavailable.

## Storage Cleanup

- UI components now call helper functions from `packages/utils` instead of using browser storage directly.
- Repository classes still own the persistence behavior for now, which keeps the transition incremental.

## Verification Status

- TypeScript verification was attempted, but the environment does not currently have `node_modules` installed, so the compiler could not resolve React and Vite dependencies.
- Once dependencies are installed, run:
  - `npm run lint`
  - `npm run build`

## Next Phase

- Continue replacing browser-storage repositories with API-backed adapters in a staged rollout.
- Keep the existing fallback path so legacy data remains readable while backend coverage expands.
- Extend backend endpoints for properties, projects, pages, settings, leads, and page builder content.
- Remove the browser-storage fallback once each module has been verified as database-backed end-to-end.
