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
    
    const { code, name, description } = req.body;

    // Validate input
    if (!code || !name) {
      return res.status(400).json({ message: 'Course code and name are required' });
    }

    // Check if course with this code already exists
    const existingCourse = await prisma.course.findUnique({
      where: { code },
    });

    if (existingCourse) {
      return res.status(409).json({ message: 'Course with this code already exists' });
    }

    // Create the course with the authenticated user as the course admin
    const course = await prisma.course.create({
      data: {
        code,
        name,
        description: description || null,
        courseAdminId: decoded.userId
      },
    });

    return res.status(201).json({
      message: 'Course created successfully',
      course,
    });
  } catch (error) {
    console.error('Create Course Error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
