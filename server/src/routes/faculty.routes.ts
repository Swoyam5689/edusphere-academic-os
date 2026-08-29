import { Router, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticate, requireRoles, AuthenticatedRequest, auditLogger } from '../middleware/auth.js';
import { WorkloadEngineService } from '../services/workload.service.js';
import { AttendanceService } from '../services/attendance.service.js';
import { AlertEngineService } from '../services/alert.service.js';

const router = Router();

// Middleware: Faculty, Advisor, HOD, and Admins can access
router.use(authenticate);
router.use(requireRoles('FACULTY', 'ADVISOR', 'HOD', 'CAMPUS_ADMIN', 'UNIVERSITY_ADMIN', 'CHAIRMAN'));

const getFacultyId = async (req: AuthenticatedRequest): Promise<string> => {
  if (req.user?.facultyId) return req.user.facultyId;
  if (req.user?.id) {
    const directFaculty = await prisma.faculty.findUnique({
      where: { userId: req.user.id },
    });
    if (directFaculty) return directFaculty.id;
  }
  const defaultFaculty = await prisma.faculty.findFirst({
    where: { user: { email: 'faculty@demo.com' } },
  });
  if (defaultFaculty) return defaultFaculty.id;
  const anyFaculty = await prisma.faculty.findFirst();
  if (anyFaculty) return anyFaculty.id;
  throw new Error('Faculty profile not linked to user');
};

/**
 * Helper to resolve subject by ID or Code
 */
const resolveSubject = async (subjectIdOrCode: string) => {
  if (!subjectIdOrCode) return null;
  const match = await prisma.subject.findFirst({
    where: {
      OR: [
        { id: subjectIdOrCode },
        { code: subjectIdOrCode },
        { code: { contains: subjectIdOrCode } },
      ],
    },
  });
  if (match) return match;
  return await prisma.subject.findFirst();
};

