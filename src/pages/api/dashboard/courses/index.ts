import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

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
    const { name, code, enrolledOnly } = req.query;
    
    // Build where clause based on query parameters
    let whereClause: any = {};
    
    if (name) {
      whereClause.name = {
        contains: name as string,
      };
    }
    
    if (code) {
      whereClause.code = {
        contains: code as string,
      };
    }
    
    // If enrolledOnly=true, only show courses where the user is enrolled
    if (enrolledOnly === 'true' && decoded.role !== 'SUPER_ADMIN') {
      whereClause.enrolledStudents = { 
        some: { 
          userId: decoded.userId 
        } 
      };
    }
    
    const courses = await prisma.course.findMany({
      where: whereClause,
      include: {
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
    
    return res.status(200).json({
      courses: courses,
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
