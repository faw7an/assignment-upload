-- Drop the foreign key constraint first
ALTER TABLE `Course` DROP FOREIGN KEY `Course_courseAdminId_fkey`;

-- Remove the index
DROP INDEX `Course_courseAdminId_idx` ON `Course`;

-- Drop the column itself
ALTER TABLE `Course` DROP COLUMN `courseAdminId`;