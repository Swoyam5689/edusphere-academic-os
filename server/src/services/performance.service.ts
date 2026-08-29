import { prisma } from '../config/prisma.js';

export interface GradeScale {
  minMarks: number;
  maxMarks: number;
  grade: string;
  gradePoint: number;
}

export const DEFAULT_GRADE_SCALES: GradeScale[] = [
  { minMarks: 90, maxMarks: 100, grade: 'A+', gradePoint: 10.0 },
  { minMarks: 80, maxMarks: 89.99, grade: 'A', gradePoint: 9.0 },
  { minMarks: 70, maxMarks: 79.99, grade: 'B+', gradePoint: 8.0 },
  { minMarks: 60, maxMarks: 69.99, grade: 'B', gradePoint: 7.0 },
  { minMarks: 50, maxMarks: 59.99, grade: 'C', gradePoint: 6.0 },
  { minMarks: 40, maxMarks: 49.99, grade: 'D', gradePoint: 5.0 },
  { minMarks: 0, maxMarks: 39.99, grade: 'F', gradePoint: 0.0 },
];

export class PerformanceService {
  /**
   * Determine grade and grade point from total marks
   */
  static getGradeFromMarks(marks: number, scales: GradeScale[] = DEFAULT_GRADE_SCALES): { grade: string; gradePoint: number } {
    const clampedMarks = Math.max(0, Math.min(100, marks));
    for (const scale of scales) {
      if (clampedMarks >= scale.minMarks && clampedMarks <= scale.maxMarks + 0.001) {
        return { grade: scale.grade, gradePoint: scale.gradePoint };
      }
    }
    return { grade: 'F', gradePoint: 0.0 };
  }

  /**
   * Recalculate enrollment total marks, grade, GPA, and CGPA for a student
   */
  static async recalculateStudentAcademicStanding(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: { subject: true },
        },
      },
    });

    if (!student) throw new Error(`Student ${studentId} not found`);

    let currentSemesterTotalQualityPoints = 0;
    let currentSemesterTotalCredits = 0;

    let cumulativeQualityPoints = 0;
    let cumulativeCredits = 0;

    for (const enrollment of student.enrollments) {
      const internal = enrollment.internalMarks || 0;
      const midterm = enrollment.midtermMarks || 0;
      const assignments = enrollment.assignmentsMarks || 0;
      const practical = enrollment.practicalMarks || 0;
      const final = enrollment.finalMarks || 0;

      // Internal: 20, Midterm: 20, Assignments: 10, Practical: 10, Final: 40 = 100 max
      const totalMarks = Number((internal + midterm + assignments + practical + final).toFixed(1));
      const { grade, gradePoint } = this.getGradeFromMarks(totalMarks);

      await prisma.enrollment.update({
        where: { id: enrollment.id },
        data: {
          totalMarks,
          grade,
          gradePoint,
        },
      });

      const credits = enrollment.subject.credits;
      const qualityPoints = credits * gradePoint;

      if (enrollment.semester === student.currentSemester) {
        currentSemesterTotalQualityPoints += qualityPoints;
        currentSemesterTotalCredits += credits;
      }

      cumulativeQualityPoints += qualityPoints;
      cumulativeCredits += credits;
    }

    const currentGpa =
      currentSemesterTotalCredits > 0
        ? Number((currentSemesterTotalQualityPoints / currentSemesterTotalCredits).toFixed(2))
        : 0.0;

    const cgpa =
      cumulativeCredits > 0
        ? Number((cumulativeQualityPoints / cumulativeCredits).toFixed(2))
        : 0.0;

    await prisma.student.update({
      where: { id: studentId },
      data: {
        currentGpa,
        cgpa,
      },
    });

    return {
      studentId,
      currentGpa,
      cgpa,
      totalCredits: cumulativeCredits,
    };
  }

  /**
   * Get comprehensive performance record for a student
   */
  static async getStudentPerformance(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: {
          include: { subject: true },
          orderBy: { semester: 'asc' },
        },
        examResults: {
          include: { exam: { include: { subject: true } } },
        },
      },
    });

    if (!student) throw new Error('Student not found');

    // Group enrollments by semester
    const semestersMap = new Map<number, typeof student.enrollments>();
    for (const enrollment of student.enrollments) {
      if (!semestersMap.has(enrollment.semester)) {
        semestersMap.set(enrollment.semester, []);
      }
      semestersMap.get(enrollment.semester)!.push(enrollment);
    }

    const semesterTrends = Array.from(semestersMap.entries()).map(([sem, enrollments]) => {
      let qp = 0;
      let credits = 0;
      for (const e of enrollments) {
        const c = e.subject.credits;
        const gp = e.gradePoint || 0;
        qp += c * gp;
        credits += c;
      }
      const gpa = credits > 0 ? Number((qp / credits).toFixed(2)) : 0;
      return {
        semester: sem,
        semesterName: `Semester ${sem}`,
        gpa,
        credits,
        subjectsCount: enrollments.length,
      };
    });

    return {
      currentGpa: student.currentGpa,
      cgpa: student.cgpa,
      currentSemester: student.currentSemester,
      enrollments: student.enrollments.map(e => ({
        id: e.id,
        subjectId: e.subject.id,
        subjectCode: e.subject.code,
        subjectName: e.subject.name,
        credits: e.subject.credits,
        semester: e.semester,
        internalMarks: e.internalMarks,
        midtermMarks: e.midtermMarks,
        assignmentsMarks: e.assignmentsMarks,
        practicalMarks: e.practicalMarks,
        finalMarks: e.finalMarks,
        totalMarks: e.totalMarks,
        grade: e.grade,
        gradePoint: e.gradePoint,
      })),
      semesterTrends,
      examResults: student.examResults,
    };
  }
}

export default PerformanceService;
