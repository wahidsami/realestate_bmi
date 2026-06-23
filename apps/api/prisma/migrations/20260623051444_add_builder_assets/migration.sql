-- CreateTable
CREATE TABLE "BuilderAsset" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "key" TEXT,
    "nameAr" TEXT NOT NULL,
    "nameEn" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdById" TEXT,
    "updatedById" TEXT,

    CONSTRAINT "BuilderAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BuilderAsset_kind_idx" ON "BuilderAsset"("kind");

-- CreateIndex
CREATE INDEX "BuilderAsset_key_idx" ON "BuilderAsset"("key");

-- CreateIndex
CREATE INDEX "BuilderAsset_deletedAt_idx" ON "BuilderAsset"("deletedAt");

-- AddForeignKey
ALTER TABLE "BuilderAsset" ADD CONSTRAINT "BuilderAsset_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BuilderAsset" ADD CONSTRAINT "BuilderAsset_updatedById_fkey" FOREIGN KEY ("updatedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
