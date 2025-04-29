/*
  Warnings:

  - You are about to drop the `CourseUnit` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `Course` DROP FOREIGN KEY `Course_courseAdminId_fkey`;

-- DropForeignKey
ALTER TABLE `CourseUnit` DROP FOREIGN KEY `CourseUnit_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `CourseUnit` DROP FOREIGN KEY `CourseUnit_unitId_fkey`;

-- AlterTable
ALTER TABLE `Course` MODIFY `courseAdminId` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `role` ENUM('STUDENT', 'ADMIN', 'SUPER_ADMIN') NOT NULL DEFAULT 'STUDENT';

-- DropTable
DROP TABLE `CourseUnit`;

-- AddForeignKey
ALTER TABLE `Course` ADD CONSTRAINT `Course_courseAdminId_fkey` FOREIGN KEY (`courseAdminId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
