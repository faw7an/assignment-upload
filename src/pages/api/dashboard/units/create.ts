import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };
    
    const { code, name, description, courseId } = req.body;

    // Validate input
    if (!code || !name || !courseId) {
      return res.status(400).json({ message: 'Unit code, name, and course ID are required' });
    }

    // Get the course to check permissions
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    // Check if user is system admin or course admin
    const isSystemAdmin = decoded.role === 'ADMIN';
    const isCourseAdmin = course.courseAdminId === decoded.userId;

    if (!isSystemAdmin && !isCourseAdmin) {
      return res.status(403).json({ message: 'Access denied. Only course admins or system admins can create units.' });
    }

    // Check if unit with this code already exists
    const existingUnit = await prisma.unit.findUnique({
      where: { code },
    });

    if (existingUnit) {
      return res.status(409).json({ message: 'Unit with this code already exists' });
    }

    // Create the unit
    const unit = await prisma.unit.create({
      data: {
        code,
        name,
        description: description || null,
        courseId: courseId,
      },
    });

    return res.status(201).json({
      message: 'Unit created successfully',
      unit,
    });
  } catch (error) {
    console.error('Create Unit Error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
