import { prisma } from '../config/prisma.js';

export interface ConflictCheckParams {
  facultyId: string;
  roomNo: string;
  section: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  excludeSlotId?: string;
}

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: string[];
}

export class TimetableService {
  /**
   * Helper to check time overlap between two intervals (e.g. "09:00" - "10:00" and "09:30" - "10:30")
   */
  static isTimeOverlapping(startA: string, endA: string, startB: string, endB: string): boolean {
    return startA < endB && startB < endA;
  }

  /**
   * Detect timetable conflicts for faculty, room, or section
   */
  static async checkConflicts(params: ConflictCheckParams): Promise<ConflictResult> {
    const { facultyId, roomNo, section, dayOfWeek, startTime, endTime, excludeSlotId } = params;

    const existingSlots = await prisma.timetableSlot.findMany({
      where: {
        dayOfWeek,
        id: excludeSlotId ? { not: excludeSlotId } : undefined,
      },
      include: {
        faculty: { include: { user: { select: { name: true } } } },
        subject: { select: { name: true, code: true } },
      },
    });

    const conflicts: string[] = [];

    for (const slot of existingSlots) {
      if (this.isTimeOverlapping(startTime, endTime, slot.startTime, slot.endTime)) {
        // 1. Faculty conflict
        if (slot.facultyId === facultyId) {
          conflicts.push(
            `Faculty Conflict: ${slot.faculty.user.name} is already teaching ${slot.subject.code} (${slot.subject.name}) on ${dayOfWeek} from ${slot.startTime} to ${slot.endTime}.`
          );
        }

        // 2. Room conflict
        if (slot.roomNo.toLowerCase().trim() === roomNo.toLowerCase().trim()) {
          conflicts.push(
            `Room Conflict: Room ${slot.roomNo} is already occupied by ${slot.faculty.user.name} for ${slot.subject.code} on ${dayOfWeek} from ${slot.startTime} to ${slot.endTime}.`
          );
        }

        // 3. Section conflict
        if (slot.section.toLowerCase().trim() === section.toLowerCase().trim()) {
          conflicts.push(
            `Section Conflict: Section '${section}' already has a class scheduled for ${slot.subject.code} on ${dayOfWeek} from ${slot.startTime} to ${slot.endTime}.`
          );
        }
      }
    }

    return {
      hasConflict: conflicts.length > 0,
      conflicts,
    };
  }

  /**
   * Get weekly timetable for a student based on their section & enrolled subjects
   */
  static async getStudentTimetable(studentId: string) {
    const student = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: { select: { subjectId: true } },
      },
    });

    if (!student) throw new Error('Student not found');

    const subjectIds = student.enrollments.map(e => e.subjectId);

    const slots = await prisma.timetableSlot.findMany({
      where: {
        subjectId: { in: subjectIds },
        section: student.section,
      },
      include: {
        subject: true,
        faculty: { include: { user: { select: { name: true, email: true } } } },
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return slots;
  }

  /**
   * Get weekly teaching timetable for a faculty member
   */
  static async getFacultyTimetable(facultyId: string) {
    const slots = await prisma.timetableSlot.findMany({
      where: { facultyId },
      include: {
        subject: true,
        department: true,
        campus: true,
      },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });

    return slots;
  }
}

export default TimetableService;
