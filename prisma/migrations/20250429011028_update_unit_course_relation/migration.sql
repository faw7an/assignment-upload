/*
  Warnings:

  - You are about to drop the `CourseUnit` table. If the table is not empty, all the data it contains will be lost.
  - Made the column `courseId` on table `Unit` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `CourseUnit` DROP FOREIGN KEY `CourseUnit_courseId_fkey`;

-- DropForeignKey
ALTER TABLE `CourseUnit` DROP FOREIGN KEY `CourseUnit_unitId_fkey`;

-- DropForeignKey
ALTER TABLE `Unit` DROP FOREIGN KEY `Unit_courseId_fkey`;

-- AlterTable
ALTER TABLE `Unit` MODIFY `courseId` VARCHAR(191) NOT NULL;

-- DropTable
DROP TABLE `CourseUnit`;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
