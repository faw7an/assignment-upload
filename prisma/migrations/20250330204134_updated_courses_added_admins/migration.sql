/*
  Warnings:

  - Added the required column `courseAdminId` to the `Course` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseId` to the `Unit` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Course` ADD COLUMN `courseAdminId` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Unit` ADD COLUMN `courseId` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `Course_courseAdminId_idx` ON `Course`(`courseAdminId`);

-- CreateIndex
CREATE INDEX `Unit_courseId_idx` ON `Unit`(`courseId`);

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_courseAdminId_fkey` FOREIGN KEY (`courseAdminId`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
