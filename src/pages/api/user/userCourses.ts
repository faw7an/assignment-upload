import { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '@/utils/tokenUtils';
import prisma from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Verify the authentication token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({ message: 'Authentication token required' });
    }

    // Decode the token to get the user ID
    const decodedToken = await verifyToken(token);
    if (!decodedToken || !decodedToken.userId) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const userId = decodedToken.userId;

    // Fetch the user's enrolled courses
    const userCourses = await prisma.userCourse.findMany({
      where: {
        userId: userId,
      },
      include: {
        course: {
          select: {
            id: true,
            name: true,
            code: true,
            description: true,
          }
        }
      },
      orderBy: {
        enrolledAt: 'desc',
      },
    });

    // Transform the data for a better response shape
    const courses = userCourses.map(uc => ({
      id: uc.course.id,
      name: uc.course.name,
      code: uc.course.code,
      description: uc.course.description,
      enrolledAt: uc.enrolledAt,
    }));

    return res.status(200).json({
      success: true,
      courses
    });
  } catch (error) {
    console.error('Error fetching user courses:', error);
    return res.status(500).json({ message: 'Failed to fetch enrolled courses' });
  }
}