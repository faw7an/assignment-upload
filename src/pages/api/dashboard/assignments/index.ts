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
      const { unitId, title, courseId } = req.query;
      
      // Build where clause based on query parameters
      let whereClause: any = {};
      
      if (unitId) {
        whereClause.unitId = parseInt(unitId as string);
      }
      
      if (title) {
        whereClause.title = {
          contains: title as string,
        };
      }
      
      // For regular students, only show assignments from enrolled courses
      const isSystemAdmin = decoded.role === 'ADMIN';
      
      if (!isSystemAdmin) {
        // Get all courses where the user is enrolled or is the admin
        const userCourses = await prisma.course.findMany({
          where: {
            OR: [
              {
                courseAdminId: decoded.userId,
              },
              {
                enrolledStudents: {
                  some: {
                    userId: decoded.userId,
                  },
                },
              },
            ],
          },
          select: {
            id: true,
          },
        });
        
        const userCourseIds = userCourses.map(course => course.id);
        
        // If specific courseId is requested, check if user has access to it
        if (courseId) {
          if (!userCourseIds.includes(courseId as string)) {
            return res.status(403).json({ 
              message: 'You do not have access to this course.' 
            });
          }
          
          // Find units in this course
          const courseUnits = await prisma.unit.findMany({
            where: {
              courseId: courseId as string,
            },
            select: {
              id: true,
            },
          });
          
          const unitIds = courseUnits.map(unit => unit.id);
          
          // Add to whereClause
          if (unitId) {
            // If unitId is specified, make sure it belongs to an accessible course
            const unitIdNum = parseInt(unitId as string);
            if (!unitIds.includes(unitIdNum)) {
              return res.status(403).json({ 
                message: 'You do not have access to this unit.' 
              });
            }
          } else {
            // Otherwise filter by all units in the course
            whereClause.unitId = {
              in: unitIds,
            };
          }
        } else {
          // Get all units from accessible courses
          const accessibleUnits = await prisma.unit.findMany({
            where: {
              courseId: {
                in: userCourseIds,
              },
            },
            select: {
              id: true,
            },
          });
          
          const accessibleUnitIds = accessibleUnits.map(unit => unit.id);
          
          // Filter assignments by accessible units
          if (unitId) {
            const unitIdNum = parseInt(unitId as string);
            if (!accessibleUnitIds.includes(unitIdNum)) {
              return res.status(403).json({ 
                message: 'You do not have access to this unit.' 
              });
            }
          } else {
            whereClause.unitId = {
              in: accessibleUnitIds,
            };
          }
        }
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
              course: {
                select: {
                  id: true,
                  name: true,
                  code: true
                }
              }
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
    
    // POST: Create a new assignment (admin or course admin only)
    else if (req.method === 'POST') {
      const { title, description, unitId, dueDate } = req.body;
      
      // Validate required fields
      if (!title || !unitId) {
        return res.status(400).json({ message: 'Title and unit ID are required' });
      }
      
      // Check if unit exists and get its course
      const unit = await prisma.unit.findUnique({
        where: { id: parseInt(unitId) },
        include: {
          course: true
        }
      });
      
      if (!unit) {
        return res.status(404).json({ message: 'Unit not found' });
      }
      
      // Check if user is system admin or course admin
      const isSystemAdmin = decoded.role === 'ADMIN';
      const isCourseAdmin = unit.course.courseAdminId === decoded.userId;
      
      if (!isSystemAdmin && !isCourseAdmin) {
        return res.status(403).json({ 
          message: 'Access denied. Only course admins or system admins can create assignments.' 
        });
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
