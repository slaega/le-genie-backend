-- AlterTable: add scheduledAt column to posts
ALTER TABLE "posts" ADD COLUMN "scheduledAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "posts_scheduledAt_status_idx" ON "posts"("scheduledAt", "status");
