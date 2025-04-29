import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;

// Validation schema using Zod
const courseSchema = z.object({
  code: z.string().min(1, 'Course code is required'),
  name: z.string().min(1, 'Course name is required'),
  description: z.string().optional().nullable(),
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Extract token from Authorization header or use X-User headers from middleware
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

  // --- Permission Check ---
  if (userRole !== 'SUPER_ADMIN') {
    return res.status(403).json({ message: 'Access Denied: Only Super Admins can create courses.' });
  }
  // --- End Permission Check ---

  try {
    // Validate input using Zod
    const validatedData = courseSchema.parse(req.body);
    const { code, name, description } = validatedData;

    // Check existence (good practice even with unique constraint)
    const existingCourse = await prisma.course.findUnique({ where: { code } });
    if (existingCourse) {
      return res.status(409).json({ message: 'Course with this code already exists' });
    }

    const course = await prisma.course.create({
      data: {
        code,
        name,
        description: description || null,
        courseAdminId: userId // Assign creator as initial admin
      },
    });

    return res.status(201).json({ message: 'Course created successfully', course });
  } catch (error) {
    console.error('Create Course Error:', error);
    if (error instanceof z.ZodError) { // Handle validation errors
      return res.status(400).json({ errors: error.errors });
    }
    return res.status(500).json({ message: 'Internal server error' });
  }
}
