import { prisma } from '../config/prisma.js';

export class ExportService {
  /**
   * Helper to escape CSV cell contents
   */
  private static escapeCsv(value: any): string {
    if (value === null || value === undefined) return '""';
    const str = String(value).replace(/"/g, '""');
    return `"${str}"`;
  }

  /**
   * Export students report to CSV
   */
  static async exportStudentsCsv(filters: { campusId?: string; departmentId?: string; riskLevel?: string }) {
    const students = await prisma.student.findMany({
      where: {
        campusId: filters.campusId || undefined,
        departmentId: filters.departmentId || undefined,
        riskLevel: filters.riskLevel || undefined,
      },
      include: {
        user: { select: { name: true, email: true, phone: true } },
        campus: { select: { name: true } },
        department: { select: { name: true } },
        program: { select: { name: true } },
      },
      orderBy: { studentRollNo: 'asc' },
    });

    const headers = [
      'Roll Number',
      'Name',
      'Email',
      'Phone',
      'Campus',
      'Department',
      'Program',
      'Year',
      'Semester',
      'Section',
      'Attendance %',
      'CGPA',
      'Current GPA',
      'Risk Score',
      'Risk Level',
      'Placement Status',
    ];

    const rows = students.map(s => [
      this.escapeCsv(s.studentRollNo),
      this.escapeCsv(s.user.name),
      this.escapeCsv(s.user.email),
      this.escapeCsv(s.user.phone || 'N/A'),
      this.escapeCsv(s.campus.name),
      this.escapeCsv(s.department.name),
      this.escapeCsv(s.program.name),
      this.escapeCsv(s.currentYear),
      this.escapeCsv(s.currentSemester),
      this.escapeCsv(s.section),
      this.escapeCsv(s.attendancePct.toFixed(1)),
      this.escapeCsv(s.cgpa.toFixed(2)),
      this.escapeCsv(s.currentGpa.toFixed(2)),
      this.escapeCsv(s.riskScore.toFixed(0)),
      this.escapeCsv(s.riskLevel),
      this.escapeCsv(s.placementStatus),
    ]);

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }

  /**
   * Export faculty workload report to CSV
   */
  static async exportFacultyWorkloadCsv(filters: { campusId?: string; departmentId?: string }) {
    const facultyList = await prisma.faculty.findMany({
      where: {
        campusId: filters.campusId || undefined,
        departmentId: filters.departmentId || undefined,
      },
      include: {
        user: { select: { name: true, email: true } },
        campus: { select: { name: true } },
        department: { select: { name: true } },
        workloadRecords: { orderBy: { calculatedAt: 'desc' }, take: 1 },
      },
      orderBy: { workloadScore: 'desc' },
    });

    const headers = [
      'Employee ID',
      'Faculty Name',
      'Email',
      'Campus',
      'Department',
      'Designation',
      'Workload Score (0-100)',
      'Workload Status',
      'Teaching Hours/Wk',
      'Active Subjects',
      'Student Volume',
      'Pending Grading',
      'Rebalancing Advice',
    ];

    const rows = facultyList.map(f => {
      const w = f.workloadRecords[0];
      return [
        this.escapeCsv(f.facultyEmpId),
        this.escapeCsv(f.user.name),
        this.escapeCsv(f.user.email),
        this.escapeCsv(f.campus.name),
        this.escapeCsv(f.department.name),
        this.escapeCsv(f.designation),
        this.escapeCsv(f.workloadScore.toFixed(1)),
        this.escapeCsv(f.workloadStatus),
        this.escapeCsv(w?.teachingHours || 0),
        this.escapeCsv(w?.totalSubjects || 0),
        this.escapeCsv(w?.totalStudents || 0),
        this.escapeCsv(w?.assignmentLoad || 0),
        this.escapeCsv(w?.recommendation || 'Balanced workload'),
      ];
    });

    return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}

export default ExportService;
