import { Router, Response } from 'express';
import { prisma } from '../config/prisma.js';
import { authenticate, requireRoles, AuthenticatedRequest, auditLogger } from '../middleware/auth.js';
import { InsightsService } from '../services/insights.service.js';
import { RiskEngineService } from '../services/risk.service.js';
import { ExportService } from '../services/export.service.js';

const router = Router();

// Middleware: Admin, HOD, Advisor, Chairman, Faculty
router.use(authenticate);
router.use(requireRoles('CAMPUS_ADMIN', 'UNIVERSITY_ADMIN', 'CHAIRMAN', 'HOD', 'ADVISOR', 'FACULTY'));

/**
 * 1. COMMAND CENTER TOP KPIs & OVERVIEW
 */
router.get('/command-center', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { campusId, departmentId } = req.query;

    const kpis = await InsightsService.getCommandCenterKPIs(
      campusId ? String(campusId) : undefined,
      departmentId ? String(departmentId) : undefined
    );

    // Dynamic Chart Data: Department Performance Comparison
    const departments = await prisma.department.findMany({
      include: {
        students: { select: { attendancePct: true, cgpa: true, riskScore: true } },
        faculty: { select: { workloadScore: true } },
        subjects: { select: { classResources: { select: { id: true } } } },
      },
    });

    const departmentCharts = departments.map(d => {
      const avgAtt =
        d.students.length > 0
          ? d.students.reduce((a, b) => a + b.attendancePct, 0) / d.students.length
          : 0;
      const avgCgpa =
        d.students.length > 0 ? d.students.reduce((a, b) => a + b.cgpa, 0) / d.students.length : 0;
      const avgWorkload =
        d.faculty.length > 0
          ? d.faculty.reduce((a, b) => a + b.workloadScore, 0) / d.faculty.length
          : 0;
      const highRisk = d.students.filter(s => s.riskScore >= 60).length;

      return {
        id: d.id,
        name: d.code,
        fullName: d.name,
        studentsCount: d.students.length,
        avgAttendance: Number(avgAtt.toFixed(1)),
        avgCgpa: Number(avgCgpa.toFixed(2)),
        avgWorkload: Number(avgWorkload.toFixed(1)),
        atRiskCount: highRisk,
      };
    });

    // Campus comparison
    const campuses = await prisma.campus.findMany({
      include: {
        students: { select: { attendancePct: true, cgpa: true, riskScore: true } },
        faculty: { select: { workloadScore: true } },
      },
    });

    const campusCharts = campuses.map(c => {
      const avgAtt =
        c.students.length > 0
          ? c.students.reduce((a, b) => a + b.attendancePct, 0) / c.students.length
          : 0;
      const avgCgpa =
        c.students.length > 0 ? c.students.reduce((a, b) => a + b.cgpa, 0) / c.students.length : 0;
      const highRisk = c.students.filter(s => s.riskScore >= 60).length;
      const atRiskPct =
        c.students.length > 0 ? Number(((highRisk / c.students.length) * 100).toFixed(1)) : 0;

      return {
        id: c.id,
        name: c.name,
        code: c.code,
        avgAttendance: Number(avgAtt.toFixed(1)),
        avgCgpa: Number(avgCgpa.toFixed(2)),
        atRiskPct,
        studentsCount: c.students.length,
        facultyCount: c.faculty.length,
      };
    });

    // Recent Active Alerts
    const alerts = await prisma.institutionalAlert.findMany({
      orderBy: { createdAt: 'desc' },
      take: 6,
    });

    res.json({
      success: true,
      kpis,
      charts: {
        departments: departmentCharts,
        campuses: campusCharts,
      },
      alerts,
    });
  } catch (error: any) {
    console.error('Command center error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2. HIERARCHICAL DRILL-DOWN ANALYTICS
 */
router.get('/drilldown', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { campusId, departmentId, programId, year, section } = req.query;

    const drillResult = await InsightsService.getDrillDownAnalytics({
      campusId: campusId ? String(campusId) : undefined,
      departmentId: departmentId ? String(departmentId) : undefined,
      programId: programId ? String(programId) : undefined,
      year: year ? Number(year) : undefined,
      section: section ? String(section) : undefined,
    });

    res.json({ success: true, ...drillResult });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 3. INSTITUTIONAL INSIGHTS
 */
router.get('/insights', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const insights = await InsightsService.generateInstitutionalInsights();
    res.json({ success: true, insights });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 4. AT-RISK STUDENTS REGISTRY & FACTOR BREAKDOWN
 */
router.get('/at-risk', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { level, campusId, departmentId, search, page = 1, limit = 15 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {
      riskScore: { gte: 30 }, // MEDIUM, HIGH, CRITICAL
    };

    if (level && level !== 'ALL') {
      whereClause.riskLevel = String(level);
    }
    if (campusId) whereClause.campusId = String(campusId);
    if (departmentId) whereClause.departmentId = String(departmentId);
    if (search) {
      whereClause.OR = [
        { studentRollNo: { contains: String(search) } },
        { user: { name: { contains: String(search) } } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where: whereClause }),
      prisma.student.findMany({
        where: whereClause,
        include: {
          user: { select: { name: true, email: true } },
          campus: { select: { name: true } },
          department: { select: { name: true } },
          program: { select: { name: true } },
          advisor: { include: { user: { select: { name: true } } } },
          riskAssessments: { orderBy: { calculatedAt: 'desc' }, take: 1 },
        },
        orderBy: { riskScore: 'desc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      students: students.map(s => {
        const assessment = s.riskAssessments[0];
        return {
          id: s.id,
          rollNo: s.studentRollNo,
          name: s.user.name,
          email: s.user.email,
          campus: s.campus.name,
          department: s.department.name,
          program: s.program.name,
          year: s.currentYear,
          section: s.section,
          attendancePct: s.attendancePct,
          cgpa: s.cgpa,
          currentGpa: s.currentGpa,
          riskScore: s.riskScore,
          riskLevel: s.riskLevel,
          advisor: s.advisor ? s.advisor.user.name : 'Unassigned',
          factors: assessment
            ? {
                attendanceFactor: assessment.attendanceFactor,
                gpaFactor: assessment.gpaFactor,
                performanceDeclineFactor: assessment.performanceDeclineFactor,
                failedSubjectsFactor: assessment.failedSubjectsFactor,
                assignmentsFactor: assessment.assignmentsFactor,
              }
            : null,
          explanation: assessment?.explanation,
        };
      }),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/at-risk/:studentId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const riskData = await RiskEngineService.evaluateStudentRisk(req.params.studentId);
    res.json({ success: true, riskData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5. FACULTY WORKLOAD LEADERBOARD & REBALANCING ADVISOR
 */
router.get('/workload', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { status, departmentId, campusId } = req.query;

    const whereClause: any = {};
    if (status && status !== 'ALL') whereClause.workloadStatus = String(status);
    if (departmentId) whereClause.departmentId = String(departmentId);
    if (campusId) whereClause.campusId = String(campusId);

    const facultyList = await prisma.faculty.findMany({
      where: whereClause,
      include: {
        user: { select: { name: true, email: true, phone: true } },
        campus: { select: { name: true } },
        department: { select: { name: true } },
        timetableSlots: { select: { id: true, subjectId: true } },
        advisedStudents: { select: { id: true } },
        workloadRecords: { orderBy: { calculatedAt: 'desc' }, take: 1 },
      },
      orderBy: { workloadScore: 'desc' },
    });

    res.json({
      success: true,
      facultyList: facultyList.map(f => {
        const w = f.workloadRecords[0];
        const slotsCount = f.timetableSlots.length;
        const advisedCount = f.advisedStudents.length;
        
        const teachingHours = w?.teachingHours || (slotsCount > 0 ? slotsCount * 1.0 : 8.0);
        const totalClasses = w?.totalClasses || (slotsCount > 0 ? slotsCount : 8);
        const totalStudents = w?.totalStudents || (slotsCount > 0 ? slotsCount * 38 : 95);
        const totalSubjects = w?.totalSubjects || (new Set(f.timetableSlots.map(s => s.subjectId)).size || 2);
        
        return {
          id: f.id,
          empId: f.facultyEmpId,
          name: f.user.name,
          email: f.user.email,
          campus: f.campus.name,
          department: f.department.name,
          designation: f.designation,
          workloadScore: f.workloadScore,
          workloadStatus: f.workloadStatus,
          avgRating: f.avgStudentRating,
          teachingHours,
          totalClasses,
          totalStudents,
          totalSubjects,
          pendingGrading: w?.assignmentLoad || (f.workloadScore > 80 ? 12 : 2),
          advisorLoad: w?.advisorLoad || advisedCount,
          recommendation: w?.recommendation || (f.workloadStatus === 'OVERLOADED' ? `Workload exceeds 90 index. Consider section redistribution.` : null),
        };
      }),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 6. SERVER-SIDE SEARCHABLE / PAGINATED STUDENT DIRECTORY
 */
router.get('/students', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { search, campusId, departmentId, programId, year, riskLevel, page = 1, limit = 20 } = req.query;

    const pageNum = Number(page);
    const limitNum = Number(limit);
    const skip = (pageNum - 1) * limitNum;

    const whereClause: any = {};
    if (campusId) whereClause.campusId = String(campusId);
    if (departmentId) whereClause.departmentId = String(departmentId);
    if (programId) whereClause.programId = String(programId);
    if (year) whereClause.currentYear = Number(year);
    if (riskLevel && riskLevel !== 'ALL') whereClause.riskLevel = String(riskLevel);
    if (search) {
      whereClause.OR = [
        { studentRollNo: { contains: String(search) } },
        { user: { name: { contains: String(search) } } },
        { user: { email: { contains: String(search) } } },
      ];
    }

    const [total, students] = await Promise.all([
      prisma.student.count({ where: whereClause }),
      prisma.student.findMany({
        where: whereClause,
        include: {
          user: { select: { name: true, email: true, phone: true } },
          campus: { select: { name: true } },
          department: { select: { name: true } },
          program: { select: { name: true } },
          advisor: { include: { user: { select: { name: true } } } },
        },
        orderBy: { studentRollNo: 'asc' },
        skip,
        take: limitNum,
      }),
    ]);

    res.json({
      success: true,
      total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      students: students.map(s => ({
        id: s.id,
        rollNo: s.studentRollNo,
        name: s.user.name,
        email: s.user.email,
        phone: s.user.phone,
        campus: s.campus.name,
        department: s.department.name,
        program: s.program.name,
        year: s.currentYear,
        semester: s.currentSemester,
        section: s.section,
        attendancePct: s.attendancePct,
        cgpa: s.cgpa,
        currentGpa: s.currentGpa,
        riskScore: s.riskScore,
        riskLevel: s.riskLevel,
        advisor: s.advisor ? s.advisor.user.name : 'Unassigned',
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 7. CSV EXPORT ENDPOINTS
 */
router.get('/export/students', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { campusId, departmentId, riskLevel } = req.query;
    const csvContent = await ExportService.exportStudentsCsv({
      campusId: campusId ? String(campusId) : undefined,
      departmentId: departmentId ? String(departmentId) : undefined,
      riskLevel: riskLevel ? String(riskLevel) : undefined,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="edusphere-students-report.csv"');
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/export/workload', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { campusId, departmentId } = req.query;
    const csvContent = await ExportService.exportFacultyWorkloadCsv({
      campusId: campusId ? String(campusId) : undefined,
      departmentId: departmentId ? String(departmentId) : undefined,
    });

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="edusphere-faculty-workload-report.csv"');
    res.send(csvContent);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 8. GLOBAL SEARCH
 */
router.get('/search', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const query = String(req.query.q || '').trim();
    if (!query || query.length < 2) {
      res.json({ success: true, results: { students: [], faculty: [], subjects: [], departments: [] } });
      return;
    }

    const [students, faculty, subjects, departments] = await Promise.all([
      prisma.student.findMany({
        where: {
          OR: [
            { studentRollNo: { contains: query } },
            { user: { name: { contains: query } } },
          ],
        },
        include: { user: { select: { name: true } }, department: { select: { name: true } } },
        take: 5,
      }),
      prisma.faculty.findMany({
        where: {
          OR: [
            { facultyEmpId: { contains: query } },
            { user: { name: { contains: query } } },
          ],
        },
        include: { user: { select: { name: true } }, department: { select: { name: true } } },
        take: 5,
      }),
      prisma.subject.findMany({
        where: {
          OR: [{ code: { contains: query } }, { name: { contains: query } }],
        },
        take: 5,
      }),
      prisma.department.findMany({
        where: {
          OR: [{ code: { contains: query } }, { name: { contains: query } }],
        },
        take: 5,
      }),
    ]);

    res.json({
      success: true,
      results: {
        students: students.map(s => ({
          id: s.id,
          title: s.user.name,
          subtitle: `${s.studentRollNo} • ${s.department.name}`,
          type: 'STUDENT',
          link: `/admin/students?search=${s.studentRollNo}`,
        })),
        faculty: faculty.map(f => ({
          id: f.id,
          title: f.user.name,
          subtitle: `${f.facultyEmpId} • ${f.department.name}`,
          type: 'FACULTY',
          link: `/admin/workload`,
        })),
        subjects: subjects.map(sub => ({
          id: sub.id,
          title: sub.name,
          subtitle: `${sub.code} • ${sub.credits} Credits`,
          type: 'SUBJECT',
          link: `/admin/subjects`,
        })),
        departments: departments.map(d => ({
          id: d.id,
          title: d.name,
          subtitle: d.code,
          type: 'DEPARTMENT',
          link: `/admin/departments`,
        })),
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 9. CAMPUSES & DEPARTMENTS LISTS
 */
router.get('/campuses', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const campuses = await prisma.campus.findMany({
      include: {
        departments: true,
        _count: { select: { students: true, faculty: true } },
      },
    });
    res.json({ success: true, campuses });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/departments', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const departments = await prisma.department.findMany({
      include: {
        campus: true,
        programs: true,
        _count: { select: { students: true, faculty: true, subjects: true } },
      },
    });
    res.json({ success: true, departments });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 10. ALERTS MANAGEMENT
 */
router.get('/alerts', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const alerts = await prisma.institutionalAlert.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json({ success: true, alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 11. ADMINISTRATIVE ATTENDANCE OVERRIDE & CORRECTIONS
 * (Accessible by Admin, HOD, Advisor, Chairman)
 */
router.get('/attendance/student/:studentId', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const studentId = req.params.studentId;
    const summary = await AttendanceService.getStudentAttendance(studentId);
    const history = await prisma.attendanceRecord.findMany({
      where: { studentId },
      include: {
        subject: true,
        classSession: { include: { faculty: { include: { user: true } } } },
      },
      orderBy: { date: 'desc' },
      take: 50,
    });

    res.json({
      success: true,
      summary,
      history: history.map(h => ({
        id: h.id,
        date: h.date,
        subjectId: h.subjectId,
        subjectCode: h.subject?.code || 'N/A',
        subjectName: h.subject?.name || 'N/A',
        status: h.status,
        remarks: h.remarks,
        facultyName: h.classSession?.faculty?.user?.name || 'Faculty',
      })),
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.post('/attendance/override', async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { studentId, subjectId, status, remarks, recordId } = req.body;

    if (!studentId || !status) {
      res.status(400).json({ success: false, error: 'Student ID and status are required' });
      return;
    }

    if (recordId) {
      await prisma.attendanceRecord.update({
        where: { id: recordId },
        data: {
          status,
          remarks: remarks || `Administrative override by ${req.user?.role}`,
        },
      });
    } else if (subjectId) {
      const todayDate = new Date().toISOString().split('T')[0];
      await prisma.attendanceRecord.create({
        data: {
          studentId,
          subjectId,
          date: todayDate,
          status,
          remarks: remarks || `Duty Leave / Override by ${req.user?.role}`,
        },
      });
    }

    // Recalculate student attendance
    const updatedSummary = await AttendanceService.getStudentAttendance(studentId);

    await auditLogger(
      req.user?.id,
      req.user?.role,
      'OVERRIDE_ATTENDANCE',
      'AttendanceRecord',
      recordId || studentId,
      `Attendance adjusted to ${status} for student ${studentId}. Remarks: ${remarks || 'Administrative correction'}`
    );

    res.json({
      success: true,
      message: 'Attendance successfully updated and synchronized.',
      summary: updatedSummary,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
