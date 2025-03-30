import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingData() {
  try {
    console.log('Starting data update...');

    // Find a valid admin user
    const adminUser = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    });

    if (!adminUser) {
      throw new Error('No admin user found. Please create an admin user first.');
    }

    // Update all courses without an admin
    const updatedCourses = await prisma.course.updateMany({
      where: { courseAdminId: null },
      data: { courseAdminId: adminUser.id }
    }); 

    console.log(`Updated ${updatedCourses.count} courses with admin ID.`);

    // Find a valid course
    const firstCourse = await prisma.course.findFirst();
    
    if (!firstCourse) {
      throw new Error('No course found. Please create a course first.');
    }

    // Update all units without a course
    const updatedUnits = await prisma.unit.updateMany({
      where: { courseId: null },
      data: { courseId: firstCourse.id }
    });

    console.log(`Updated ${updatedUnits.count} units with course ID.`);
    console.log('Data update completed successfully.');
  } catch (error) {
    console.error('Error updating data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingData();
