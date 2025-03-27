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

  // Get the assignment ID from the URL
  const { id } = req.query;
  const assignmentId = parseInt(id as string);

  if (isNaN(assignmentId)) {
    return res.status(400).json({ message: 'Invalid assignment ID' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };
    
    // GET: Fetch a specific assignment
    if (req.method === 'GET') {
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          unit: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          submissions: {
            where: {
              studentId: decoded.userId,
            },
            select: {
              id: true,
              submittedAt: true,
              fileName: true,
              filePath: true,
              feedback: true,
            },
          },
        },
      });

      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }

      // If user is a student, only return their own submissions
      // If user is an admin, we could optionally include all submissions
      if (decoded.role === 'ADMIN' && !assignment.submissions.length) {
        const allSubmissions = await prisma.submission.findMany({
          where: { assignmentId },
          select: {
            id: true,
            submittedAt: true,
            fileName: true,
            student: {
              select: {
                id: true,
                username: true,
                email: true,
              },
            },
            feedback: true,
          },
        });
        
        assignment.submissions = allSubmissions;
      }

      return res.status(200).json({ assignment });
    }
    
    // PUT: Update a specific assignment (admin only)
    else if (req.method === 'PUT') {
      // Verify user is an admin
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }
      
      const { title, description, unitId, dueDate } = req.body;
      
      // Validate required fields
      if (!title) {
        return res.status(400).json({ message: 'Title is required' });
      }
      
      // If unitId is provided, check if unit exists
      if (unitId) {
        const unitExists = await prisma.unit.findUnique({
          where: { id: parseInt(unitId) },
        });
        
        if (!unitExists) {
          return res.status(404).json({ message: 'Unit not found' });
        }
      }
      
      // Check if assignment exists
      const existingAssignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
      });
      
      if (!existingAssignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      // Update the assignment
      const updatedAssignment = await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          title,
          description: description ?? null,
          unitId: unitId ? parseInt(unitId) : undefined,
          dueDate: dueDate ? new Date(dueDate) : null,
        },
      });
      
      return res.status(200).json({
        message: 'Assignment updated successfully',
        assignment: updatedAssignment,
      });
    }
    
    // DELETE: Delete a specific assignment (admin only)
    else if (req.method === 'DELETE') {
      // Verify user is an admin
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }
      
      // Check if assignment exists
      const existingAssignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          submissions: true,
        },
      });
      
      if (!existingAssignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      // Optional: Warn if assignment has submissions
      if (existingAssignment.submissions.length > 0) {
        // You could either prevent deletion or cascade delete
        // For this implementation, we'll warn but proceed with deletion
        console.warn(`Deleting assignment ${assignmentId} with ${existingAssignment.submissions.length} submissions`);
      }
      
      // Delete the assignment (cascade delete will handle submissions)
      await prisma.assignment.delete({
        where: { id: assignmentId },
      });
      
      return res.status(200).json({ message: 'Assignment deleted successfully' });
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
