import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const createCourseSchema = z.object({
  code: z.string().min(1, 'Course code is required').max(20, 'Code too long'),
  name: z.string().min(1, 'Course name is required').max(100, 'Name too long'),
  description: z.string().optional().nullable(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  const userId = req.headers['x-user-id'] as string;
  const userRole = req.headers['x-user-role'] as string;

  console.log('User ID:', userId);
  console.log('User Role:', userRole);
  if (!userId || !userRole) {
    return res.status(401).json({ message: 'Authentication context missing' });
  }
  if (userRole !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Access Denied: Only Super Admins can create courses.' });
  }

  const validationResult = createCourseSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ errors: validationResult.error.flatten().fieldErrors });
  }
  const { code, name, description } = validationResult.data;

  try {
    const existingCourse = await prisma.course.findUnique({ where: { code } });
    if (existingCourse) {
      return res.status(409).json({ message: 'Course with this code already exists' });
    }
    const course = await prisma.course.create({
      data: {
        code,
        name,
        description: description || null,
        courseAdminId: userId
      },
    });
    return res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create Course Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
