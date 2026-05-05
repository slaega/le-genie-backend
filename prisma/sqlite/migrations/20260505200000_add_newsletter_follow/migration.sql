-- AlterTable: add publishedAt to posts
ALTER TABLE "posts" ADD COLUMN "publishedAt" DATETIME;

-- CreateTable: subscribers
CREATE TABLE "subscribers" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "email"     TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");

-- CreateTable: follows
CREATE TABLE "follows" (
    "id"         TEXT NOT NULL PRIMARY KEY,
    "followerId" TEXT NOT NULL,
    "authorId"   TEXT NOT NULL,
    "createdAt"  DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "follows_authorId_fkey"   FOREIGN KEY ("authorId")   REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "follows_followerId_authorId_key" ON "follows"("followerId", "authorId");
CREATE INDEX "follows_authorId_idx" ON "follows"("authorId");
