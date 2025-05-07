import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';

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

  // Extract assignment ID from URL
  const { id } = req.query;
  const assignmentId = parseInt(id as string);

  if (isNaN(assignmentId)) {
    return res.status(400).json({ message: 'Invalid assignment ID' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };

    // Check if assignment exists and get its unit and course info
    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
      include: {
        unit: {
          include: {
            course: true
          }
        }
      }
    });

    if (!assignment) {
      return res.status(404).json({ message: 'Assignment not found' });
    }

    // Check if user is system admin or course admin
    const isSystemAdmin = decoded.role === 'ADMIN';
    const isCourseAdmin = assignment.unit.course && assignment.unit.course.courseAdminId === decoded.userId;

    // GET: Fetch assignment details
    if (req.method === 'GET') {
      return res.status(200).json({ assignment });
    }
    
    // PUT: Update assignment (admin or course admin only)
    else if (req.method === 'PUT') {
      if (!isSystemAdmin && !isCourseAdmin) {
        return res.status(403).json({ 
          message: 'Access denied. Only course admins or system admins can update assignments.' 
        });
      }

      const { title, description, dueDate } = req.body;
      
      // Update the assignment
      const updatedAssignment = await prisma.assignment.update({
        where: { id: assignmentId },
        data: {
          title: title || assignment.title,
          description: description !== undefined ? description : assignment.description,
          dueDate: dueDate ? new Date(dueDate) : assignment.dueDate,
        },
      });
      
      return res.status(200).json({
        message: 'Assignment updated successfully',
        assignment: updatedAssignment,
      });
    }
    
    // DELETE: Remove assignment (admin or course admin only)
    else if (req.method === 'DELETE') {
      if (!isSystemAdmin && !isCourseAdmin) {
        return res.status(403).json({ 
          message: 'Access denied. Only course admins or system admins can delete assignments.' 
        });
      }
      
      // Delete the assignment
      await prisma.assignment.delete({
        where: { id: assignmentId },
      });
      
      return res.status(200).json({
        message: 'Assignment deleted successfully',
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