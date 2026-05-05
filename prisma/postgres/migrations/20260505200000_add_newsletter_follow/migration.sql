-- AlterTable: add publishedAt to posts
ALTER TABLE "posts" ADD COLUMN "publishedAt" TIMESTAMP(3);

-- CreateTable: subscribers (global newsletter)
CREATE TABLE "subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscribers_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "subscribers_email_key" ON "subscribers"("email");

-- CreateTable: follows (user → author)
CREATE TABLE "follows" (
    "id" TEXT NOT NULL,
    "followerId" TEXT NOT NULL,
    "authorId"   TEXT NOT NULL,
    "createdAt"  TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "follows_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "follows_followerId_fkey" FOREIGN KEY ("followerId") REFERENCES "users"("id") ON DELETE CASCADE,
    CONSTRAINT "follows_authorId_fkey"   FOREIGN KEY ("authorId")   REFERENCES "users"("id") ON DELETE CASCADE
);
CREATE UNIQUE INDEX "follows_followerId_authorId_key" ON "follows"("followerId", "authorId");
CREATE INDEX "follows_authorId_idx" ON "follows"("authorId");
