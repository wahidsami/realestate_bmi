-- Add bilingual developer fields to projects
ALTER TABLE "Project"
ADD COLUMN IF NOT EXISTS "developerAr" TEXT,
ADD COLUMN IF NOT EXISTS "developerEn" TEXT;
