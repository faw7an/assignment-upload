import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const updateProfileSchema = z.object({
  username: z.string().min(3, 'Username too short').max(30, 'Username too long').optional(),
  email: z.string().email('Invalid email format').optional(),
}).refine(data => data.username || data.email, {
  message: 'At least username or email must be provided for update',
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ message: 'Authentication context missing' });
  }
  if (req.method === 'GET') {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
  } else if (req.method === 'PUT' || req.method === 'PATCH') {
    const validationResult = updateProfileSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ errors: validationResult.error.flatten().fieldErrors });
    }
    const { username, email } = validationResult.data;
    if (username) {
      const existingUser = await prisma.user.findFirst({
        where: { username, id: { not: userId } },
      });
      if (existingUser) {
        return res.status(409).json({ message: 'Username already taken' });
      }
    }
    if (email) {
      const existingUser = await prisma.user.findFirst({
        where: { email, id: { not: userId } },
      });
      if (existingUser) {
        return res.status(409).json({ message: 'Email already taken' });
      }
    }
    try {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
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
      return res.status(200).json({ message: 'Profile updated successfully', user: updatedUser });
    } catch (error) {
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
