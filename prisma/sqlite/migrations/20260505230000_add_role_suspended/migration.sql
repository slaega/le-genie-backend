-- SQLite: ALTER TABLE ADD COLUMN (supported for simple cases)
ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'USER' CHECK ("role" IN ('USER', 'ADMIN'));
ALTER TABLE "users" ADD COLUMN "suspended" BOOLEAN NOT NULL DEFAULT false;
