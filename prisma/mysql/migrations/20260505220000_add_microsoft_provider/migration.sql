-- MySQL: modify enum column to add MICROSOFT value
ALTER TABLE `auth_providers` MODIFY `provider` ENUM('GOOGLE', 'GITHUB', 'MICROSOFT') NOT NULL;
