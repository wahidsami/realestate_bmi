# LocalStorage And SessionStorage Audit

## Scope

Codebase scan for `localStorage` and `sessionStorage` usage in the current monorepo.

## Already Migrated Or Temporary Only

- `apps/admin/src/App.tsx`
  - Uses an in-memory admin auth snapshot to prevent dev reload flicker within the current browser session.
  - This is a temporary stabilization cache, not a data store for business entities.
- `packages/shared/src/repositories/ApiPropertyRepository.ts`
  - Fully API-backed property repository.
- `packages/shared/src/repositories/ProjectRepository.ts`
  - Fully API-backed project repository.
- `packages/shared/src/repositories/PageRepository.ts`
  - Fully API-backed CMS page repository.
- `packages/shared/src/repositories/InquiryRepository.ts`
  - Fully API-backed inquiry repository with in-memory fallback only.
- `packages/shared/src/repositories/VisualPagesRepository.ts`
  - Fully API-backed visual page builder repository with API persistence and in-memory fallback only.
- `apps/api/src/routes/inquiry.routes.ts`
  - Backend inquiry endpoints now persist to PostgreSQL.
- `apps/api/src/routes/visual-pages.routes.ts`
  - Backend page builder endpoints now persist to PostgreSQL.
- `apps/api/src/routes/builder-asset.routes.ts`
  - Backend builder asset endpoints now persist custom themes, reusable symbols, and custom templates to PostgreSQL.

## Pending Migration

- `packages/shared/src/repositories/MediaRepository.ts`
- `packages/shared/src/repositories/SettingsRepository.ts`

## Can Remain Local Temporarily

- `packages/utils/src/browserStorage.ts`
  - Centralized helper used by legacy repositories during migration.
  - Currently backed by in-memory storage only to avoid browser storage failures during the API migration.
- `packages/ui/src/components/ExcelImportEngine.tsx`
  - Contains user-facing copy mentioning the legacy local storage path.

## Notes

- UI components should not call `localStorage` or `sessionStorage` directly.
- Browser storage access should remain isolated in shared helpers and legacy fallbacks until each module is verified against PostgreSQL.
- The property module is the first module actively moving to full API persistence.
