import { prisma } from '../config/prisma.js';

export interface CalculatedWorkload {
  facultyId: string;
  facultyName: string;
  facultyEmpId: string;
  departmentName: string;
  campusName: string;
  designation: string;
  teachingHours: number;
  totalClasses: number;
  totalStudents: number;
  totalSubjects: number;
  assignmentLoad: number;
  advisorLoad: number;
  calculatedScore: number;
  status: 'LIGHT' | 'BALANCED' | 'HEAVY' | 'OVERLOADED';
  recommendation: string | null;
}

export class WorkloadEngineService {
  /**
   * Calculate workload for a single faculty member
   */
  static async calculateFacultyWorkload(facultyId: string): Promise<CalculatedWorkload> {
    const faculty = await prisma.faculty.findUnique({
      where: { id: facultyId },
      include: {
        user: { select: { name: true } },
        department: { select: { id: true, name: true } },
        campus: { select: { name: true } },
        timetableSlots: {
          include: { subject: true },
        },
        assignments: {
          include: { submissions: { where: { status: 'SUBMITTED' } } },
        },
        advisedStudents: { select: { id: true } },
      },
    });

    if (!faculty) throw new Error(`Faculty ${facultyId} not found`);

    // 1. Weekly teaching hours (approx 1 hour per timetable slot)
    const totalClasses = faculty.timetableSlots.length;
    const teachingHours = totalClasses * 1.0;

    // 2. Distinct subjects taught
    const subjectIds = new Set(faculty.timetableSlots.map(t => t.subjectId));
    const totalSubjects = subjectIds.size;

    // 3. Total active students taught in faculty's assigned sections & department
    const subjectSectionPairs = Array.from(new Set(faculty.timetableSlots.map(t => `${t.subjectId}___${t.section}`)));
    let totalStudents = 0;
    if (subjectSectionPairs.length > 0) {
      const orConditions = subjectSectionPairs.map(pair => {
        const [subId, sec] = pair.split('___');
        return {
          subjectId: subId,
          student: {
            campusId: faculty.campusId,
            departmentId: faculty.departmentId,
            section: sec,
          },
        };
      });

      const activeEnrollments = await prisma.enrollment.findMany({
        where: {
          status: 'ACTIVE',
          OR: orConditions,
        },
        select: { studentId: true },
      });
      const uniqueStudentIds = new Set(activeEnrollments.map(e => e.studentId));
      totalStudents = uniqueStudentIds.size;
    }

    if (totalStudents === 0 && faculty.timetableSlots.length > 0) {
      const distinctSections = new Set(faculty.timetableSlots.map(t => `${t.subjectId}-${t.section}`)).size;
      totalStudents = distinctSections * 38 + faculty.advisedStudents.length;
    }

    // 4. Pending assignments to grade
    let pendingGrading = 0;
    for (const assignment of faculty.assignments) {
      pendingGrading += assignment.submissions.length;
    }

    // 5. Advising load
    const advisorLoad = faculty.advisedStudents.length;

    // Normalized Score Calculation (0 - 100)
    // Teaching hours weight (up to 16h = 50 pts)
    const hoursScore = Math.min(50, (teachingHours / 16) * 50);
    // Student volume weight (up to 100 students = 25 pts)
    const studentScore = Math.min(25, (totalStudents / 80) * 25);
    // Subject diversity weight (up to 2 subjects = 15 pts)
    const subjectScore = Math.min(15, (totalSubjects / 2) * 15);
    // Grading + Advisor load (up to 10 pts)
    const extraScore = Math.min(10, (pendingGrading * 1.5) + (advisorLoad * 0.5) + 5);

    const rawScore = Number((hoursScore + studentScore + subjectScore + extraScore).toFixed(1));
    const calculatedScore = Math.min(100, Math.max(10, rawScore));

    let status: 'LIGHT' | 'BALANCED' | 'HEAVY' | 'OVERLOADED' = 'BALANCED';
    if (calculatedScore >= 91) status = 'OVERLOADED';
    else if (calculatedScore >= 76) status = 'HEAVY';
    else if (calculatedScore >= 51) status = 'BALANCED';
    else status = 'LIGHT';

    // Workload recommendation
    let recommendation: string | null = null;
    if (status === 'OVERLOADED' || status === 'HEAVY') {
      // Find candidate peer faculty in same department with LIGHT or BALANCED load
      const candidatePeers = await prisma.faculty.findMany({
        where: {
          departmentId: faculty.departmentId,
          id: { not: facultyId },
          workloadStatus: { in: ['LIGHT', 'BALANCED'] },
        },
        include: { user: { select: { name: true } } },
        orderBy: { workloadScore: 'asc' },
        take: 1,
      });

      if (candidatePeers.length > 0) {
        const peer = candidatePeers[0];
        recommendation = `${faculty.user.name} is overloaded (${calculatedScore}/100). Consider redistributing one section to ${peer.user.name} (${peer.workloadScore}/100, ${peer.workloadStatus}).`;
      } else {
        recommendation = `${faculty.user.name} is heavily loaded. Consider onboarding adjunct faculty or redistributing elective courses.`;
      }
    }

    // Persist to database
    await prisma.faculty.update({
      where: { id: facultyId },
      data: {
        workloadScore: calculatedScore,
        workloadStatus: status,
      },
    });

    await prisma.facultyWorkload.create({
      data: {
        facultyId,
        teachingHours,
        totalClasses,
        totalStudents,
        totalSubjects,
        assignmentLoad: pendingGrading,
        advisorLoad,
        calculatedScore,
        status,
        recommendation,
      },
    });

    return {
      facultyId,
      facultyName: faculty.user.name,
      facultyEmpId: faculty.facultyEmpId,
      departmentName: faculty.department.name,
      campusName: faculty.campus.name,
      designation: faculty.designation,
      teachingHours,
      totalClasses,
      totalStudents,
      totalSubjects,
      assignmentLoad: pendingGrading,
      advisorLoad,
      calculatedScore,
      status,
      recommendation,
    };
  }

  /**
   * Recalculate workloads for all faculty
   */
  static async evaluateAllFaculty() {
    const allFaculty = await prisma.faculty.findMany({ select: { id: true } });
    for (const f of allFaculty) {
      await this.calculateFacultyWorkload(f.id);
    }
  }
}

export default WorkloadEngineService;
