-- AlterTable
ALTER TABLE `posts` ADD COLUMN `slug` VARCHAR(255) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `posts_slug_key` ON `posts`(`slug`);
