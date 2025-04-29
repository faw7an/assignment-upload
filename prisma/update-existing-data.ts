import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function updateExistingData() {
  try {
    console.log('Starting data update for unit-course relationship...');

    // Step 1: Promote an admin user to super_admin if any exist
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' }
    });

    if (adminUsers.length > 0) {
      // Promote the first admin to super_admin
      await prisma.user.update({
        where: { id: adminUsers[0].id },
        data: { role: 'SUPER_ADMIN' }
      });
      console.log(`Promoted user ${adminUsers[0].username} to SUPER_ADMIN role.`);
    } else {
      console.log('No ADMIN users found to promote to SUPER_ADMIN.');
    }

    // Step 2: Ensure all courses have an admin
    const coursesWithoutAdmin = await prisma.course.findMany({
      where: { courseAdminId: null }
    });

    if (coursesWithoutAdmin.length > 0) {
      const superAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' }
      });
      
      const adminForCourses = superAdmin || adminUsers[0];
      
      if (adminForCourses) {
        console.log(`Assigning ${adminForCourses.username} as admin for ${coursesWithoutAdmin.length} courses.`);
        
        for (const course of coursesWithoutAdmin) {
          await prisma.course.update({
            where: { id: course.id },
            data: { courseAdminId: adminForCourses.id }
          });
        }
      } else {
        console.log('Warning: No admin user available to assign to courses.');
      }
    } else {
      console.log('All courses have an admin assigned.');
    }

    // Step 3: Find units without courseId and assign them based on CourseUnit relationships
    console.log('Looking for units that need a courseId assignment...');
    
    const unitsWithoutCourse = await prisma.unit.findMany({
      where: { courseId: null },
      include: { courses: true }
    });
    
    console.log(`Found ${unitsWithoutCourse.length} units without a direct courseId.`);
    
    for (const unit of unitsWithoutCourse) {
      // If the unit has course relationships, use the first one
      if (unit.courses && unit.courses.length > 0) {
        const firstCourseUnit = unit.courses[0];
        console.log(`Updating Unit ${unit.id} with Course ID ${firstCourseUnit.courseId} from CourseUnit relation.`);
        
        await prisma.unit.update({
          where: { id: unit.id },
          data: { courseId: firstCourseUnit.courseId }
        });
      } else {
        // If no course relationships, find any course to assign to
        const firstCourse = await prisma.course.findFirst();
        
        if (firstCourse) {
          console.log(`Assigning Unit ${unit.id} to Course ${firstCourse.id} as fallback.`);
          
          await prisma.unit.update({
            where: { id: unit.id },
            data: { courseId: firstCourse.id }
          });
        } else {
          console.error(`Cannot update Unit ${unit.id}: No courses available.`);
        }
      }
    }

    console.log('Data update completed successfully.');
  } catch (error) {
    console.error('Error updating data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Execute the update
updateExistingData();
