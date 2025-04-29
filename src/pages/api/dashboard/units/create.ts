import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const createUnitSchema = z.object({
  code: z.string().min(1, 'Unit code required').max(20),
  name: z.string().min(1, 'Unit name required').max(100),
  description: z.string().optional().nullable(),
  courseId: z.string().uuid('Invalid Course ID format'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const userId = req.headers['x-user-id'] as string;
  const userRole = req.headers['x-user-role'] as string;
  if (!userId || !userRole) {
    return res.status(401).json({ message: 'Authentication context missing' });
  }
  const validationResult = createUnitSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ errors: validationResult.error.flatten().fieldErrors });
  }
  const { code, name, description, courseId } = validationResult.data;
  const course = await prisma.course.findUnique({ where: { id: courseId } });
  if (!course) {
    return res.status(404).json({ message: 'Target course not found' });
  }
  const isSuperAdmin = userRole === 'SUPER_ADMIN';
  const isCourseAdmin = userRole === 'ADMIN' && course.courseAdminId === userId;
  if (!isSuperAdmin && !isCourseAdmin) {
    return res.status(403).json({ message: 'Access Denied: Only Super Admins or the Course Admin can create units for this course.' });
  }
  const existingUnit = await prisma.unit.findUnique({ where: { code } });
  if (existingUnit) {
    return res.status(409).json({ message: 'Unit with this code already exists' });
  }
  try {
    const unit = await prisma.unit.create({
      data: {
        code,
        name,
        description: description || null,
        courseId,
      },
    });
    return res.status(201).json({ message: 'Unit created successfully', unit });
  } catch (error) {
    console.error('Create Unit Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