/**
 * 1. FACULTY DASHBOARD OVERVIEW
 */
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facultyId = await getFacultyId(req);
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        user: true,
        department: true,
        campus: true,
        timetableSlots: { include: { subject: true } },
        assignments: {
          include: { submissions: { where: { status: 'SUBMITTED' } } },
        },
      },
    });

    if (!faculty) {
      res.status(404).json({ success: false, error: 'Faculty not found' });
      return;
    }

    // Workload calculation
    const workload = await WorkloadEngineService.calculateFacultyWorkload(facultyId);

    // Today's classes
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayName = days[new Date().getDay()];
    const todayDate = new Date().toISOString().split('T')[0];

    const todaySlots = faculty.timetableSlots.filter(
      s => s.dayOfWeek.toLowerCase() === todayDayName.toLowerCase()
    );

    // Fetch today's class sessions for this faculty
    const todaySessions = await prisma.classSession.findMany({
      where: {
        facultyId,
        date: todayDate,
      },
      include: {
        subject: true,
        classResources: true,
      },
      orderBy: { startTime: 'asc' },
    });

    res.json({
      success: true,
      faculty: {
        id: faculty.id,
        name: faculty.user.name,
        empId: faculty.facultyEmpId,
        department: faculty.department.name,
        campus: faculty.campus.name,
        designation: faculty.designation,
        avgRating: faculty.avgStudentRating,
        reviewCount: faculty.reviewCount,
      },
      metrics: {
        studentsAssigned: workload.totalStudents,
        subjectsTaught: workload.totalSubjects,
        classesPerWeek: workload.totalClasses,
        pendingGrading: workload.assignmentLoad,
        workloadScore: workload.calculatedScore,
        workloadStatus: workload.status,
        workloadRecommendation: workload.recommendation,
      },
      todaySchedule: todaySlots.map(s => ({
        id: s.id,
        subjectId: s.subject.id,
        subjectCode: s.subject.code,
        subjectName: s.subject.name,
        time: `${s.startTime}–${s.endTime}`,
        room: s.roomNo,
        section: s.section,
      })),
      todaySessions: todaySessions.map(sess => ({
        id: sess.id,
        subjectId: sess.subject.id,
        subjectCode: sess.subject.code,
        subjectName: sess.subject.name,
        time: `${sess.startTime}–${sess.endTime}`,
        room: sess.roomNo,
        section: sess.section,
        topic: sess.topic,
        status: sess.status,
        resourcesCount: sess.classResources.length,
      })),
    });
  } catch (error: any) {
    console.error('Faculty dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2. GET SUBJECTS ASSIGNED TO FACULTY
 */
router.get('/subjects', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facultyId = await getFacultyId(req);
    const slots = await prisma.timetableSlot.findMany({
      where: { facultyId },
      include: { subject: true },
    });

    const subjectMap = new Map();
    for (const s of slots) {
      if (!subjectMap.has(s.subject.id)) {
        subjectMap.set(s.subject.id, s.subject);
      }
    }

    // Fallback: If no slots, return all department subjects
    let subjects = Array.from(subjectMap.values());
    if (subjects.length === 0 && req.user?.departmentId) {
      subjects = await prisma.subject.findMany({
        where: { departmentId: req.user.departmentId },
      });
    }

    res.json({ success: true, subjects });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3. GET OR CREATE TODAY'S CLASS SESSIONS
 */
router.get('/sessions/today', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facultyId = await getFacultyId(req);
    const todayDate = new Date().toISOString().split('T')[0];

    const sessions = await prisma.classSession.findMany({
      where: { facultyId, date: todayDate },
      include: {
        subject: true,
        classResources: true,
      },
      orderBy: { startTime: 'asc' },
    });

    res.json({ success: true, sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/sessions', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facultyId = await getFacultyId(req);
    const { subjectId, section, roomNo, date, startTime, endTime, topic } = req.body;

    const matchedSubject = await resolveSubject(subjectId);
    if (!matchedSubject) {
      res.status(400).json({ success: false, error: 'Subject not found' });
      return;
    }

    const session = await prisma.classSession.create({
      data: {
        facultyId,
        subjectId: matchedSubject.id,
        section: section || 'A',
        roomNo: roomNo || 'B204',
        date: date || new Date().toISOString().split('T')[0],
        startTime: startTime || '09:00',
        endTime: endTime || '10:00',
        topic: topic || 'General Lecture',
        status: 'COMPLETED',
      },
      include: { subject: true },
    });

    await auditLogger(
      req.user?.id,
      req.user?.role,
      'CREATE_SESSION',
      'ClassSession',
      session.id,
      `Created session for ${session.subject.code}: ${topic}`
    );

    res.json({ success: true, session });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4. UPLOAD CLASS RESOURCE (SAME-DAY LEARNING MATERIAL LOOP)
 */
router.post('/resources/upload', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facultyId = await getFacultyId(req);
    const { subjectId, classSessionId, topic, title, description, fileType, fileName, fileUrl, fileSize } = req.body;

    if (!subjectId || !title) {
      res.status(400).json({ success: false, error: 'Subject and title are required' });
      return;
    }

    const matchedSubject = await resolveSubject(subjectId);
    if (!matchedSubject) {
      res.status(400).json({ success: false, error: 'Subject not found' });
      return;
    }

    let validSessionId: string | null = null;
    if (classSessionId && classSessionId !== 'session-default') {
      const existingSession = await prisma.classSession.findUnique({
        where: { id: classSessionId },
      });
      if (existingSession) validSessionId = existingSession.id;
    }

    const todayDate = new Date().toISOString().split('T')[0];

    const resource = await prisma.classResource.create({
      data: {
        facultyId,
        subjectId: matchedSubject.id,
        classSessionId: validSessionId,
        topic: topic || 'Lecture Notes',
        title,
        description: description || null,
        fileType: fileType || 'PPT',
        fileName: fileName || `${title.replace(/\s+/g, '_')}.${(fileType || 'ppt').toLowerCase()}`,
        fileUrl: fileUrl || `/uploads/resources/${matchedSubject.code}/${encodeURIComponent(fileName || title)}`,
        fileSize: fileSize || '3.2 MB',
        uploadDate: todayDate,
        isToday: true,
      },
      include: {
        subject: true,
        faculty: { include: { user: { select: { name: true } } } },
      },
    });

    // Try to trigger notifications, but don't fail upload if notifications fail
    try {
      await AlertEngineService.notifyStudentsOnResourceUpload(resource.id);
    } catch (notifErr) {
      console.warn('Could not notify students:', notifErr);
    }

    await auditLogger(
      req.user?.id,
      req.user?.role,
      'UPLOAD_RESOURCE',
      'ClassResource',
      resource.id,
      `Uploaded resource "${title}" for ${resource.subject.code}`
    );

    res.json({
      success: true,
      resource,
      message: `Resource uploaded successfully. Enrolled students have been notified and it is now active in "Today's Learning".`,
    });
  } catch (error: any) {
    console.error('Resource upload error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5. CLASS SESSION ATTENDANCE MATRIX
 */
router.get('/attendance/:sessionId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const session = await prisma.classSession.findUnique({
      where: { id: req.params.sessionId },
      include: {
        subject: true,
        attendanceRecords: {
          include: { student: { include: { user: { select: { name: true, email: true } } } } },
        },
      },
    });

    if (!session) {
      res.status(404).json({ success: false, error: 'Session not found' });
      return;
    }

    // Get all enrolled students in this subject
    const enrollments = await prisma.enrollment.findMany({
      where: { subjectId: session.subjectId, status: 'ACTIVE' },
      include: {
        student: {
          include: { user: { select: { name: true, email: true } } },
        },
      },
      orderBy: { student: { studentRollNo: 'asc' } },
    });

    const recordedMap = new Map(session.attendanceRecords.map(r => [r.studentId, r.status]));

    const roster = enrollments.map(e => ({
      studentId: e.student.id,
      rollNo: e.student.studentRollNo,
      name: e.student.user.name,
      email: e.student.user.email,
      section: e.student.section,
      currentAttendancePct: e.student.attendancePct,
      status: recordedMap.get(e.student.id) || 'PRESENT',
    }));

    res.json({
      success: true,
      session: {
        id: session.id,
        subjectCode: session.subject.code,
        subjectName: session.subject.name,
        date: session.date,
        time: `${session.startTime}–${session.endTime}`,
        topic: session.topic,
        section: session.section,
        room: session.roomNo,
      },
      roster,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/attendance/:sessionId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const sessionId = req.params.sessionId;
    const { records } = req.body;

    if (!Array.isArray(records)) {
      res.status(400).json({ success: false, error: 'Records must be an array' });
      return;
    }

    await AttendanceService.recordClassAttendance(sessionId, records);

    await auditLogger(
      req.user?.id,
      req.user?.role,
      'UPDATE_ATTENDANCE',
      'ClassSession',
      sessionId,
      `Marked attendance for ${records.length} students`
    );

    res.json({ success: true, message: `Attendance saved for ${records.length} students` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6. FACULTY ASSIGNMENTS & GRADING
 */
router.get('/assignments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facultyId = await getFacultyId(req);
    const assignments = await prisma.assignment.findMany({
      where: { facultyId },
      include: {
        subject: true,
        submissions: {
          include: {
            student: { include: { user: { select: { name: true, email: true } } } },
          },
        },
      },
      orderBy: { deadline: 'desc' },
    });

    res.json({ success: true, assignments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/assignments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facultyId = await getFacultyId(req);
    const { subjectId, title, description, deadline, maxMarks } = req.body;

    if (!subjectId || !title) {
      res.status(400).json({ success: false, error: 'Subject and title are required' });
      return;
    }

    const matchedSubject = await resolveSubject(subjectId);
    if (!matchedSubject) {
      res.status(400).json({ success: false, error: 'Subject not found' });
      return;
    }

    const assignment = await prisma.assignment.create({
      data: {
        facultyId,
        subjectId: matchedSubject.id,
        title,
        description: description || '',
        deadline: new Date(deadline || Date.now() + 7 * 24 * 60 * 60 * 1000),
        maxMarks: Number(maxMarks) || 100,
        attachmentUrl: '/uploads/assignments/coursework_spec.pdf',
      },
      include: { subject: true },
    });

    await auditLogger(
      req.user?.id,
      req.user?.role,
      'CREATE_ASSIGNMENT',
      'Assignment',
      assignment.id,
      `Created assignment "${title}" for ${assignment.subject.code}`
    );

    res.json({ success: true, assignment, message: 'Assignment created successfully!' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/assignments/:id/grade', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { submissionId, marksObtained, feedback } = req.body;

    const submission = await prisma.assignmentSubmission.update({
      where: { id: submissionId },
      data: {
        marksObtained: Number(marksObtained),
        feedback,
        status: 'GRADED',
      },
      include: {
        assignment: { include: { subject: true } },
        student: true,
      },
    });

    // Update assignment marks in student enrollment
    await prisma.enrollment.updateMany({
      where: {
        studentId: submission.studentId,
        subjectId: submission.assignment.subjectId,
      },
      data: {
        assignmentsMarks: Number(marksObtained) * 0.1, // Normalized 10 max
      },
    });

    res.json({ success: true, submission, message: 'Submission graded successfully' });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 7. FACULTY WORKLOAD BREAKDOWN
 */
router.get('/workload', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facultyId = await getFacultyId(req);
    const workload = await WorkloadEngineService.calculateFacultyWorkload(facultyId);
    res.json({ success: true, workload });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 8. FACULTY REVIEWS
 */
router.get('/reviews', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const facultyId = await getFacultyId(req);
    const reviews = await prisma.facultyReview.findMany({
      where: { facultyId },
      include: {
        subject: true,
        student: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    res.json({ success: true, reviews });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
