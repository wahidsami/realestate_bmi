# Media Library API

The media module is disk-backed and metadata-driven.

## Behavior

- Files are stored in `uploads/`
- Metadata lives in PostgreSQL through Prisma
- Images are optimized with Sharp
- Public assets can be streamed without authentication
- Private assets require an authenticated request

## Routes

See the root documentation at [`docs/media.md`](../../docs/media.md) for the full endpoint list and permissions.
