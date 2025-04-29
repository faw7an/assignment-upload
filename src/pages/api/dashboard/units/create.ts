import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;

// Validation schema using Zod
const unitSchema = z.object({
  code: z.string().min(1, 'Unit code is required'),
  name: z.string().min(1, 'Unit name is required'),
  description: z.string().optional().nullable(),
  courseId: z.string().min(1, 'Course ID is required'),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

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

  try {
    // Validate input using Zod
    const validatedData = unitSchema.parse(req.body);
    const { code, name, description, courseId } = validatedData;

    // --- Permission Check ---
    const course = await prisma.course.findUnique({ 
      where: { id: courseId } 
    });
    
    if (!course) {
      return res.status(404).json({ message: 'Target course not found' });
    }

    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const isCourseAdmin = userRole === 'ADMIN' && course.courseAdminId === userId;

    if (!isSuperAdmin && !isCourseAdmin) {
      return res.status(403).json({ message: 'Access Denied: Only Super Admins or the Course Admin can create units for this course.' });
    }
    // --- End Permission Check ---

    // Check existence
    const existingUnit = await prisma.unit.findUnique({ where: { code } });
    if (existingUnit) {
      return res.status(409).json({ message: 'Unit with this code already exists' });
    }

    const unit = await prisma.unit.create({
      data: {
        code,
        name,
        description: description || null,
        courseId: courseId, // Already validated
      },
    });

    return res.status(201).json({ message: 'Unit created successfully', unit });
  } catch (error) {
    console.error('Create Unit Error:', error);
    if (error instanceof z.ZodError) { 
      return res.status(400).json({ errors: error.errors }); 
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}
