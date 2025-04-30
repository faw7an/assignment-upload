import prisma from '@/lib/prisma';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { NextApiRequest, NextApiResponse } from 'next';

// Store your secret in environment variables!
const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is not defined');
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { identifier, password } = req.body; // Use 'identifier' for email or username

    // 1. Validate input
    if (!identifier || !password) {
      return res.status(400).json({ message: 'Missing identifier or password' });
    }

    // 2. Find user by email or username
    const user = await prisma.user.findFirst({
      where: {
        OR: [{ email: identifier }, { username: identifier }],
      },
    });

    if (!user) {
      // Use a generic message to avoid revealing whether the user exists
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3. Compare hashed password
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const payload = {
      userId: user.id,
      role: user.role,
    };

    const token = jwt.sign(payload, JWT_SECRET as string, {
      expiresIn: '200h', 
    });

    return res.status(200).json({ 
      token,
      userRole: user.role 
    });

  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
}