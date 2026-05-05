-- SQLite: enums are stored as TEXT with CHECK — recreate auth_providers table
-- SQLite does not support ALTER COLUMN, so we need to recreate the table
CREATE TABLE "auth_providers_new" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "provider" TEXT NOT NULL CHECK ("provider" IN ('GOOGLE', 'GITHUB', 'MICROSOFT')),
    "providerUserId" TEXT NOT NULL,
    "activatedAt" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "auth_providers_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

INSERT INTO "auth_providers_new" SELECT * FROM "auth_providers";
DROP TABLE "auth_providers";
ALTER TABLE "auth_providers_new" RENAME TO "auth_providers";

CREATE UNIQUE INDEX "auth_providers_userId_provider_key" ON "auth_providers"("userId", "provider");
CREATE INDEX "auth_providers_userId_provider_idx" ON "auth_providers"("userId", "provider");
