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
    
    // Extract query parameters for filtering
    const { courseId } = req.query;
    
    // Build where clause based on query parameters
    let whereClause: any = {};
    
    if (courseId) {
      whereClause.courseId = courseId as string;
    }
    
    // For regular students, only show units from enrolled courses
    const isSystemAdmin = decoded.role === 'ADMIN';
    
    if (!isSystemAdmin) {
      // Get all courses where the user is enrolled or is the admin
      const userCourses = await prisma.course.findMany({
        where: {
          OR: [
            {
              courseAdminId: decoded.userId,
            },
            {
              enrolledStudents: {
                some: {
                  userId: decoded.userId,
                },
              },
            },
          ],
        },
        select: {
          id: true,
        },
      });
      
      const userCourseIds = userCourses.map(course => course.id);
      
      // If specific courseId is requested, check if user has access to it
      if (courseId) {
        if (!userCourseIds.includes(courseId as string)) {
          return res.status(403).json({ 
            message: 'You do not have access to this course.' 
          });
        }
      } else {
        // Otherwise, filter by all accessible courses
        whereClause.courseId = {
          in: userCourseIds,
        };
      }
    }
    
    // Fetch units with filter
    const units = await prisma.unit.findMany({
      where: whereClause,
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            courseAdmin: {
              select: {
                id: true,
                username: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return res.status(200).json({
      units,
    });
  } catch (error) {
    console.error('Fetch Units Error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
