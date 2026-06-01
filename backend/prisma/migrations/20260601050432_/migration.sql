/*
  Warnings:

  - Made the column `sellerId` on table `product` required. This step will fail if there are existing NULL values in that column.
  - Made the column `sellerId` on table `suborder` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `product` DROP FOREIGN KEY `Product_sellerId_fkey`;

-- DropForeignKey
ALTER TABLE `suborder` DROP FOREIGN KEY `SubOrder_sellerId_fkey`;

-- AlterTable
ALTER TABLE `product` MODIFY `sellerId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `suborder` MODIFY `sellerId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `SellerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SubOrder` ADD CONSTRAINT `SubOrder_sellerId_fkey` FOREIGN KEY (`sellerId`) REFERENCES `SellerProfile`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
