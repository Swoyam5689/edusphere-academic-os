import { prisma } from '../config/prisma.js';

export interface SubjectAttendanceMetrics {
  subjectId: string;
  subjectCode: string;
  subjectName: string;
  credits: number;
  conducted: number;
  attended: number;
  missed: number;
  percentage: number;
  missableClasses: number;
  requiredClasses: number;
  status: 'GOOD' | 'NORMAL' | 'WARNING' | 'CRITICAL';
}

export interface StudentAttendanceSummary {
  studentId: string;
  overallConducted: number;
  overallAttended: number;
  overallMissed: number;
  overallPercentage: number;
  status: 'GOOD' | 'NORMAL' | 'WARNING' | 'CRITICAL';
  subjectMetrics: SubjectAttendanceMetrics[];
}

export class AttendanceService {
  /**
   * Calculate attendance percentage and edge-case formulas
   */
  static calculateMetrics(conducted: number, attended: number) {
    if (conducted <= 0) {
      return {
        conducted: 0,
        attended: 0,
        missed: 0,
        percentage: 100.0,
        missableClasses: 0,
        requiredClasses: 0,
        status: 'GOOD' as const,
      };
    }

    const missed = Math.max(0, conducted - attended);
    const percentage = Number(((attended / conducted) * 100).toFixed(1));

    // Maximum classes that can be missed while staying at/above 75%
    // Formula: floor(attended / 0.75 - conducted)
    const rawMissable = Math.floor(attended / 0.75 - conducted);
    const missableClasses = Math.max(0, rawMissable);

    // Classes required to reach 75%
    // If already >= 75%, return 0.
    // Otherwise: (attended + x) / (conducted + x) >= 0.75
    // attended + x >= 0.75 * conducted + 0.75 * x
    // 0.25 * x >= 0.75 * conducted - attended
    // x >= (0.75 * conducted - attended) / 0.25
    let requiredClasses = 0;
    if (percentage < 75.0) {
      const needed = Math.ceil((0.75 * conducted - attended) / 0.25);
      requiredClasses = Math.max(1, needed);
    }

    let status: 'GOOD' | 'NORMAL' | 'WARNING' | 'CRITICAL' = 'GOOD';
    if (percentage >= 85.0) status = 'GOOD';
    else if (percentage >= 75.0) status = 'NORMAL';
    else if (percentage >= 65.0) status = 'WARNING';
    else status = 'CRITICAL';

    return {
      conducted,
      attended,
      missed,
      percentage,
      missableClasses,
      requiredClasses,
      status,
    };
  }

  /**
   * Get full attendance breakdown for a student
   */
  static async getStudentAttendance(studentId: string): Promise<StudentAttendanceSummary> {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          where: { status: 'ACTIVE' },
          include: { subject: true },
        },
        attendanceRecords: {
          include: {
            classSession: {
              include: { subject: true },
            },
          },
        },
      },
    });

    if (!student) {
      throw new Error(`Student ${studentId} not found`);
    }

    const subjectMetrics: SubjectAttendanceMetrics[] = [];
    let totalConducted = 0;
    let totalAttended = 0;

    for (const enrollment of student.enrollments) {
      const subjectRecords = student.attendanceRecords.filter(
        r => r.subjectId === enrollment.subjectId
      );

      const conducted = subjectRecords.length;
      const attended = subjectRecords.filter(r => r.status === 'PRESENT' || r.status === 'LATE').length;

      const calc = this.calculateMetrics(conducted, attended);
      totalConducted += conducted;
      totalAttended += attended;

      subjectMetrics.push({
        subjectId: enrollment.subject.id,
        subjectCode: enrollment.subject.code,
        subjectName: enrollment.subject.name,
        credits: enrollment.subject.credits,
        conducted: calc.conducted,
        attended: calc.attended,
        missed: calc.missed,
        percentage: calc.percentage,
        missableClasses: calc.missableClasses,
        requiredClasses: calc.requiredClasses,
        status: calc.status,
      });
    }

    const overallCalc = this.calculateMetrics(totalConducted, totalAttended);

    // Synchronize attendancePct on Student model
    if (student.attendancePct !== overallCalc.percentage) {
      await prisma.student.update({
        where: { id: studentId },
        data: { attendancePct: overallCalc.percentage },
      });
    }

    return {
      studentId,
      overallConducted: overallCalc.conducted,
      overallAttended: overallCalc.attended,
      overallMissed: overallCalc.missed,
      overallPercentage: overallCalc.percentage,
      status: overallCalc.status,
      subjectMetrics,
    };
  }

  /**
   * Mark attendance for an entire class session
   */
  static async recordClassAttendance(
    classSessionId: string,
    records: Array<{ studentId: string; status: 'PRESENT' | 'ABSENT' | 'LATE' | 'EXCUSED'; remarks?: string }>
  ) {
    const session = await prisma.classSession.findUnique({
      where: { id: classSessionId },
      include: { subject: true, faculty: true },
    });

    if (!session) {
      throw new Error('Class session not found');
    }

    // Find existing attendance records for this session
    const existingRecords = await prisma.attendanceRecord.findMany({
      where: { classSessionId },
    });
    const existingMap = new Map(existingRecords.map(r => [r.studentId, r.id]));

    for (const rec of records) {
      const existingId = existingMap.get(rec.studentId);
      if (existingId) {
        await prisma.attendanceRecord.update({
          where: { id: existingId },
          data: {
            status: rec.status,
            remarks: rec.remarks || null,
            date: session.date,
            subjectId: session.subjectId,
          },
        });
      } else {
        await prisma.attendanceRecord.create({
          data: {
            classSessionId,
            studentId: rec.studentId,
            subjectId: session.subjectId,
            date: session.date,
            status: rec.status,
            remarks: rec.remarks || null,
          },
        });
      }
    }

    // Update student percentages and trigger recalculation
    for (const rec of records) {
      await this.getStudentAttendance(rec.studentId);
    }

    return { success: true, count: records.length };
  }
}

export default AttendanceService;
