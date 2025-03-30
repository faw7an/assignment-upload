import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify authorization
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Extract course ID from URL
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Course ID is required' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: id as string },
      include: {
        courseAdmin: {
          select: {
            id: true,
            username: true,
            email: true
          }
        }
      }
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is system admin or course admin
    const isSystemAdmin = decoded.role === 'ADMIN';
    const isCourseAdmin = course.courseAdminId === decoded.userId;

    // GET: Fetch course details
    if (req.method === 'GET') {
      // Include additional information for admins
      if (isSystemAdmin || isCourseAdmin) {
        const fullCourse = await prisma.course.findUnique({
          where: { id: id as string },
          include: {
            courseAdmin: {
              select: {
                id: true,
                username: true,
                email: true
              }
            },
            enrolledStudents: {
              include: {
                user: {
                  select: {
                    id: true,
                    username: true,
                    email: true
                  }
                }
              }
            },
            courseUnits: true
          }
        });
        
        return res.status(200).json({ course: fullCourse });
      }
      
      return res.status(200).json({ course });
    }
    
    // PUT: Update course (admin or course admin only)
    else if (req.method === 'PUT') {
      if (!isSystemAdmin && !isCourseAdmin) {
        return res.status(403).json({ 
          message: 'Access denied. Only course admins or system admins can update courses.' 
        });
      }

      const { name, code, description } = req.body;
      
      // If changing code, check it's not already taken
      if (code && code !== course.code) {
        const existingCourse = await prisma.course.findUnique({
          where: { code }
        });
        
        if (existingCourse) {
          return res.status(409).json({ message: 'Course with this code already exists' });
        }
      }
      
      // Update the course
      const updatedCourse = await prisma.course.update({
        where: { id: id as string },
        data: {
          name: name || course.name,
          code: code || course.code,
          description: description !== undefined ? description : course.description,
        },
      });
      
      return res.status(200).json({
        message: 'Course updated successfully',
        course: updatedCourse,
      });
    }
    
    // DELETE: Remove course (system admin or course admin only)
    else if (req.method === 'DELETE') {
      if (!isSystemAdmin && !isCourseAdmin) {
        return res.status(403).json({ 
          message: 'Access denied. Only course admins or system admins can delete courses.' 
        });
      }
      
      // Delete the course
      await prisma.course.delete({
        where: { id: id as string },
      });
      
      return res.status(200).json({
        message: 'Course deleted successfully',
      });
    }
    
    // Other methods not allowed
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
