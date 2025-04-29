import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import jwt from 'jsonwebtoken';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET;

// Validation schema for assignment creation
const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional().nullable(),
  unitId: z.number().int().positive('Unit ID must be a positive integer'),
  dueDate: z.string().optional().nullable().transform(val => val ? new Date(val) : null)
});

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Extract user ID and role from headers or token
  let userId = req.headers['x-user-id'] as string;
  let userRole = req.headers['x-user-role'] as string;

  // Fallback to token if middleware headers are not available
  if (!userId || !userRole) {
    const authHeader = req.headers.authorization;
    const token = authHeader?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET as string) as { userId: string; role: string };
      userId = decoded.userId;
      userRole = decoded.role;
    } catch (error) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  }

  try {
    // GET: List assignments
    if (req.method === 'GET') {
      // Extract query parameters for filtering
      const { 
        unitId, 
        title, 
        courseId, 
        description, 
        dueBefore, 
        dueAfter,
        status 
      } = req.query;
      
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

      if (description) {
        whereClause.description = {
          contains: description as string,
        };
      }
      
      // Handle date filters
      const dateFilters: any = {};
      
      if (dueBefore) {
        dateFilters.lt = new Date(dueBefore as string);
      }
      
      if (dueAfter) {
        dateFilters.gt = new Date(dueAfter as string);
      }
      
      if (Object.keys(dateFilters).length > 0) {
        whereClause.dueDate = dateFilters;
      }
      
      // Handle status filter
      if (status) {
        const now = new Date();
        
        if (status === 'upcoming') {
          // Due date is in the future
          whereClause.dueDate = { 
            ...(whereClause.dueDate || {}), 
            gt: now 
          };
        } else if (status === 'past') {
          // Due date is in the past
          whereClause.dueDate = { 
            ...(whereClause.dueDate || {}), 
            lt: now 
          };
        }
      }
      
      // For regular students, only show assignments from enrolled courses
      const isSuperAdmin = userRole === 'SUPER_ADMIN';
      const isAdmin = userRole === 'ADMIN';
      
      if (!isSuperAdmin && !isAdmin) {
        // Get all courses where the user is enrolled or is the admin
        const userCourses = await prisma.course.findMany({
          where: {
            OR: [
              {
                courseAdminId: userId,
              },
              {
                enrolledStudents: {
                  some: {
                    userId: userId,
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
      } else if (isAdmin && !isSuperAdmin) {
        // If user is ADMIN (but not SUPER_ADMIN), only show assignments from their courses
        const adminCourses = await prisma.course.findMany({
          where: {
            courseAdminId: userId
          },
          select: {
            id: true
          }
        });
        
        const adminCourseIds = adminCourses.map(course => course.id);
        
        // Get all units from admin's courses
        const adminUnits = await prisma.unit.findMany({
          where: {
            courseId: {
              in: adminCourseIds
            }
          },
          select: {
            id: true
          }
        });
        
        const adminUnitIds = adminUnits.map(unit => unit.id);
        
        // If specific unitId is requested, make sure it belongs to one of admin's courses
        if (unitId) {
          const unitIdNum = parseInt(unitId as string);
          if (!adminUnitIds.includes(unitIdNum)) {
            return res.status(403).json({
              message: 'You do not have access to this unit.'
            });
          }
        } else {
          // Filter by all units in admin's courses
          whereClause.unitId = {
            in: adminUnitIds
          };
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
      try {
        // Validate input using Zod
        const validatedData = createAssignmentSchema.parse({
          ...req.body,
          unitId: parseInt(req.body.unitId)
        });
        
        const { title, description, unitId, dueDate } = validatedData;
        
        // --- Permission Check ---
        const unit = await prisma.unit.findUnique({
          where: { id: unitId },
          include: { course: true }
        });
        
        if (!unit || !unit.course) {
          return res.status(404).json({ message: 'Target unit or its associated course not found' });
        }

        const isSuperAdmin = userRole === 'SUPER_ADMIN';
        const isCourseAdmin = userRole === 'ADMIN' && unit.course.courseAdminId === userId;

        if (!isSuperAdmin && !isCourseAdmin) {
          return res.status(403).json({ message: 'Access Denied: Only Super Admins or the relevant Course Admin can create assignments.' });
        }
        // --- End Permission Check ---

        // Create the assignment
        const assignment = await prisma.assignment.create({
          data: {
            title,
            description: description || null,
            unitId: unitId,
            dueDate: dueDate,
          },
        });
        
        return res.status(201).json({
          message: 'Assignment created successfully',
          assignment,
        });
      } catch (error) {
        console.error('Create Assignment Error:', error);
        if (error instanceof z.ZodError) {
          return res.status(400).json({ errors: error.errors });
        }
        throw error; // Re-throw for the outer catch block
      }
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
  }
}
