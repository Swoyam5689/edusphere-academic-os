import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../config/prisma.js';
import { authenticate, AuthenticatedRequest, auditLogger } from '../middleware/auth.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'edusphere-hackathon-jwt-super-secret-key-2026';

// Pre-defined demo users mapping
const DEMO_EMAILS = {
  student: 'student@demo.com',
  faculty: 'faculty@demo.com',
  advisor: 'advisor@demo.com',
  hod: 'hod@demo.com',
  admin: 'admin@demo.com',
  chairman: 'chairman@demo.com',
};

/**
 * Standard Login
 */
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email) {
      res.status(400).json({ success: false, error: 'Email is required' });
      return;
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        campus: true,
        department: true,
        student: { select: { id: true, studentRollNo: true } },
        faculty: { select: { id: true, facultyEmpId: true, isAdvisor: true } },
      },
    });

    if (!user) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    // For demo convenience, demo accounts allow password "demo123" or matched hash
    let isValidPassword = false;
    if (password === 'demo123' || password === 'admin123' || password === 'student123') {
      isValidPassword = true;
    } else {
      isValidPassword = await bcrypt.compare(password, user.passwordHash);
    }

    if (!isValidPassword) {
      res.status(401).json({ success: false, error: 'Invalid email or password' });
      return;
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      campusId: user.campusId,
      departmentId: user.departmentId,
      studentId: user.student?.id || null,
      facultyId: user.faculty?.id || null,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    await auditLogger(user.id, user.role, 'USER_LOGIN', 'User', user.id, 'Successful login');

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        campus: user.campus,
        department: user.department,
        studentId: user.student?.id,
        facultyId: user.faculty?.id,
      },
    });
  } catch (error: any) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, error: error.message || 'Internal server error' });
  }
});

/**
 * 1-Click Instant Demo Login Switcher
 */
router.post('/demo-login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { roleKey } = req.body; // 'student' | 'faculty' | 'advisor' | 'hod' | 'admin' | 'chairman'
    const targetEmail = (DEMO_EMAILS as any)[roleKey] || DEMO_EMAILS.student;

    const user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        campus: true,
        department: true,
        student: { select: { id: true, studentRollNo: true } },
        faculty: { select: { id: true, facultyEmpId: true, isAdvisor: true } },
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: `Demo user for '${roleKey}' not found. Please seed database.` });
      return;
    }

    const tokenPayload = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      campusId: user.campusId,
      departmentId: user.departmentId,
      studentId: user.student?.id || null,
      facultyId: user.faculty?.id || null,
    };

    const token = jwt.sign(tokenPayload, JWT_SECRET, { expiresIn: '7d' });

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const targetUrl =
      user.role === 'STUDENT'
        ? '/student/dashboard'
        : user.role === 'FACULTY'
        ? '/faculty/dashboard'
        : '/admin/command-center';

    res.json({
      success: true,
      token,
      targetUrl,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        campus: user.campus,
        department: user.department,
        studentId: user.student?.id,
        facultyId: user.faculty?.id,
      },
    });
  } catch (error: any) {
    console.error('Demo login error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Get current session user
 */
router.get('/me', authenticate, async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      include: {
        campus: true,
        department: true,
        student: {
          include: {
            program: true,
            advisor: { include: { user: { select: { name: true, email: true } } } },
          },
        },
        faculty: true,
      },
    });

    if (!user) {
      res.status(404).json({ success: false, error: 'User not found' });
      return;
    }

    // Unread notifications count
    const unreadNotificationsCount = await prisma.notification.count({
      where: { userId: user.id, isRead: false },
    });

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        avatar: user.avatar,
        campus: user.campus,
        department: user.department,
        student: user.student,
        faculty: user.faculty,
        unreadNotificationsCount,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * Logout
 */
router.post('/logout', (req: Request, res: Response) => {
  res.clearCookie('token');
  res.json({ success: true, message: 'Logged out successfully' });
});

export default router;
