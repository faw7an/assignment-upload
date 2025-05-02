import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

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
    
    const { courseId, userId } = req.body;
    
    // Validate input
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // If unenrolling another user, check if current user has permission
    if (userId && userId !== decoded.userId) {
      // Only super admins can unenroll other users
      const isSuperAdmin = decoded.role === 'SUPER_ADMIN';
      
      if (!isSuperAdmin) {
        return res.status(403).json({ 
          message: 'Access denied. Only super admins can unenroll other users.' 
        });
      }
    }
    
    const studentId = userId || decoded.userId;
    
    // Check if student is enrolled
    const enrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId,
        },
      },
    });
    
    if (!enrollment) {
      return res.status(404).json({ message: 'User is not enrolled in this course' });
    }
    
    // Delete enrollment
    await prisma.userCourse.delete({
      where: {
        userId_courseId: {
          userId: studentId,
          courseId,
        },
      },
    });
    
    return res.status(200).json({
      message: 'Unenrollment successful',
    });
  } catch (error) {
    console.error('Unenrollment Error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
