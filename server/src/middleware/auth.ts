import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';

const JWT_SECRET = process.env.JWT_SECRET || 'edusphere-hackathon-jwt-super-secret-key-2026';

export interface AuthenticatedUser {
  id: string;
  email: string;
  role: string;
  name: string;
  campusId?: string | null;
  departmentId?: string | null;
  studentId?: string | null;
  facultyId?: string | null;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthenticatedUser;
}

export const authenticate = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    let token: string | undefined;

    // Check authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    } else if (req.cookies && req.cookies.token) {
      token = req.cookies.token;
    }

    if (!token) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;

    // Verify user still exists in database
    const dbUser = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        student: { select: { id: true } },
        faculty: { select: { id: true } },
      },
    });

    if (!dbUser) {
      res.status(401).json({ success: false, error: 'User no longer exists' });
      return;
    }

    req.user = {
      id: dbUser.id,
      email: dbUser.email,
      role: dbUser.role,
      name: dbUser.name,
      campusId: dbUser.campusId,
      departmentId: dbUser.departmentId,
      studentId: dbUser.student?.id || null,
      facultyId: dbUser.faculty?.id || null,
    };

    next();
  } catch (error) {
    res.status(401).json({ success: false, error: 'Invalid or expired session token' });
  }
};

export const requireRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ success: false, error: 'Authentication required' });
      return;
    }

    // CHAIRMAN and UNIVERSITY_ADMIN have super-admin privileges across all admin endpoints
    if (
      roles.includes(req.user.role) ||
      ((req.user.role === 'CHAIRMAN' || req.user.role === 'UNIVERSITY_ADMIN') &&
        roles.some(r => ['CAMPUS_ADMIN', 'HOD', 'ADVISOR', 'FACULTY', 'ADMIN'].includes(r)))
    ) {
      next();
      return;
    }

    res.status(403).json({
      success: false,
      error: `Access denied. Role '${req.user.role}' lacks necessary permission.`,
    });
  };
};

export const auditLogger = async (
  userId: string | undefined,
  userRole: string | undefined,
  action: string,
  entity: string,
  entityId?: string,
  details?: string,
  ipAddress?: string
) => {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        userRole,
        action,
        entity,
        entityId,
        details,
        ipAddress,
      },
    });
  } catch (e) {
    console.error('Failed to write audit log:', e);
  }
};
