import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Verify authorization
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  // Extract unit ID from URL
  const { id } = req.query;
  const unitId = id as string;

  if (!unitId) {
    return res.status(400).json({ message: 'Invalid unit ID' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };

    // Check if unit exists
    const unit = await prisma.unit.findUnique({
      where: { id: unitId},
      include: {
        course: true,
        assignments: true
      }
    });

    if (!unit) {
      return res.status(404).json({ message: 'Unit not found' });
    }

    // Check if user is super admin or admin
    const isSuperAdmin = decoded.role === 'SUPER_ADMIN';
    const isAdmin = decoded.role === 'ADMIN';
    const hasAdminPrivileges = isSuperAdmin || isAdmin;

    // GET: Fetch unit details
    if (req.method === 'GET') {
      return res.status(200).json({ unit });
    }
    
    // PUT: Update unit (admin or super admin)
    else if (req.method === 'PUT') {
      if (!hasAdminPrivileges) {
        return res.status(403).json({ 
          message: 'Access denied. Only admins or super admins can update units.' 
        });
      }

      const { code, name, description } = req.body;
      
      // If changing code, check it's not already taken
      if (code && code !== unit.code) {
        const existingUnit = await prisma.unit.findUnique({
          where: { code }
        });
        
        if (existingUnit) {
          return res.status(409).json({ message: 'Unit with this code already exists' });
        }
      }
      
      // Update the unit
      const updatedUnit = await prisma.unit.update({
        where: { id: unitId },
        data: {
          name: name || unit.name,
          code: code || unit.code,
          description: description !== undefined ? description : unit.description,
        },
      });
      
      return res.status(200).json({
        message: 'Unit updated successfully',
        unit: updatedUnit,
      });
    }
    
    // DELETE: Remove unit (admin or super admin)
    else if (req.method === 'DELETE') {
      if (!hasAdminPrivileges) {
        return res.status(403).json({ 
          message: 'Access denied. Only admins or super admins can delete units.' 
        });
      }
      
      // Check if unit has assignments
      // if (unit.assignments && unit.assignments.length > 0) {
      //   return res.status(409).json({ 
      //     message: 'Cannot delete unit with existing assignments. Delete the assignments first.' 
      //   });
      // }
      
      // Delete the unit
      await prisma.unit.delete({
        where: { id:  unitId },
      });
      
      return res.status(200).json({
        message: 'Unit deleted successfully',
      });
    }
    
    // Other methods not allowed
    else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Unit operation error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
