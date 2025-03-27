import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract token from Authorization header
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Get the unit ID from the URL
  const { id } = req.query;
  const unitId = parseInt(id as string);

  if (isNaN(unitId)) {
    return res.status(400).json({ message: 'Invalid unit ID' });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };
    
    // GET: Fetch a specific unit (available to all authenticated users)
    if (req.method === 'GET') {
      const unit = await prisma.unit.findUnique({
        where: { id: unitId },
      });

      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }

      return res.status(200).json({ unit });
    }
    
    // PUT: Update a unit (admin only)
    else if (req.method === 'PUT') {
      // Check if user is admin
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }

      const { code, name, description } = req.body;

      // Validate required fields
      if (!code || !name) {
        return res.status(400).json({ message: 'Unit code and name are required' });
      }

      // Check if another unit with this code exists (excluding current unit)
      const existingUnit = await prisma.unit.findFirst({
        where: {
          code,
          id: { not: unitId },
        },
      });

      if (existingUnit) {
        return res.status(409).json({ message: 'Another unit with this code already exists' });
      }

      const updatedUnit = await prisma.unit.update({
        where: { id: unitId },
        data: {
          code,
          name,
          description: description || null,
        },
      });

      return res.status(200).json({
        message: 'Unit updated successfully',
        unit: updatedUnit,
      });
    }
    
    // DELETE: Delete a unit (admin only)
    else if (req.method === 'DELETE') {
      // Check if user is admin
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }

      // Check if unit exists
      const unit = await prisma.unit.findUnique({
        where: { id: unitId },
        include: { assignments: true },
      });

      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }

      // Check if unit has assignments
      if (unit.assignments.length > 0) {
        return res.status(400).json({ 
          message: 'Cannot delete unit with existing assignments. Remove all assignments first.' 
        });
      }

      // Delete the unit
      await prisma.unit.delete({
        where: { id: unitId },
      });

      return res.status(200).json({ message: 'Unit deleted successfully' });
    }
    
    // Other methods not allowed
    else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Unit Operation Error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
