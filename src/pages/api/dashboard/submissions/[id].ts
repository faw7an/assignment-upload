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

  // Extract submission ID from URL
  const { id } = req.query;
  const submissionId = parseInt(id as string);

  if (isNaN(submissionId)) {
    return res.status(400).json({ message: 'Invalid submission ID' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };

    // Check if submission exists and get related information
    const submission = await prisma.submission.findUnique({
      where: { id: submissionId },
      include: {
        student: {
          select: {
            id: true,
            username: true,
            email: true,
          },
        },
        assignment: {
          include: {
            unit: {
              include: {
                course: true
              }
            }
          }
        }
      }
    });

    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Check if user has permission to access this submission
    const isSystemAdmin = decoded.role === 'ADMIN';
    const isCourseAdmin = submission.assignment.unit.course.courseAdminId === decoded.userId;
    const isSubmissionOwner = submission.studentId === decoded.userId;

    if (!isSystemAdmin && !isCourseAdmin && !isSubmissionOwner) {
      return res.status(403).json({ 
        message: 'Access denied. You do not have permission to access this submission.' 
      });
    }

    // GET: Fetch submission details
    if (req.method === 'GET') {
      return res.status(200).json({ submission });
    }
    
    // PUT: Update submission (admin or course admin only)
    else if (req.method === 'PUT') {
      // Only admins and course admins can grade/provide feedback
      if (!isSystemAdmin && !isCourseAdmin) {
        return res.status(403).json({ 
          message: 'Access denied. Only course admins or system admins can update submissions.' 
        });
      }

      const { feedback } = req.body;
      
      // Update the submission with feedback
      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          feedback: feedback !== undefined ? feedback : submission.feedback,
        },
      });
      
      return res.status(200).json({
        message: 'Submission updated successfully',
        submission: updatedSubmission,
      });
    }
    
    // DELETE: Delete submission (admin, course admin, or submission owner)
    else if (req.method === 'DELETE') {
      if (!isSystemAdmin && !isCourseAdmin && !isSubmissionOwner) {
        return res.status(403).json({ 
          message: 'Access denied. You do not have permission to delete this submission.' 
        });
      }
      
      // Delete the submission
      await prisma.submission.delete({
        where: { id: submissionId },
      });
      
      return res.status(200).json({
        message: 'Submission deleted successfully',
      });
    }
    
    // Other methods not allowed
    else {
      return res.status(405).json({ message: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Submission operation error:', error);
    if ((error as Error).name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Internal server error' });
  } finally {
    await prisma.$disconnect();
  }
}
