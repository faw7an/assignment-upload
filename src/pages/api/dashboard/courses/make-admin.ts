import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };
    
    const { courseId, newAdminId } = req.body;
    
    // Validate input
    if (!courseId || !newAdminId) {
      return res.status(400).json({ message: 'Course ID and new admin ID are required' });
    }
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if the current user is the course admin or a system admin
    const isSystemAdmin = decoded.role === 'ADMIN';
    const isCourseAdmin = course.courseAdminId === decoded.userId;
    
    if (!isSystemAdmin && !isCourseAdmin) {
      return res.status(403).json({ 
        message: 'Access denied. Only the current course admin or system admin can transfer admin rights.' 
      });
    }
    
    // Check if the new admin exists and is enrolled in the course
    const userEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: newAdminId,
          courseId,
        },
      },
      include: {
        user: true,
      },
    });
    
    if (!userEnrollment) {
      return res.status(404).json({ 
        message: 'The user must be enrolled in the course to become an admin' 
      });
    }
    
    // Update the course admin
    const updatedCourse = await prisma.course.update({
      where: { id: courseId },
      data: { courseAdminId: newAdminId },
    });
    
    return res.status(200).json({
      message: 'Course admin updated successfully',
      course: {
        id: updatedCourse.id,
        name: updatedCourse.name,
        code: updatedCourse.code,
        newAdminId: updatedCourse.courseAdminId
      }
    });
  } catch (error) {
    console.error('Make Admin Error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
