import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };
    
    // GET: List courses
    if (req.method === 'GET') {
      // Get query params for filtering
      const { search } = req.query;
      
      // Build where clause
      const whereClause: any = {};
      
      if (search) {
        whereClause.OR = [
          { name: { contains: search as string } },
          { code: { contains: search as string } },
        ];
      }
      
      // For students, show only enrolled courses
      if (decoded.role === 'STUDENT') {
        const courses = await prisma.course.findMany({
          where: {
            enrolledStudents: {
              some: {
                userId: decoded.userId,
              },
            },
            ...whereClause,
          },
          include: {
            _count: {
              select: {
                enrolledStudents: true,
                units: true,
              },
            },
          },
          orderBy: {
            name: 'asc',
          },
        });
        
        return res.status(200).json({ courses });
      }
      
      // For admins, show all courses
      const courses = await prisma.course.findMany({
        where: whereClause,
        include: {
          _count: {
            select: {
              enrolledStudents: true,
              units: true,
            },
          },
        },
        orderBy: {
          name: 'asc',
        },
      });
      
      return res.status(200).json({ courses });
    }
    
    // POST: Create a new course (admin only)
    else if (req.method === 'POST') {
      // Check if user is admin
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }
      
      const { name, code, description } = req.body;
      
      // Validate input
      if (!name || !code) {
        return res.status(400).json({ message: 'Name and code are required' });
      }
      
      // Check if course with this code already exists
      const existingCourse = await prisma.course.findUnique({
        where: { code },
      });
      
      if (existingCourse) {
        return res.status(409).json({ message: 'Course with this code already exists' });
      }
      
      // Create course
      const course = await prisma.course.create({
        data: {
          name,
          code,
          description: description || null,
        },
      });
      
      return res.status(201).json({
        message: 'Course created successfully',
        course,
      });
    }
    
    // Method not allowed
    else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Course operation error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
