-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('USER', 'SELLER', 'ADMIN') NOT NULL DEFAULT 'USER';

-- CreateTable
CREATE TABLE `SellerProfile` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `shopName` VARCHAR(191) NOT NULL,
    `shopSlug` VARCHAR(191) NOT NULL,
    `shopDescription` TEXT NULL,
    `shopLogo` VARCHAR(191) NULL,
    `shopBanner` VARCHAR(191) NULL,
    `businessPhone` VARCHAR(191) NOT NULL,
    `businessEmail` VARCHAR(191) NOT NULL,
    `pickupAddress` TEXT NOT NULL,
    `status` ENUM('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED') NOT NULL DEFAULT 'PENDING',
    `rejectReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `SellerProfile_userId_key`(`userId`),
    UNIQUE INDEX `SellerProfile_shopSlug_key`(`shopSlug`),
    INDEX `SellerProfile_status_idx`(`status`),
    INDEX `SellerProfile_shopName_idx`(`shopName`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AlterTable
ALTER TABLE `Product`
    ADD COLUMN `sellerId` INTEGER NULL,
    ADD COLUMN `approvalStatus` ENUM('DRAFT', 'PENDING', 'APPROVED', 'REJECTED') NOT NULL DEFAULT 'APPROVED',
    ADD COLUMN `rejectReason` TEXT NULL,
    ADD COLUMN `approvedAt` DATETIME(3) NULL,
    ADD COLUMN `approvedById` INTEGER NULL;

-- CreateIndex
CREATE INDEX `Product_sellerId_idx` ON `Product`(`sellerId`);

-- CreateIndex
CREATE INDEX `Product_approvalStatus_idx` ON `Product`(`approvalStatus`);

-- CreateIndex
CREATE INDEX `Product_approvedById_idx` ON `Product`(`approvedById`);

-- AddForeignKey
ALTER TABLE `SellerProfile` ADD CONSTRAINT `SellerProfile_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `SellerProfile`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_approvedById_fkey` FOREIGN KEY (`approvedById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
