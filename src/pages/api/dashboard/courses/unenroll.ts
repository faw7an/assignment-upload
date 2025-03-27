import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method for unenrollment
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };
    
    const { courseId, userId } = req.body;
    
    // Validate input
    if (!courseId) {
      return res.status(400).json({ message: 'Course ID is required' });
    }
    
    // Determine which user to unenroll
    const userToUnenroll = userId || decoded.userId;
    
    // If unenrolling another user, check if current user is admin
    if (userId && userId !== decoded.userId && decoded.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admins only can unenroll other users.' });
    }
    
    // Check if enrollment exists
    const enrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: userToUnenroll,
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
          userId: userToUnenroll,
          courseId,
        },
      },
    });
    
    return res.status(200).json({ message: 'Unenrolled from course successfully' });
  } catch (error) {
    console.error('Course unenrollment error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
