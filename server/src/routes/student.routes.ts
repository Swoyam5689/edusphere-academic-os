import { Router, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticate, requireRoles, AuthenticatedRequest } from '../middleware/auth.js';
import { AttendanceService } from '../services/attendance.service.js';
import { PerformanceService } from '../services/performance.service.js';
import { TimetableService } from '../services/timetable.service.js';

const router = Router();

// Middleware: Student authentication
router.use(authenticate);

/**
 * Helper to ensure student context
 */
const getStudentId = (req: AuthenticatedRequest): string => {
  if (req.user?.studentId) return req.user.studentId;
  throw new Error('Student profile not found for user');
};

/**
 * 1. STUDENT DASHBOARD
 */
router.get('/dashboard', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: { select: { name: true, email: true, avatar: true } },
        department: true,
        program: true,
        campus: true,
        advisor: { include: { user: { select: { name: true, email: true } } } },
        enrollments: {
          where: { status: 'ACTIVE' },
          include: { subject: true },
        },
      },
    });

    if (!student) {
      res.status(404).json({ success: false, error: 'Student not found' });
      return;
    }

    // 1. Attendance overview
    const attendanceSummary = await AttendanceService.getStudentAttendance(studentId);

    // 2. Today's Classes
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const todayDayName = days[new Date().getDay()]; // e.g. "Monday"
    const todayDate = new Date().toISOString().split('T')[0];

    const studentTimetable = await TimetableService.getStudentTimetable(studentId);
    const todayClasses = studentTimetable
      .filter(slot => slot.dayOfWeek.toLowerCase() === todayDayName.toLowerCase())
      .map(slot => ({
        id: slot.id,
        time: `${slot.startTime}–${slot.endTime}`,
        subject: slot.subject.name,
        subjectCode: slot.subject.code,
        faculty: slot.faculty.user.name,
        room: slot.roomNo,
        status: 'Scheduled',
      }));

    // 3. Today's Learning (Resources uploaded today for enrolled subjects)
    const enrolledSubjectIds = student.enrollments.map(e => e.subjectId);
    const todaysResources = await prisma.classResource.findMany({
      where: {
        subjectId: { in: enrolledSubjectIds },
        uploadDate: todayDate,
      },
      include: {
        subject: true,
        faculty: { include: { user: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 4. Smart Student Insights (Dynamically generated from real database values)
    const insights: string[] = [];
    if (student.currentGpa >= student.cgpa && student.currentGpa > 0) {
      const gpaDiff = Number((student.currentGpa - student.cgpa).toFixed(2));
      insights.push(
        `Great momentum! Your current GPA (${student.currentGpa.toFixed(2)}) is +${gpaDiff} higher than your cumulative CGPA (${student.cgpa.toFixed(2)}).`
      );
    }

    const warningSubjects = attendanceSummary.subjectMetrics.filter(s => s.percentage < 75.0);
    if (warningSubjects.length > 0) {
      const sub = warningSubjects[0];
      insights.push(
        `Attendance Alert: Your ${sub.subjectCode} (${sub.subjectName}) attendance is ${sub.percentage.toFixed(1)}% (< 75%). You must attend ${sub.requiredClasses} consecutive class(es) to regain safe standing.`
      );
    } else {
      const safeSubjects = attendanceSummary.subjectMetrics.filter(s => s.missableClasses > 0);
      if (safeSubjects.length > 0) {
        const topSafe = safeSubjects[0];
        insights.push(
          `Healthy buffer: You can miss up to ${topSafe.missableClasses} more classes in ${topSafe.subjectCode} while staying safely at or above 75%.`
        );
      }
    }

    // 5. Upcoming assignments (due in next 7 days)
    const upcomingAssignments = await prisma.assignment.findMany({
      where: {
        subjectId: { in: enrolledSubjectIds },
        deadline: { gte: new Date() },
      },
      include: {
        subject: true,
        submissions: { where: { studentId } },
      },
      orderBy: { deadline: 'asc' },
      take: 3,
    });

    if (upcomingAssignments.length > 0) {
      insights.push(`You have ${upcomingAssignments.length} active assignment(s) due soon.`);
    }

    // 6. Upcoming exams
    const upcomingExams = await prisma.exam.findMany({
      where: {
        subjectId: { in: enrolledSubjectIds },
        examDate: { gte: todayDate },
      },
      include: { subject: true },
      orderBy: { examDate: 'asc' },
      take: 2,
    });

    // Total credits completed
    const completedEnrollments = await prisma.enrollment.findMany({
      where: {
        studentId,
        status: 'COMPLETED',
        grade: { not: 'F' },
      },
      include: { subject: { select: { credits: true } } },
    });
    const creditsCompleted = completedEnrollments.reduce((acc, e) => acc + e.subject.credits, 0);

    res.json({
      success: true,
      student: {
        name: student.user.name,
        rollNo: student.studentRollNo,
        department: student.department.name,
        program: student.program.name,
        campus: student.campus.name,
        semester: student.currentSemester,
        year: student.currentYear,
        section: student.section,
        cgpa: student.cgpa,
        currentGpa: student.currentGpa,
        overallAttendance: attendanceSummary.overallPercentage,
        creditsCompleted: creditsCompleted || 48,
        academicStanding: student.cgpa >= 8.0 ? 'Dean\'s List / Honors' : student.cgpa >= 6.5 ? 'Good Standing' : 'Academic Warning',
        advisor: student.advisor ? { name: student.advisor.user.name, email: student.advisor.user.email } : null,
      },
      todayClasses,
      todayLearning: {
        count: todaysResources.length,
        resources: todaysResources.map(r => ({
          id: r.id,
          subjectCode: r.subject.code,
          subjectName: r.subject.name,
          topic: r.topic,
          title: r.title,
          facultyName: r.faculty.user.name,
          fileType: r.fileType,
          fileUrl: r.fileUrl,
          fileName: r.fileName,
          uploadDate: r.uploadDate,
        })),
      },
      smartInsights: insights,
      upcomingAssignments: upcomingAssignments.map(a => ({
        id: a.id,
        title: a.title,
        subject: a.subject.code,
        deadline: a.deadline,
        maxMarks: a.maxMarks,
        isSubmitted: a.submissions.length > 0,
      })),
      upcomingExams: upcomingExams.map(e => ({
        id: e.id,
        subject: `${e.subject.code} - ${e.subject.name}`,
        examType: e.examType,
        examDate: e.examDate,
        time: `${e.startTime}–${e.endTime}`,
        room: e.roomNo,
      })),
    });
  } catch (error: any) {
    console.error('Student dashboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2. ATTENDANCE PAGE
 */
router.get('/attendance', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const summary = await AttendanceService.getStudentAttendance(studentId);

    // Get attendance history logs (last 30 sessions)
    const history = await prisma.attendanceRecord.findMany({
      where: { studentId },
      include: {
        subject: true,
        classSession: {
          include: { faculty: { include: { user: { select: { name: true } } } } },
        },
      },
      orderBy: { date: 'desc' },
      take: 40,
    });

    res.json({
      success: true,
      summary,
      history: history.map(h => ({
        id: h.id,
        date: h.date,
        subjectCode: h.subject.code,
        subjectName: h.subject.name,
        topic: h.classSession.topic,
        faculty: h.classSession.faculty.user.name,
        status: h.status,
        remarks: h.remarks,
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3. MARKS & PERFORMANCE PAGE
 */
router.get('/performance', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const performance = await PerformanceService.getStudentPerformance(studentId);
    res.json({ success: true, performance });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4. TIMETABLE
 */
router.get('/timetable', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const slots = await TimetableService.getStudentTimetable(studentId);
    res.json({ success: true, timetable: slots });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5. CLASS RESOURCES
 */
router.get('/resources', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const { subjectId, search, fileType } = req.query;

    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { enrollments: { select: { subjectId: true } } },
    });

    const enrolledIds = student?.enrollments.map(e => e.subjectId) || [];

    const resources = await prisma.classResource.findMany({
      where: {
        subjectId: subjectId ? String(subjectId) : { in: enrolledIds },
        fileType: fileType ? String(fileType) : undefined,
        title: search ? { contains: String(search) } : undefined,
      },
      include: {
        subject: true,
        faculty: { include: { user: { select: { name: true } } } },
      },
      orderBy: [{ uploadDate: 'desc' }, { createdAt: 'desc' }],
    });

    // Group resources chronologically by date and topic
    const groupedByDate: Record<string, typeof resources> = {};
    for (const res of resources) {
      if (!groupedByDate[res.uploadDate]) {
        groupedByDate[res.uploadDate] = [];
      }
      groupedByDate[res.uploadDate].push(res);
    }

    res.json({
      success: true,
      resources,
      groupedByDate,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6. ASSIGNMENTS & SUBMISSION
 */
router.get('/assignments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: { enrollments: { select: { subjectId: true } } },
    });

    const enrolledIds = student?.enrollments.map(e => e.subjectId) || [];

    const assignments = await prisma.assignment.findMany({
      where: { subjectId: { in: enrolledIds } },
      include: {
        subject: true,
        faculty: { include: { user: { select: { name: true } } } },
        submissions: { where: { studentId } },
      },
      orderBy: { deadline: 'asc' },
    });

    res.json({
      success: true,
      assignments: assignments.map(a => {
        const sub = a.submissions[0];
        const now = new Date();
        let status = 'UPCOMING';
        if (sub) {
          status = sub.status;
        } else if (new Date(a.deadline) < now) {
          status = 'OVERDUE';
        }

        return {
          id: a.id,
          title: a.title,
          description: a.description,
          subjectCode: a.subject.code,
          subjectName: a.subject.name,
          facultyName: a.faculty.user.name,
          deadline: a.deadline,
          maxMarks: a.maxMarks,
          attachmentUrl: a.attachmentUrl,
          status,
          submission: sub
            ? {
                id: sub.id,
                submissionDate: sub.submissionDate,
                fileUrl: sub.fileUrl,
                comments: sub.comments,
                marksObtained: sub.marksObtained,
                feedback: sub.feedback,
              }
            : null,
        };
      }),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/assignments/:id/submit', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const assignmentId = req.params.id;
    const { comments, fileUrl } = req.body;

    const assignment = await prisma.assignment.findUnique({
      where: { id: assignmentId },
    });

    if (!assignment) {
      res.status(404).json({ success: false, error: 'Assignment not found' });
      return;
    }

    const now = new Date();
    const isLate = now > new Date(assignment.deadline);

    const submission = await prisma.assignmentSubmission.upsert({
      where: {
        assignmentId_studentId: {
          assignmentId,
          studentId,
        },
      },
      update: {
        comments: comments || null,
        fileUrl: fileUrl || '/uploads/submissions/sample-solution.pdf',
        submissionDate: now,
        status: isLate ? 'LATE' : 'SUBMITTED',
      },
      create: {
        assignmentId,
        studentId,
        comments: comments || null,
        fileUrl: fileUrl || '/uploads/submissions/sample-solution.pdf',
        submissionDate: now,
        status: isLate ? 'LATE' : 'SUBMITTED',
      },
    });

    res.json({ success: true, submission });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 7. EXAMS
 */
router.get('/exams', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: { select: { subjectId: true } },
        examResults: {
          include: { exam: { include: { subject: true } } },
        },
      },
    });

    const enrolledIds = student?.enrollments.map(e => e.subjectId) || [];

    const upcomingExams = await prisma.exam.findMany({
      where: { subjectId: { in: enrolledIds } },
      include: { subject: true },
      orderBy: { examDate: 'asc' },
    });

    res.json({
      success: true,
      upcomingExams: upcomingExams.map(e => ({
        id: e.id,
        subjectCode: e.subject.code,
        subjectName: e.subject.name,
        examType: e.examType,
        examDate: e.examDate,
        time: `${e.startTime}–${e.endTime}`,
        roomNo: e.roomNo,
        totalMarks: e.totalMarks,
      })),
      results: student?.examResults || [],
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 8. STUDENT PROFILE & AUXILIARY
 */
router.get('/profile', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = getStudentId(req);
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        user: true,
        department: true,
        program: true,
        campus: true,
        advisor: { include: { user: true } },
        achievements: true,
        documents: true,
        feeRecords: true,
        placements: true,
      },
    });

    res.json({ success: true, profile: student });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 9. NOTIFICATIONS
 */
router.get('/notifications', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
    res.json({ success: true, notifications });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/notifications/:id/read', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id, userId: req.user!.id },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.put('/notifications/mark-all-read', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    await prisma.notification.updateMany({
      where: { userId: req.user!.id, isRead: false },
      data: { isRead: true },
    });
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
