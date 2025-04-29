import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;

// Validation schema for course updates
const courseUpdateSchema = z.object({
  name: z.string().min(1, 'Course name is required').optional(),
  code: z.string().min(1, 'Course code is required').optional(),
  description: z.string().optional().nullable(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract user ID and role from headers or token
  let userId = req.headers['x-user-id'] as string;
  let userRole = req.headers['x-user-role'] as string;

  // Fallback to token if middleware headers are not available
  if (!userId || !userRole) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };
      userId = decoded.userId;
      userRole = decoded.role;
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }

  // Extract course ID from URL
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ message: 'Course ID is required' });
  }

  try {
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

    // Define permission checks based on new role system
    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const isCourseAdmin = userRole === 'ADMIN' && course.courseAdminId === userId;

    // GET: Fetch course details
    if (req.method === 'GET') {
      // Include additional information for admins
      if (isSuperAdmin || isCourseAdmin) {
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
    
    // PUT: Update course (super_admin or course admin only)
    else if (req.method === 'PUT') {
      // --- Permission Check ---
      if (!isSuperAdmin && !isCourseAdmin) {
        return res.status(403).json({ 
          message: 'Access Denied: Only Super Admins or the Course Admin can update this course.' 
        });
      }
      // --- End Permission Check ---

      try {
        // Validate input using Zod
        const validatedData = courseUpdateSchema.parse(req.body);
        const { name, code, description } = validatedData;
        
        // If changing code, check uniqueness
        if (code && code !== course.code) {
          const existingCourse = await prisma.course.findUnique({ where: { code } });
          if (existingCourse) {
            return res.status(409).json({ message: 'Course with this code already exists' });
          }
        }

        const updatedCourse = await prisma.course.update({
          where: { id: id as string },
          data: {
            // Only update fields that are provided
            ...(name !== undefined && { name }),
            ...(code !== undefined && { code }),
            ...(description !== undefined && { description }),
          },
        });
        
        return res.status(200).json({
          message: 'Course updated successfully',
          course: updatedCourse,
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          return res.status(400).json({ errors: error.errors });
        }
        throw error; // Re-throw for outer catch block
      }
    }
    
    // DELETE: Remove course (super_admin or course admin only)
    else if (req.method === 'DELETE') {
      // --- Permission Check ---
      if (!isSuperAdmin && !isCourseAdmin) {
        return res.status(403).json({ 
          message: 'Access Denied: Only Super Admins or the Course Admin can delete this course.' 
        });
      }
      // --- End Permission Check ---
      
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
  }
}
