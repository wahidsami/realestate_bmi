-- Rename column "units" to "unitCount" on Project table
-- This resolves the Prisma schema conflict where "units" was used for both a scalar Int and a Unit[] relation.
ALTER TABLE "Project" RENAME COLUMN "units" TO "unitCount";
