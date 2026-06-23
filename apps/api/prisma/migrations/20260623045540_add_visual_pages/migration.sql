-- CreateTable
CREATE TABLE "PageVersion" (
    "id" TEXT NOT NULL,
    "pageId" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisualPage" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "titleAr" TEXT NOT NULL,
    "titleEn" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "sections" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "VisualPage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisualPageVersion" (
    "id" TEXT NOT NULL,
    "visualPageId" TEXT NOT NULL,
    "versionName" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VisualPageVersion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "PageVersion_pageId_idx" ON "PageVersion"("pageId");

-- CreateIndex
CREATE INDEX "PageVersion_createdAt_idx" ON "PageVersion"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "VisualPage_slug_key" ON "VisualPage"("slug");

-- CreateIndex
CREATE INDEX "VisualPage_status_idx" ON "VisualPage"("status");

-- CreateIndex
CREATE INDEX "VisualPage_deletedAt_idx" ON "VisualPage"("deletedAt");

-- CreateIndex
CREATE INDEX "VisualPageVersion_visualPageId_idx" ON "VisualPageVersion"("visualPageId");

-- CreateIndex
CREATE INDEX "VisualPageVersion_createdAt_idx" ON "VisualPageVersion"("createdAt");

-- AddForeignKey
ALTER TABLE "PageVersion" ADD CONSTRAINT "PageVersion_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "Page"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualPage" ADD CONSTRAINT "VisualPage_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualPage" ADD CONSTRAINT "VisualPage_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisualPageVersion" ADD CONSTRAINT "VisualPageVersion_visualPageId_fkey" FOREIGN KEY ("visualPageId") REFERENCES "VisualPage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
