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

  // Get course ID from URL
  const { id } = req.query;
  
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid course ID' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };
    
    // GET: Get course details
    if (req.method === 'GET') {
      // Check if user is enrolled or admin
      if (decoded.role !== 'ADMIN') {
        const enrollment = await prisma.userCourse.findUnique({
          where: {
            userId_courseId: {
              userId: decoded.userId,
              courseId: id,
            },
          },
        });
        
        if (!enrollment) {
          return res.status(403).json({ message: 'Access denied. Not enrolled in this course.' });
        }
      }
      
      const course = await prisma.course.findUnique({
        where: { id },
        include: {
          units: {
            include: {
              unit: true,
            },
          },
          _count: {
            select: {
              enrolledStudents: true,
            },
          },
        },
      });
      
      if (!course) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      return res.status(200).json({ course });
    }
    
    // PUT: Update course details (admin only)
    else if (req.method === 'PUT') {
      // Check if user is admin
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }
      
      const { name, code, description } = req.body;
      
      // Validate input
      if (!name && !code && !description) {
        return res.status(400).json({ message: 'No fields to update' });
      }
      
      // Check if course exists
      const existingCourse = await prisma.course.findUnique({
        where: { id },
      });
      
      if (!existingCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      // Check if new code is already taken
      if (code && code !== existingCourse.code) {
        const codeExists = await prisma.course.findFirst({
          where: {
            code,
            id: { not: id },
          },
        });
        
        if (codeExists) {
          return res.status(409).json({ message: 'Course with this code already exists' });
        }
      }
      
      // Update course
      const updatedCourse = await prisma.course.update({
        where: { id },
        data: {
          ...(name && { name }),
          ...(code && { code }),
          ...(description !== undefined && { description }),
        },
      });
      
      return res.status(200).json({
        message: 'Course updated successfully',
        course: updatedCourse,
      });
    }
    
    // DELETE: Delete course (admin only)
    else if (req.method === 'DELETE') {
      // Check if user is admin
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }
      
      // Check if course exists
      const existingCourse = await prisma.course.findUnique({
        where: { id },
      });
      
      if (!existingCourse) {
        return res.status(404).json({ message: 'Course not found' });
      }
      
      // Delete course (cascade delete will handle relations)
      await prisma.course.delete({
        where: { id },
      });
      
      return res.status(200).json({ message: 'Course deleted successfully' });
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
