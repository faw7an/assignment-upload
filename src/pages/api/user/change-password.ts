import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import bcrypt from 'bcrypt';
import { z } from 'zod';

const SALT_ROUNDS = 12;
const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password required'),
  newPassword: z.string().min(8, 'New password must be at least 8 characters'),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }
  const userId = req.headers['x-user-id'] as string;
  if (!userId) {
    return res.status(401).json({ message: 'Authentication context missing' });
  }
  const validationResult = changePasswordSchema.safeParse(req.body);
  if (!validationResult.success) {
    return res.status(400).json({ errors: validationResult.error.flatten().fieldErrors });
  }
  const { currentPassword, newPassword } = validationResult.data;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, passwordHash: true },
  });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  const isPasswordValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isPasswordValid) {
    return res.status(401).json({ message: 'Current password is incorrect' });
  }
  const hashedPassword = await bcrypt.hash(newPassword, SALT_ROUNDS);
  try {
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });
    return res.status(200).json({ message: 'Password changed successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
}
