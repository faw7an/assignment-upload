import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Only allow POST method for enrollment
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
    
    // Determine which user to enroll
    const userToEnroll = userId || decoded.userId;
    
    // If enrolling another user, check if current user is admin
    if (userId && userId !== decoded.userId && decoded.role !== 'ADMIN') {
      return res.status(403).json({ message: 'Access denied. Admins only can enroll other users.' });
    }
    
    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userToEnroll },
    });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    // Check if already enrolled
    const existingEnrollment = await prisma.userCourse.findUnique({
      where: {
        userId_courseId: {
          userId: userToEnroll,
          courseId,
        },
      },
    });
    
    if (existingEnrollment) {
      return res.status(409).json({ message: 'User is already enrolled in this course' });
    }
    
    // Create enrollment
    await prisma.userCourse.create({
      data: {
        userId: userToEnroll,
        courseId,
      },
    });
    
    return res.status(201).json({ message: 'Enrolled in course successfully' });
  } catch (error) {
    console.error('Course enrollment error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
