-- AlterTable
ALTER TABLE "posts" ADD COLUMN "slug" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "posts_slug_key" ON "posts"("slug");
