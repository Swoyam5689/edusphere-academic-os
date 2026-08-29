export type Role =
  | 'STUDENT'
  | 'FACULTY'
  | 'ADVISOR'
  | 'HOD'
  | 'CAMPUS_ADMIN'
  | 'UNIVERSITY_ADMIN'
  | 'CHAIRMAN';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  avatar?: string | null;
  phone?: string | null;
  campus?: { id: string; name: string; code: string } | null;
  department?: { id: string; name: string; code: string } | null;
  studentId?: string | null;
  facultyId?: string | null;
  unreadNotificationsCount?: number;
}

export interface StudentDashboardData {
  student: {
    name: string;
    rollNo: string;
    department: string;
    program: string;
    campus: string;
    semester: number;
    year: number;
    section: string;
    cgpa: number;
    currentGpa: number;
    overallAttendance: number;
    creditsCompleted: number;
    academicStanding: string;
    advisor: { name: string; email: string } | null;
  };
  todayClasses: Array<{
    id: string;
    time: string;
    subject: string;
    subjectCode: string;
    faculty: string;
    room: string;
    status: string;
  }>;
  todayLearning: {
    count: number;
    resources: Array<{
      id: string;
      subjectCode: string;
      subjectName: string;
      topic: string;
      title: string;
      facultyName: string;
      fileType: string;
      fileUrl: string;
      fileName: string;
      uploadDate: string;
    }>;
  };
  smartInsights: string[];
  upcomingAssignments: Array<{
    id: string;
    title: string;
    subject: string;
    deadline: string;
    maxMarks: number;
    isSubmitted: boolean;
  }>;
  upcomingExams: Array<{
    id: string;
    subject: string;
    examType: string;
    examDate: string;
    time: string;
    room: string;
  }>;
}

export interface SubjectAttendanceItem {
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

export interface StudentAttendanceData {
  summary: {
    overallConducted: number;
    overallAttended: number;
    overallMissed: number;
    overallPercentage: number;
    status: 'GOOD' | 'NORMAL' | 'WARNING' | 'CRITICAL';
    subjectMetrics: SubjectAttendanceItem[];
  };
  history: Array<{
    id: string;
    date: string;
    subjectCode: string;
    subjectName: string;
    topic: string;
    faculty: string;
    status: string;
    remarks?: string | null;
  }>;
}

export interface StudentPerformanceData {
  currentGpa: number;
  cgpa: number;
  currentSemester: number;
  enrollments: Array<{
    id: string;
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    credits: number;
    semester: number;
    internalMarks: number;
    midtermMarks: number;
    assignmentsMarks: number;
    practicalMarks: number;
    finalMarks: number;
    totalMarks: number;
    grade: string;
    gradePoint: number;
  }>;
  semesterTrends: Array<{
    semester: number;
    semesterName: string;
    gpa: number;
    credits: number;
    subjectsCount: number;
  }>;
  examResults: any[];
}

export interface ClassResourceItem {
  id: string;
  subjectId: string;
  facultyId: string;
  topic: string;
  title: string;
  description?: string | null;
  fileType: string;
  fileName: string;
  fileUrl: string;
  fileSize?: string | null;
  uploadDate: string;
  isToday: boolean;
  subject?: { name: string; code: string };
  faculty?: { user: { name: string } };
}

export interface FacultyDashboardData {
  faculty: {
    id: string;
    name: string;
    empId: string;
    department: string;
    campus: string;
    designation: string;
    avgRating: number;
    reviewCount: number;
  };
  metrics: {
    studentsAssigned: number;
    subjectsTaught: number;
    classesPerWeek: number;
    pendingGrading: number;
    workloadScore: number;
    workloadStatus: 'LIGHT' | 'BALANCED' | 'HEAVY' | 'OVERLOADED';
    workloadRecommendation: string | null;
  };
  todaySchedule: Array<{
    id: string;
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    time: string;
    room: string;
    section: string;
  }>;
  todaySessions: Array<{
    id: string;
    subjectId: string;
    subjectCode: string;
    subjectName: string;
    time: string;
    room: string;
    section: string;
    topic: string;
    status: string;
    resourcesCount: number;
  }>;
}

export interface CommandCenterData {
  kpis: {
    totalStudents: number;
    totalFaculty: number;
    totalCampuses: number;
    totalDepartments: number;
    avgAttendance: number;
    avgCgpa: number;
    atRiskCount: number;
    atRiskPercentage: number;
    avgFacultyWorkload: number;
    overloadedFacultyCount: number;
    placementRate: number;
    resourceCoveragePct: number;
  };
  charts: {
    departments: Array<{
      id: string;
      name: string;
      fullName: string;
      studentsCount: number;
      avgAttendance: number;
      avgCgpa: number;
      avgWorkload: number;
      atRiskCount: number;
    }>;
    campuses: Array<{
      id: string;
      name: string;
      code: string;
      avgAttendance: number;
      avgCgpa: number;
      atRiskPct: number;
      studentsCount: number;
      facultyCount: number;
    }>;
  };
  alerts: Array<{
    id: string;
    title: string;
    description: string;
    category: 'CRITICAL' | 'WARNING' | 'INFORMATION' | 'POSITIVE';
    createdAt: string;
  }>;
}

export interface InstitutionalInsight {
  id: string;
  category: 'ATTENDANCE' | 'PERFORMANCE' | 'WORKLOAD' | 'RESOURCES' | 'PLACEMENT';
  type: 'CRITICAL' | 'WARNING' | 'POSITIVE' | 'NEUTRAL';
  headline: string;
  detail: string;
  metric: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  link?: string | null;
  createdAt: string;
}
