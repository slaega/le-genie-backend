-- AlterTable: add scheduledAt column to posts
ALTER TABLE `posts` ADD COLUMN `scheduledAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `posts_scheduledAt_status_idx` ON `posts`(`scheduledAt`, `status`);
