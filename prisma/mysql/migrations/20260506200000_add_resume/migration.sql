CREATE TABLE `resumes` (
    `id`         VARCHAR(191) NOT NULL,
    `userId`     VARCHAR(191) NOT NULL,
    `templateId` VARCHAR(50) NOT NULL DEFAULT 'minimal-light',
    `isPublic`   BOOLEAN NOT NULL DEFAULT true,
    `data`       JSON NOT NULL,
    `createdAt`  DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`  DATETIME(3) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE UNIQUE INDEX `resumes_userId_key` ON `resumes`(`userId`);
CREATE INDEX `resumes_userId_idx` ON `resumes`(`userId`);
