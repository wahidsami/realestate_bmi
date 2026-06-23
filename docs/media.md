# Media Library API

This module stores files on disk under `uploads/` and keeps only metadata in PostgreSQL.

## Storage layout

- `uploads/images/YYYY/MM/`
- `uploads/videos/YYYY/MM/`
- `uploads/documents/YYYY/MM/`
- `uploads/floorplans/YYYY/MM/`
- `uploads/avatars/YYYY/MM/`
- `uploads/blog/YYYY/MM/`
- `uploads/seo/YYYY/MM/`
- `uploads/gallery/YYYY/MM/`
- `uploads/other/YYYY/MM/`
- `uploads/temp/`

## Media categories

- `image`
- `video`
- `document`
- `floorplan`
- `avatar`
- `blog`
- `seo`
- `gallery`
- `other`

## Endpoints

- `GET /api/media`
- `GET /api/media/folders`
- `POST /api/media/folders`
- `POST /api/media/upload`
- `POST /api/media/multiple-upload`
- `GET /api/media/:id`
- `PATCH /api/media/:id`
- `DELETE /api/media/:id`
- `POST /api/media/move`
- `POST /api/media/duplicate`
- `POST /api/media/bulk-delete`
- `POST /api/media/bulk-download`
- `POST /api/media/:id/restore`
- `GET /api/media/:id/file`
- `GET /api/media/:id/download`
- `GET /api/media/:id/variants/:variant`

## Permissions

- `media.upload`
- `media.edit`
- `media.delete`
- `media.restore`
- `media.download`
- `media.manage`

## Notes

- Public files can be accessed without authentication.
- Private files require authentication.
- Image uploads generate responsive WebP variants.
- Bulk download returns a ZIP archive of selected files.
