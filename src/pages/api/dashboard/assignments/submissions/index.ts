import { PrismaClient } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

// Disable the default body parser to handle file uploads
export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
const UPLOAD_DIR = path.join(process.cwd(), 'uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Authentication required' });
  }

  if (req.method === 'POST') {
    try {
      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };
      
      // Parse form data with file upload
      const form = formidable({
        uploadDir: UPLOAD_DIR,
        keepExtensions: true,
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
      });
      
      const [fields, files] = await new Promise<[formidable.Fields, formidable.Files]>((resolve, reject) => {
        form.parse(req, (err, fields, files) => {
          if (err) reject(err);
          resolve([fields, files]);
        });
      });
      
      const assignmentId = parseInt(fields.assignmentId as string);
      
      if (isNaN(assignmentId)) {
        return res.status(400).json({ message: 'Invalid assignment ID' });
      }
      
      // Check if assignment exists and get course information
      const assignment = await prisma.assignment.findUnique({
        where: { id: assignmentId },
        include: {
          unit: {
            include: {
              course: true
            }
          },
        },
      });
      
      if (!assignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
      
      // For regular students (not admin), check if they're enrolled in the course
      const isSystemAdmin = decoded.role === 'ADMIN';
      const isCourseAdmin = assignment.unit.course.courseAdminId === decoded.userId;
      
      if (!isSystemAdmin && !isCourseAdmin) {
        // Check if student is enrolled in the course
        const enrollment = await prisma.userCourse.findUnique({
          where: {
            userId_courseId: {
              userId: decoded.userId,
              courseId: assignment.unit.course.id,
            },
          },
        });
        
        if (!enrollment) {
          return res.status(403).json({ 
            message: 'You must be enrolled in this course to submit assignments.' 
          });
        }
      }
      
      // Check if due date has passed
      if (assignment.dueDate && new Date() > assignment.dueDate) {
        return res.status(400).json({ message: 'Submission deadline has passed' });
      }
      
      // Handle file upload - The file might be under a different key than 'file'
      console.log('Files received:', Object.keys(files));
      
      // Get the first file regardless of key name
      const fileKey = Object.keys(files)[0];
      const file = files[fileKey] as formidable.File;
      
      // If it's an array, take the first item
      const actualFile = Array.isArray(file) ? file[0] : file;
      
      if (!actualFile) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      
      console.log('File details:', {
        keys: Object.keys(actualFile),
        filepath: actualFile.filepath,
        mimetype: actualFile.mimetype,
        originalFilename: actualFile.originalFilename
      });
      
      // Create submission record
      const submission = await prisma.submission.create({
        data: {
          assignmentId,
          studentId: decoded.userId,
          fileName: actualFile.originalFilename || 'unnamed-file',
          filePath: path.relative(process.cwd(), actualFile.filepath),
          fileType: actualFile.mimetype || null,
        },
      });
      
      return res.status(201).json({
        message: 'Assignment submitted successfully',
        submission: {
          id: submission.id,
          fileName: submission.fileName,
          submittedAt: submission.submittedAt,
        },
      });
    } catch (error) {
      console.error('Submission error:', error);
      if ((error as Error).name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    } finally {
      await prisma.$disconnect();
    }
  } else if (req.method === 'GET') {
    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };
      
      // Extract query parameters for filtering
      const { assignmentId } = req.query;
      
      if (!assignmentId) {
        return res.status(400).json({ message: 'Assignment ID is required' });
      }
      
      // Get assignment with its course information
      const assignment = await prisma.assignment.findUnique({
        where: { id: parseInt(assignmentId as string) },
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
      
      // Check if user is system admin, course admin, or the student viewing their own submissions
      const isSystemAdmin = decoded.role === 'ADMIN';
      const isCourseAdmin = assignment.unit.course.courseAdminId === decoded.userId;
      
      // For regular students, only allow viewing their own submissions
      // For course admins and system admins, allow viewing all submissions
      const whereClause: any = {
        assignmentId: parseInt(assignmentId as string)
      };
      
      if (!isSystemAdmin && !isCourseAdmin) {
        whereClause.studentId = decoded.userId;
      }
      
      // Fetch submissions
      const submissions = await prisma.submission.findMany({
        where: whereClause,
        include: {
          student: {
            select: {
              id: true,
              username: true,
              email: true,
            },
          },
        },
        orderBy: {
          submittedAt: 'desc',
        },
      });
      
      return res.status(200).json({ submissions });
    } catch (error) {
      console.error('Fetch Submissions Error:', error);
      if ((error as Error).name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
      }
      return res.status(500).json({ message: 'Internal server error' });
    } finally {
      await prisma.$disconnect();
    }
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
