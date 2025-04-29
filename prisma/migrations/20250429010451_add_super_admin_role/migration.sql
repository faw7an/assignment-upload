-- DropForeignKey
ALTER TABLE `Unit` DROP FOREIGN KEY `Unit_courseId_fkey`;

-- AlterTable
ALTER TABLE `Unit` MODIFY `courseId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `CourseUnit` (
    `courseId` VARCHAR(191) NOT NULL,
    `unitId` INTEGER NOT NULL,
    `addedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `CourseUnit_courseId_idx`(`courseId`),
    INDEX `CourseUnit_unitId_idx`(`unitId`),
    PRIMARY KEY (`courseId`, `unitId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseUnit` ADD CONSTRAINT `CourseUnit_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `Course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CourseUnit` ADD CONSTRAINT `CourseUnit_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `Unit`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
