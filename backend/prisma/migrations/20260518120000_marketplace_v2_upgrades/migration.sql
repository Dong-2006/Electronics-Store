-- Extend enums used by the existing marketplace tables.
ALTER TABLE `Order` MODIFY `status` ENUM('PENDING', 'CONFIRMED', 'SHIPPING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUND_REQUESTED') NOT NULL DEFAULT 'PENDING';
ALTER TABLE `Order` MODIFY `paymentMethod` ENUM('COD', 'BANK_TRANSFER', 'VNPAY', 'MOMO') NOT NULL DEFAULT 'COD';
ALTER TABLE `Order` MODIFY `paymentStatus` ENUM('UNPAID', 'PENDING', 'PAID', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'UNPAID';

-- Category hierarchy and product cached metrics.
ALTER TABLE `Category`
    ADD COLUMN `icon` VARCHAR(191) NULL,
    ADD COLUMN `parentId` INTEGER NULL;

ALTER TABLE `Product`
    ADD COLUMN `sold` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `rating` DOUBLE NOT NULL DEFAULT 0;

ALTER TABLE `Review`
    ADD COLUMN `orderItemId` INTEGER NULL,
    ADD COLUMN `images` JSON NULL,
    ADD COLUMN `isVerified` BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE `OrderItem`
    ADD COLUMN `subOrderId` INTEGER NULL;

-- New marketplace v2 tables.
CREATE TABLE `SubOrder` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `orderId` INTEGER NOT NULL,
    `sellerId` INTEGER NULL,
    `subTotal` DECIMAL(12, 2) NOT NULL,
    `shippingFee` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `voucherId` INTEGER NULL,
    `discountAmount` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `trackingNumber` VARCHAR(191) NULL,
    `status` ENUM('PROCESSING', 'CONFIRMED', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUND_REQUESTED') NOT NULL DEFAULT 'PROCESSING',
    `cancelReason` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Voucher` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `code` VARCHAR(191) NOT NULL,
    `type` ENUM('PERCENT', 'FIXED', 'FREE_SHIP') NOT NULL,
    `value` DECIMAL(12, 2) NOT NULL,
    `minOrderValue` DECIMAL(12, 2) NOT NULL DEFAULT 0,
    `maxDiscount` DECIMAL(12, 2) NULL,
    `sellerId` INTEGER NOT NULL,
    `startDate` DATETIME(3) NOT NULL,
    `endDate` DATETIME(3) NOT NULL,
    `usageLimit` INTEGER NOT NULL,
    `usedCount` INTEGER NOT NULL DEFAULT 0,
    `isActive` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Voucher_code_key`(`code`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Notification` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `message` TEXT NOT NULL,
    `type` ENUM('ORDER_UPDATE', 'PAYMENT_STATUS', 'PROMOTION', 'SYSTEM_ALERT', 'NEW_ORDER') NOT NULL,
    `isRead` BOOLEAN NOT NULL DEFAULT false,
    `priority` ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    `metadata` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `Address` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `userId` INTEGER NOT NULL,
    `label` VARCHAR(191) NOT NULL DEFAULT 'Nha',
    `fullName` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NOT NULL,
    `address` VARCHAR(191) NOT NULL,
    `city` VARCHAR(191) NOT NULL,
    `postalCode` VARCHAR(191) NULL,
    `country` VARCHAR(191) NOT NULL DEFAULT 'Vietnam',
    `isDefault` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `BulkUploadBatch` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `fileName` VARCHAR(191) NULL,
    `status` ENUM('PENDING', 'COMPLETED', 'PARTIAL', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `itemCount` INTEGER NOT NULL DEFAULT 0,
    `errorCount` INTEGER NOT NULL DEFAULT 0,
    `sellerId` INTEGER NOT NULL,
    `uploadedBy` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `BulkUploadItem` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `batchId` INTEGER NOT NULL,
    `rowNumber` INTEGER NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `slug` VARCHAR(191) NOT NULL,
    `price` DECIMAL(12, 2) NOT NULL,
    `status` ENUM('CREATED', 'UPDATED', 'ERROR') NOT NULL DEFAULT 'CREATED',
    `errorDescription` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Indexes.
CREATE INDEX `Category_parentId_idx` ON `Category`(`parentId`);
CREATE INDEX `Product_categoryId_price_idx` ON `Product`(`categoryId`, `price`);
CREATE INDEX `Product_categoryId_rating_idx` ON `Product`(`categoryId`, `rating`);
CREATE INDEX `Product_sold_idx` ON `Product`(`sold`);
CREATE UNIQUE INDEX `Review_orderItemId_key` ON `Review`(`orderItemId`);
CREATE INDEX `Review_productId_idx` ON `Review`(`productId`);
CREATE INDEX `OrderItem_subOrderId_idx` ON `OrderItem`(`subOrderId`);
CREATE INDEX `SubOrder_orderId_idx` ON `SubOrder`(`orderId`);
CREATE INDEX `SubOrder_sellerId_idx` ON `SubOrder`(`sellerId`);
CREATE INDEX `SubOrder_status_idx` ON `SubOrder`(`status`);
CREATE INDEX `Voucher_sellerId_idx` ON `Voucher`(`sellerId`);
CREATE INDEX `Voucher_isActive_startDate_endDate_idx` ON `Voucher`(`isActive`, `startDate`, `endDate`);
CREATE INDEX `Notification_userId_isRead_idx` ON `Notification`(`userId`, `isRead`);
CREATE INDEX `Notification_createdAt_idx` ON `Notification`(`createdAt`);
CREATE INDEX `Address_userId_idx` ON `Address`(`userId`);
CREATE INDEX `BulkUploadBatch_sellerId_idx` ON `BulkUploadBatch`(`sellerId`);
CREATE INDEX `BulkUploadBatch_uploadedBy_idx` ON `BulkUploadBatch`(`uploadedBy`);
CREATE INDEX `BulkUploadItem_batchId_idx` ON `BulkUploadItem`(`batchId`);

-- Foreign keys.
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `OrderItem` ADD CONSTRAINT `OrderItem_subOrderId_fkey` FOREIGN KEY (`subOrderId`) REFERENCES `SubOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Review` ADD CONSTRAINT `Review_orderItemId_fkey` FOREIGN KEY (`orderItemId`) REFERENCES `OrderItem`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `SubOrder` ADD CONSTRAINT `SubOrder_orderId_fkey` FOREIGN KEY (`orderId`) REFERENCES `Order`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `SubOrder` ADD CONSTRAINT `SubOrder_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `SellerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `SubOrder` ADD CONSTRAINT `SubOrder_voucherId_fkey` FOREIGN KEY (`voucherId`) REFERENCES `Voucher`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `Voucher` ADD CONSTRAINT `Voucher_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `SellerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Notification` ADD CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `Address` ADD CONSTRAINT `Address_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `BulkUploadBatch` ADD CONSTRAINT `BulkUploadBatch_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `SellerProfile`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE `BulkUploadBatch` ADD CONSTRAINT `BulkUploadBatch_uploadedBy_fkey` FOREIGN KEY (`uploadedBy`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `BulkUploadItem` ADD CONSTRAINT `BulkUploadItem_batchId_fkey` FOREIGN KEY (`batchId`) REFERENCES `BulkUploadBatch`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
