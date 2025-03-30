import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'GET') {
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
    
    const courses = await prisma.course.findMany({
      include: {
        courseAdmin: {
          select: {
            id: true,
            username: true
          }
        },
        _count: {
          select: {
            enrolledStudents: true,
            courseUnits: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });
    
    // Add a field to indicate if the current user is admin of each course
    const coursesWithAdminInfo = courses.map(course => ({
      ...course,
      isCurrentUserAdmin: course.courseAdminId === decoded.userId
    }));
    
    return res.status(200).json({
      courses: coursesWithAdminInfo,
    });
  } catch (error) {
    console.error('Fetch Courses Error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
