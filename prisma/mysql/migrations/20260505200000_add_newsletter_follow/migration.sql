-- AlterTable: add publishedAt to posts
ALTER TABLE `posts` ADD COLUMN `publishedAt` DATETIME(3) NULL;

-- CreateTable: subscribers
CREATE TABLE `subscribers` (
    `id`        VARCHAR(191) NOT NULL,
    `email`     VARCHAR(320) NOT NULL,
    `createdAt` DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE UNIQUE INDEX `subscribers_email_key` ON `subscribers`(`email`);

-- CreateTable: follows (no FK — relationMode=prisma)
CREATE TABLE `follows` (
    `id`         VARCHAR(191) NOT NULL,
    `followerId` VARCHAR(191) NOT NULL,
    `authorId`   VARCHAR(191) NOT NULL,
    `createdAt`  DATETIME(3)  NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE UNIQUE INDEX `follows_followerId_authorId_key` ON `follows`(`followerId`, `authorId`);
CREATE INDEX `follows_followerId_idx` ON `follows`(`followerId`);
CREATE INDEX `follows_authorId_idx`   ON `follows`(`authorId`);
