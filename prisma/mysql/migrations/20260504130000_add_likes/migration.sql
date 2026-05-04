-- CreateTable
CREATE TABLE `likes` (
    `id` VARCHAR(191) NOT NULL,
    `postId` VARCHAR(191) NOT NULL,
    `fingerprint` VARCHAR(255) NOT NULL,
    `ip` VARCHAR(45) NULL,
    `userAgent` VARCHAR(512) NULL,
    `userId` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `likes_postId_idx`(`postId`),
    INDEX `likes_postId_fingerprint_idx`(`postId`, `fingerprint`),
    INDEX `likes_userId_idx`(`userId`),
    UNIQUE INDEX `likes_postId_fingerprint_key`(`postId`, `fingerprint`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
