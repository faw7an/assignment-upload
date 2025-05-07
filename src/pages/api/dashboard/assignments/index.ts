import prisma from '@/lib/prisma';
import { NextApiRequest, NextApiResponse } from 'next';
import { z } from 'zod';

const createAssignmentSchema = z.object({
  title: z.string().min(1, 'Title required').max(150),
  description: z.string().optional().nullable(),
  unitId: z.string().uuid('Unit ID must be a valid UUID'),
  dueDate: z.coerce.date().optional().nullable(),
});
const getAssignmentsQuerySchema = z.object({
  unitId: z.string().uuid().optional(),
  courseId: z.string().uuid().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  dueBefore: z.coerce.date().optional(),
  dueAfter: z.coerce.date().optional(),
  status: z.enum(['upcoming', 'past']).optional(),
});

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const userId = req.headers['x-user-id'] as string;
  const userRole = req.headers['x-user-role'] as string;
  if (!userId || !userRole) {
    return res.status(401).json({ message: 'Authentication context missing' });
  }
  if (req.method === 'POST') {
    const validationResult = createAssignmentSchema.safeParse(req.body);
    if (!validationResult.success) {
      return res.status(400).json({ errors: validationResult.error.flatten().fieldErrors });
    }
    const { title, description, unitId, dueDate } = validationResult.data;
    const unit = await prisma.unit.findUnique({ where: { id: unitId }, include: { course: true } });
    if (!unit || !unit.course) {
      return res.status(404).json({ message: 'Target unit or its associated course not found' });
    }

    // Allow both ADMIN and SUPER_ADMIN to create assignments
    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const isAdmin = userRole === 'ADMIN';
    const hasAdminPrivileges = isSuperAdmin || isAdmin;

    if (!hasAdminPrivileges) {
      return res.status(403).json({ message: 'Access Denied: Only Admins or Super Admins can create assignments.' });
    }

    try {
      const assignment = await prisma.assignment.create({
        data: {
          title,
          description: description || null,
          unitId,
          dueDate,
        },
      });
      return res.status(201).json({ message: 'Assignment created successfully', assignment });
    } catch (error) {
      console.error('Create Assignment Error:', error);
      return res.status(500).json({ message: 'Internal server error' });
    }
  } else if (req.method === 'GET') {
    const queryResult = getAssignmentsQuerySchema.safeParse(req.query);
    if (!queryResult.success) {
      return res.status(400).json({ errors: queryResult.error.flatten().fieldErrors });
    }
    const {
      unitId,
      courseId,
      title,
      description,
      dueBefore,
      dueAfter,
      status,
    } = queryResult.data;

    const whereClause: any = {};

    if (unitId) {
      whereClause.unitId = unitId;
    }

    if (title) {
      whereClause.title = {
        contains: title,
      };
    }

    if (description) {
      whereClause.description = {
        contains: description,
      };
    }

    const dateFilters: any = {};

    if (dueBefore) {
      dateFilters.lt = dueBefore;
    }

    if (dueAfter) {
      dateFilters.gt = dueAfter;
    }

    if (Object.keys(dateFilters).length > 0) {
      whereClause.dueDate = dateFilters;
    }

    if (status) {
      const now = new Date();

      if (status === 'upcoming') {
        whereClause.dueDate = {
          ...(whereClause.dueDate || {}),
          gt: now,
        };
      } else if (status === 'past') {
        whereClause.dueDate = {
          ...(whereClause.dueDate || {}),
          lt: now,
        };
      }
    }

    const isSuperAdmin = userRole === 'SUPER_ADMIN';
    const isAdmin = userRole === 'ADMIN';

    if (!isSuperAdmin && !isAdmin) {
      const userCourses = await prisma.course.findMany({
        where: {
          enrolledStudents: {
            some: {
              userId: userId,
            },
          },
        },
        select: {
          id: true,
        },
      });

      const userCourseIds = userCourses.map((course) => course.id);

      if (courseId) {
        if (!userCourseIds.includes(courseId)) {
          return res.status(403).json({
            message: 'You do not have access to this course.',
          });
        }

        const courseUnits = await prisma.unit.findMany({
          where: {
            courseId: courseId,
          },
          select: {
            id: true,
          },
        });

        const unitIds = courseUnits.map((unit) => unit.id);

        if (unitId) {
          if (!unitIds.includes(unitId)) {
            return res.status(403).json({
              message: 'You do not have access to this unit.',
            });
          }
        } else {
          whereClause.unitId = {
            in: unitIds,
          };
        }
      } else {
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

        const accessibleUnitIds = accessibleUnits.map((unit) => unit.id);

        if (unitId) {
          if (!accessibleUnitIds.includes(unitId)) {
            return res.status(403).json({
              message: 'You do not have access to this unit.',
            });
          }
        } else {
          whereClause.unitId = {
            in: accessibleUnitIds,
          };
        }
      }
    } else if (isAdmin && !isSuperAdmin) {
      const allCourses = await prisma.course.findMany({
        select: {
          id: true,
        },
      });

      const adminCourseIds = allCourses.map((course) => course.id);

      const adminUnits = await prisma.unit.findMany({
        where: {
          courseId: {
            in: adminCourseIds,
          },
        },
        select: {
          id: true,
        },
      });

      const adminUnitIds = adminUnits.map((unit) => unit.id);

      if (unitId) {
        if (!adminUnitIds.includes(unitId)) {
          return res.status(403).json({
            message: 'You do not have access to this unit.',
          });
        }
      } else {
        whereClause.unitId = {
          in: adminUnitIds,
        };
      }
    }

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
                code: true,
              },
            },
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
  } else {
    return res.status(405).json({ message: 'Method not allowed' });
  }
}
