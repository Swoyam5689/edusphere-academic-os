import { prisma } from '../config/prisma.js';

export class AlertEngineService {
  /**
   * Run rule-based institutional alerts generator
   */
  static async evaluateInstitutionalAlerts() {
    // 1. Critical attendance count (<60%)
    const criticalAttendanceCount = await prisma.student.count({
      where: { attendancePct: { lt: 60, gt: 0 } },
    });

    if (criticalAttendanceCount > 0) {
      await prisma.institutionalAlert.create({
        data: {
          title: 'Critical Attendance Deficit',
          description: `${criticalAttendanceCount} student(s) currently maintain overall attendance below 60%. Immediate advisor intervention is advised.`,
          category: 'CRITICAL',
          targetRole: 'ALL',
        },
      });
    }

    // 2. Overloaded faculty count (>90 workload)
    const overloadedFacultyCount = await prisma.faculty.count({
      where: { workloadScore: { gte: 90 } },
    });

    if (overloadedFacultyCount > 0) {
      await prisma.institutionalAlert.create({
        data: {
          title: 'Faculty Workload Warning',
          description: `${overloadedFacultyCount} faculty member(s) are classified as OVERLOADED (score >= 90). Workload rebalancing is recommended.`,
          category: 'WARNING',
          targetRole: 'ADMIN',
        },
      });
    }

    // 3. High/Critical Risk Students count (Risk >= 60)
    const highRiskCount = await prisma.student.count({
      where: { riskScore: { gte: 60 } },
    });

    if (highRiskCount > 0) {
      await prisma.institutionalAlert.create({
        data: {
          title: 'At-Risk Academic Cohort Alert',
          description: `${highRiskCount} student(s) identified with High/Critical Academic Risk due to attendance, backlogs, or performance drops.`,
          category: 'WARNING',
          targetRole: 'ADVISOR',
        },
      });
    }

    // 4. Positive KPI alert (Average CGPA)
    const avgCgpaResult = await prisma.student.aggregate({
      _avg: { cgpa: true },
      where: { cgpa: { gt: 0 } },
    });

    if (avgCgpaResult._avg.cgpa && avgCgpaResult._avg.cgpa >= 7.0) {
      await prisma.institutionalAlert.create({
        data: {
          title: 'Institutional Academic Momentum',
          description: `University-wide average CGPA stands at a healthy ${avgCgpaResult._avg.cgpa.toFixed(2)} / 10.0.`,
          category: 'POSITIVE',
          targetRole: 'CHAIRMAN',
        },
      });
    }
  }

  /**
   * Create notification for student when faculty uploads a class resource
   */
  static async notifyStudentsOnResourceUpload(resourceId: string) {
    const resource = await prisma.classResource.findUnique({
      where: { id: resourceId },
      include: {
        subject: true,
        faculty: { include: { user: { select: { name: true } } } },
      },
    });

    if (!resource) return;

    // Find all students enrolled in this subject
    const enrollments = await prisma.enrollment.findMany({
      where: { subjectId: resource.subjectId, status: 'ACTIVE' },
      include: { student: { select: { userId: true } } },
    });

    const notificationsData = enrollments.map(e => ({
      userId: e.student.userId,
      title: `New Material: ${resource.subject.code}`,
      message: `${resource.faculty.user.name} uploaded new lecture material for "${resource.topic}".`,
      type: 'RESOURCE',
      relatedEntityId: resource.id,
      relatedEntityType: 'ClassResource',
      link: `/student/resources?subjectId=${resource.subjectId}`,
    }));

    if (notificationsData.length > 0) {
      await prisma.notification.createMany({
        data: notificationsData,
      });
    }
  }
}

export default AlertEngineService;
