import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };
    
    // GET: Fetch current user profile
    if (req.method === 'GET') {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isVerified: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }

      return res.status(200).json({ user });
    }
    
    // PUT/PATCH: Update user profile
    else if (req.method === 'PUT' || req.method === 'PATCH') {
      const { username, email } = req.body;
      
      // Validate input
      if (!username && !email) {
        return res.status(400).json({ message: 'No fields to update' });
      }

      // Check if new username is already taken
      if (username) {
        const existingUser = await prisma.user.findFirst({
          where: {
            username,
            id: { not: decoded.userId },
          },
        });

        if (existingUser) {
          return res.status(409).json({ message: 'Username already taken' });
        }
      }

      // Check if new email is already taken
      if (email) {
        const existingUser = await prisma.user.findFirst({
          where: {
            email,
            id: { not: decoded.userId },
          },
        });

        if (existingUser) {
          return res.status(409).json({ message: 'Email already taken' });
        }
      }

      // Update user
      const updatedUser = await prisma.user.update({
        where: { id: decoded.userId },
        data: {
          ...(username && { username }),
          ...(email && { email }),
        },
        select: {
          id: true,
          username: true,
          email: true,
          role: true,
          isVerified: true,
          updatedAt: true,
        },
      });

      return res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedUser,
      });
    }
    
    // Method not allowed
    else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Profile operation error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
