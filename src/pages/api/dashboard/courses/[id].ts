import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

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
  const userId = req.headers['x-user-id'] as string;
  const userRole = req.headers['x-user-role'] as string;
  if (!userId || !userRole) {
    return res.status(401).json({ message: 'Authentication context missing' });
  }
  const queryResult = mongoIdQuerySchema.safeParse(req.query);
  if (!queryResult.success) {
    return res.status(400).json({ errors: queryResult.error.flatten().fieldErrors });
  }
  const { id } = queryResult.data;
  const course = await prisma.course.findUnique({
    where: { id },
    include: { courseAdmin: true },
  });
  if (!course) {
    return res.status(404).json({ message: 'Course not found' });
  }
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isCourseAdmin = userRole === 'ADMIN' && course.courseAdminId === userId;
  if (req.method === 'GET') {
    if (isSuperAdmin || isCourseAdmin) {
      // ...existing code for full course info...
      // ...existing code...
    }
    return res.status(200).json({ course });
  } else if (req.method === 'PUT') {
    if (!isSuperAdmin && !isCourseAdmin) {
      return res.status(403).json({ message: 'Access Denied: Only Super Admins or the Course Admin can update this course.' });
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
    if (!isSuperAdmin && !isCourseAdmin) {
      return res.status(403).json({ message: 'Access Denied: Only Super Admins or the Course Admin can delete this course.' });
    }
    try {
      await prisma.course.delete({ where: { id } });
      return res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
