import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';
import jwt from 'jsonwebtoken';


const updateCourseSchema = z.object({
  code: z.string().min(1).max(20).optional(),
  name: z.string().min(1).max(100).optional(),
  description: z.string().nullable().optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field (code, name, description) must be provided for update',
});
const mongoIdQuerySchema = z.object({
  id: z.string().uuid('Invalid Course ID format'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: string; role: string };

    // Check if user is SUPER_ADMIN
    const isSuperAdmin = decoded.role === 'SUPER_ADMIN';
    if (!isSuperAdmin) {
      return res.status(403).json({ message: 'Access Denied: Only Super Admins can create courses.' });
    }

  const queryResult = mongoIdQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    return res.status(400).json({ errors: queryResult.error.flatten().fieldErrors });
  }
  const { id } = queryResult.data;
  const course = await prisma.course.findUnique({
    where: { id },
  });
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }

  
  if (req.method === 'GET') {
    return res.status(200).json({ course });
  } else if (req.method === 'PUT') {
    if (!isSuperAdmin) {
      return res.status(403).json({ message: 'Access Denied: Only Super Admins can update this course.' });
    }
    const validationResult = updateCourseSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ errors: validationResult.error.flatten().fieldErrors });
    }
    const { name, code, description } = validationResult.data;
    if (code && code !== course.code) {
      const existingCourse = await prisma.course.findUnique({ where: { code } });
      if (existingCourse) {
        return res.status(409).json({ message: 'Course with this code already exists' });
      }
    }
    try {
      const updatedCourse = await prisma.course.update({
        where: { id },
        data: {
          ...(name !== undefined && { name }),
          ...(code !== undefined && { code }),
          ...(description !== undefined && { description }),
        },
      });
      return res.status(200).json({ message: 'Course updated successfully', course: updatedCourse });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'DELETE') {
    if (!isSuperAdmin) {
      return res.status(403).json({ message: 'Access Denied: Only Super Admins can delete this course.' });
    }
    try {
      // First find all units associated with the course
      const associatedUnits = await prisma.unit.findMany({
        where: { courseId: id },
        select: { id: true }
      });
      
      // Delete all assignments related to these units
      if (associatedUnits.length > 0) {
        const unitIds = associatedUnits.map(unit => unit.id);
        await prisma.assignment.deleteMany({
          where: { unitId: { in: unitIds } }
        });
      }
      
      // Now delete all units associated with the course
      await prisma.unit.deleteMany({
        where: { courseId: id }
      });
      
      // Finally delete the course itself
      await prisma.course.delete({ where: { id } });
      
      return res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
      console.error('Error deleting course:', error);
      return res.status(500).json({ 
        message: 'Internal server error', 
        error: error instanceof Error ? error.message : 'Unknown error' 
      });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
