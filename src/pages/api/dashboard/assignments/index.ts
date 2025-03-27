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

    // GET: List assignments
    if (req.method === 'GET') {
      // Extract query parameters for filtering
      const { unitId, title } = req.query;
      
      // Build where clause based on query parameters
      const whereClause: any = {};
      
      if (unitId) {
        whereClause.unitId = parseInt(unitId as string);
      }
      
      if (title) {
        whereClause.title = {
          contains: title as string,
        };
      }
      
      // Fetch assignments with filters
      const assignments = await prisma.assignment.findMany({
        where: whereClause,
        include: {
          unit: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          _count: {
            select: {
              submissions: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      });
      
      return res.status(200).json({ assignments });
    }
    
    // POST: Create a new assignment (admin only)
    else if (req.method === 'POST') {
      // Verify user is an admin
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }
      
      const { title, description, unitId, dueDate } = req.body;
      
      // Validate required fields
      if (!title || !unitId) {
        return res.status(400).json({ message: 'Title and unit ID are required' });
      }
      
      // Check if unit exists
      const unitExists = await prisma.unit.findUnique({
        where: { id: parseInt(unitId) },
      });
      
      if (!unitExists) {
        return res.status(404).json({ message: 'Unit not found' });
      }
      
      // Create the assignment
      const assignment = await prisma.assignment.create({
        data: {
          title,
          description: description || null,
          unitId: parseInt(unitId),
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });
      
      return res.status(201).json({
        message: 'Assignment created successfully',
        assignment,
      });
    }
    
    // Other methods not allowed
    else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Assignment operation error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
