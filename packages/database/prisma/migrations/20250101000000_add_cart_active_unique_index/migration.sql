-- AlterTable: Add partial unique index for cart ACTIVE uniqueness per user
-- DT-002: Ensures at most one ACTIVE cart per user at the database level
-- Prisma does not support partial indexes natively, hence this manual migration

CREATE UNIQUE INDEX IF NOT EXISTS "carts_one_active_per_user"
  ON "carts" ("user_id")
  WHERE "status" = 'ACTIVE' AND "user_id" IS NOT NULL;
