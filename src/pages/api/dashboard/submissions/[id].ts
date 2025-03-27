import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

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

  // Get the submission ID from the URL
  const { id } = req.query;
  const submissionId = parseInt(id as string);

  if (isNaN(submissionId)) {
    return res.status(400).json({ message: 'Invalid submission ID' });
  }

  try {
    // Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };
    
    // GET: Download or view submission details
    if (req.method === 'GET') {
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
              unit: true,
            },
          },
        },
      });

      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }

      // Check permissions: only admin or the student who submitted can access
      if (decoded.role !== 'ADMIN' && submission.studentId !== decoded.userId) {
        return res.status(403).json({ message: 'Access denied' });
      }

      // Check if the download parameter is present
      const download = req.query.download === 'true';
      
      if (download) {
        // Serve the file for download
        const filePath = path.join(process.cwd(), submission.filePath);
        
        if (!fs.existsSync(filePath)) {
          return res.status(404).json({ message: 'File not found' });
        }
        
        const fileContents = fs.readFileSync(filePath);
        
        res.setHeader('Content-Type', submission.fileType || 'application/octet-stream');
        res.setHeader('Content-Disposition', `attachment; filename=${submission.fileName}`);
        
        return res.send(fileContents);
      }
      
      // Just return submission details
      return res.status(200).json({ submission });
    }
    
    // PUT: Add feedback (admin only)
    else if (req.method === 'PUT') {
      // Verify user is an admin
      if (decoded.role !== 'ADMIN') {
        return res.status(403).json({ message: 'Access denied. Admins only.' });
      }
      
      const { feedback } = req.body;
      
      if (feedback === undefined) {
        return res.status(400).json({ message: 'Feedback is required' });
      }
      
      // Check if submission exists
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
      });
      
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      
      // Update the submission with feedback
      const updatedSubmission = await prisma.submission.update({
        where: { id: submissionId },
        data: {
          feedback,
        },
      });
      
      return res.status(200).json({
        message: 'Feedback provided successfully',
        submission: updatedSubmission,
      });
    }
    
    // DELETE: Delete a submission (admin or owner)
    else if (req.method === 'DELETE') {
      // Fetch the submission
      const submission = await prisma.submission.findUnique({
        where: { id: submissionId },
      });
      
      if (!submission) {
        return res.status(404).json({ message: 'Submission not found' });
      }
      
      // Check permissions: only admin or the student who submitted can delete
      if (decoded.role !== 'ADMIN' && submission.studentId !== decoded.userId) {
        return res.status(403).json({ message: 'Access denied' });
      }
      
      // Delete the file
      const filePath = path.join(process.cwd(), submission.filePath);
      
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      
      // Delete the submission record
      await prisma.submission.delete({
        where: { id: submissionId },
      });
      
      return res.status(200).json({ message: 'Submission deleted successfully' });
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
