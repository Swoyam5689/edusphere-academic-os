import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { RiskEngineService } from '../server/src/services/risk.service.js';
import { WorkloadEngineService } from '../server/src/services/workload.service.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting EduSphere Database Seeder with Realistic Academic Architecture...');

  // Clean existing records in correct relation order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.institutionalAlert.deleteMany();
  await prisma.announcement.deleteMany();
  await prisma.feeRecord.deleteMany();
  await prisma.studentDocument.deleteMany();
  await prisma.achievement.deleteMany();
  await prisma.placementRecord.deleteMany();
  await prisma.riskAssessment.deleteMany();
  await prisma.facultyWorkload.deleteMany();
  await prisma.facultyReview.deleteMany();
  await prisma.examResult.deleteMany();
  await prisma.exam.deleteMany();
  await prisma.assignmentSubmission.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.classResource.deleteMany();
  await prisma.classSession.deleteMany();
  await prisma.timetableSlot.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();
  await prisma.program.deleteMany();
  await prisma.department.deleteMany();
  await prisma.campus.deleteMany();

  const passwordHash = await bcrypt.hash('demo123', 10);
  const todayDate = new Date().toISOString().split('T')[0];

  // ----------------------------------------------------
  // 1. CAMPUSES
  // ----------------------------------------------------
  console.log('Creating Campuses...');
  const mainCampus = await prisma.campus.create({
    data: { name: 'Main Campus (New Delhi)', code: 'DELHI', location: 'Knowledge Park, New Delhi', establishedYear: 1998 },
  });
  const jaipurCampus = await prisma.campus.create({
    data: { name: 'Jaipur Campus', code: 'JAIPUR', location: 'Sitapura Tech Zone, Jaipur', establishedYear: 2008 },
  });
  const blrCampus = await prisma.campus.create({
    data: { name: 'Bangalore Campus', code: 'BLR', location: 'Electronic City, Bangalore', establishedYear: 2012 },
  });
  const mumbaiCampus = await prisma.campus.create({
    data: { name: 'Mumbai Campus', code: 'MUMBAI', location: 'Navi Mumbai Hub', establishedYear: 2015 },
  });
  const hydCampus = await prisma.campus.create({
    data: { name: 'Hyderabad Campus', code: 'HYD', location: 'HITEC City, Hyderabad', establishedYear: 2018 },
  });

  const campuses = [mainCampus, jaipurCampus, blrCampus, mumbaiCampus, hydCampus];

  // ----------------------------------------------------
  // 2. DISTINCT ACADEMIC DEPARTMENTS (NO "AIDS", NO AMBIGUOUS CSE VARIANTS)
  // ----------------------------------------------------
  console.log('Creating Clean Academic Departments...');
  const cseDept = await prisma.department.create({
    data: { campusId: mainCampus.id, name: 'Computer Science & Engineering', code: 'CSE' },
  });
  const aimlDept = await prisma.department.create({
    data: { campusId: mainCampus.id, name: 'Artificial Intelligence & Machine Learning', code: 'AIML' },
  });
  const itDept = await prisma.department.create({
    data: { campusId: mainCampus.id, name: 'Information Technology', code: 'IT' },
  });
  const eceDept = await prisma.department.create({
    data: { campusId: mainCampus.id, name: 'Electronics & Communication Engineering', code: 'ECE' },
  });
  const meDept = await prisma.department.create({
    data: { campusId: mainCampus.id, name: 'Mechanical Engineering', code: 'MECH' },
  });
  const mbaDept = await prisma.department.create({
    data: { campusId: mainCampus.id, name: 'School of Business Management', code: 'MBA' },
  });

  const allDepts = [cseDept, aimlDept, itDept, eceDept, meDept, mbaDept];

  // ----------------------------------------------------
  // 3. DEGREE PROGRAMS
  // ----------------------------------------------------
  console.log('Creating Academic Programs...');
  const btechCse = await prisma.program.create({
    data: { departmentId: cseDept.id, name: 'B.Tech Computer Science & Engineering', code: 'BTECH-CSE', degreeLevel: 'UG', durationYears: 4, totalSemesters: 8 },
  });
  const btechAiml = await prisma.program.create({
    data: { departmentId: aimlDept.id, name: 'B.Tech AI & Machine Learning', code: 'BTECH-AIML', degreeLevel: 'UG', durationYears: 4, totalSemesters: 8 },
  });
  const btechIt = await prisma.program.create({
    data: { departmentId: itDept.id, name: 'B.Tech Information Technology', code: 'BTECH-IT', degreeLevel: 'UG', durationYears: 4, totalSemesters: 8 },
  });
  const btechEce = await prisma.program.create({
    data: { departmentId: eceDept.id, name: 'B.Tech Electronics & Communication', code: 'BTECH-ECE', degreeLevel: 'UG', durationYears: 4, totalSemesters: 8 },
  });
  const btechMech = await prisma.program.create({
    data: { departmentId: meDept.id, name: 'B.Tech Mechanical Engineering', code: 'BTECH-ME', degreeLevel: 'UG', durationYears: 4, totalSemesters: 8 },
  });
  const mbaProgram = await prisma.program.create({
    data: { departmentId: mbaDept.id, name: 'Master of Business Administration', code: 'MBA-CORE', degreeLevel: 'PG', durationYears: 2, totalSemesters: 4 },
  });

  // ----------------------------------------------------
  // 4. DISTINCT STANDARD SUBJECTS
  // ----------------------------------------------------
  console.log('Creating Standard Course Subjects...');
  
  // CSE Courses
  const dbmsSubject = await prisma.subject.create({
    data: {
      departmentId: cseDept.id,
      programId: btechCse.id,
      code: 'CS501',
      name: 'Database Management Systems',
      credits: 4,
      semester: 5,
      syllabus: 'Relational Model, ER Diagrams, Normalization (1NF to BCNF), SQL Queries, Transaction Management, ACID, Indexing.',
    },
  });

  const networksSubject = await prisma.subject.create({
    data: {
      departmentId: cseDept.id,
      programId: btechCse.id,
      code: 'CS502',
      name: 'Computer Networks & Security',
      credits: 4,
      semester: 5,
      syllabus: 'OSI & TCP/IP stack, Routing protocols (OSPF, BGP), Congestion Control, Transport Layer, Cryptography.',
    },
  });

  const osSubject = await prisma.subject.create({
    data: {
      departmentId: cseDept.id,
      programId: btechCse.id,
      code: 'CS503',
      name: 'Operating Systems & Concurrency',
      credits: 4,
      semester: 5,
      syllabus: 'Process Management, Threads, CPU Scheduling, Deadlocks, Virtual Memory, File Systems.',
    },
  });

  const seSubject = await prisma.subject.create({
    data: {
      departmentId: cseDept.id,
      programId: btechCse.id,
      code: 'CS504',
      name: 'Software Engineering & Architecture',
      credits: 3,
      semester: 5,
      syllabus: 'Agile & DevOps, Microservices Architecture, Design Patterns, CI/CD Pipelines, Testing.',
    },
  });

  const webSubject = await prisma.subject.create({
    data: {
      departmentId: cseDept.id,
      programId: btechCse.id,
      code: 'CS505',
      name: 'Full-Stack Web Technologies',
      credits: 3,
      semester: 5,
      syllabus: 'REST APIs, React, Node.js, TypeScript, State Management, Cloud Deployment.',
    },
  });

  // AIML Courses
  const dlSubject = await prisma.subject.create({
    data: {
      departmentId: aimlDept.id,
      programId: btechAiml.id,
      code: 'AI501',
      name: 'Deep Learning Architectures',
      credits: 4,
      semester: 5,
      syllabus: 'CNNs, RNNs, Transformers, Attention Mechanisms, Backpropagation, PyTorch.',
    },
  });

  const nlpSubject = await prisma.subject.create({
    data: {
      departmentId: aimlDept.id,
      programId: btechAiml.id,
      code: 'AI502',
      name: 'Natural Language Processing',
      credits: 4,
      semester: 5,
      syllabus: 'Word Embeddings, BERT, LLMs, Text Classification, Sequence-to-Sequence models.',
    },
  });

  // IT Courses
  const cloudSubject = await prisma.subject.create({
    data: {
      departmentId: itDept.id,
      programId: btechIt.id,
      code: 'IT501',
      name: 'Cloud Computing & Distributed Systems',
      credits: 4,
      semester: 5,
      syllabus: 'AWS, GCP, Kubernetes, Containerization, Serverless, Distributed Hash Tables.',
    },
  });

  // ECE Courses
  const dspSubject = await prisma.subject.create({
    data: {
      departmentId: eceDept.id,
      programId: btechEce.id,
      code: 'EC501',
      name: 'Digital Signal Processing',
      credits: 4,
      semester: 5,
      syllabus: 'DFT, FFT Algorithms, Digital Filter Design, Spectral Analysis, MATLAB simulations.',
    },
  });

  // MECH Courses
  const thermoSubject = await prisma.subject.create({
    data: {
      departmentId: meDept.id,
      programId: btechMech.id,
      code: 'ME501',
      name: 'Applied Thermodynamics',
      credits: 4,
      semester: 5,
      syllabus: 'Gas Turbines, Steam Power Cycles, Refrigeration, Heat Transfer, Entropy Analysis.',
    },
  });

  // MBA Courses
  const finSubject = await prisma.subject.create({
    data: {
      departmentId: mbaDept.id,
      programId: mbaProgram.id,
      code: 'MB501',
      name: 'Corporate Financial Management',
      credits: 4,
      semester: 1,
      syllabus: 'Capital Budgeting, Cost of Capital, Working Capital Management, Portfolio Theory.',
    },
  });

  const cseSubjects = [dbmsSubject, networksSubject, osSubject, seSubject, webSubject];
  const allSubjects = [dbmsSubject, networksSubject, osSubject, seSubject, webSubject, dlSubject, nlpSubject, cloudSubject, dspSubject, thermoSubject, finSubject];

  // ----------------------------------------------------
  // 5. CORE DEMO USER ACCOUNTS
  // ----------------------------------------------------
  console.log('Creating Core Demo Users & Faculty Profiles...');

  // A. CHAIRMAN
  const chairmanUser = await prisma.user.create({
    data: {
      email: 'chairman@demo.com',
      passwordHash,
      role: 'CHAIRMAN',
      name: 'Dr. K. R. Raman',
      phone: '+91 98110 99001',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      campusId: mainCampus.id,
    },
  });

  // B. UNIVERSITY ADMIN
  const adminUser = await prisma.user.create({
    data: {
      email: 'admin@demo.com',
      passwordHash,
      role: 'UNIVERSITY_ADMIN',
      name: 'Dr. V. K. Iyer',
      phone: '+91 98110 99002',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      campusId: mainCampus.id,
    },
  });

  // C. HOD (CSE)
  const hodUser = await prisma.user.create({
    data: {
      email: 'hod@demo.com',
      passwordHash,
      role: 'HOD',
      name: 'Dr. Priya Patel',
      phone: '+91 98110 99003',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      campusId: mainCampus.id,
      departmentId: cseDept.id,
    },
  });
  const hodFaculty = await prisma.faculty.create({
    data: {
      userId: hodUser.id,
      facultyEmpId: 'FAC-CSE-HOD',
      campusId: mainCampus.id,
      departmentId: cseDept.id,
      designation: 'Professor & Head of Department',
      qualification: 'Ph.D. in Computer Science (IIT Bombay)',
      experienceYears: 18,
      officeRoom: 'B101',
      officeHours: 'Mon, Wed 02:00 PM - 04:00 PM',
      avgStudentRating: 4.85,
      reviewCount: 42,
      workloadScore: 68.0,
      workloadStatus: 'BALANCED',
    },
  });
  await prisma.department.update({ where: { id: cseDept.id }, data: { hodFacultyId: hodFaculty.id } });

  // D. DEMO FACULTY (Dr. Rajesh Sharma - OVERLOADED SCENARIO 94/100)
  const facultyUser = await prisma.user.create({
    data: {
      email: 'faculty@demo.com',
      passwordHash,
      role: 'FACULTY',
      name: 'Dr. Rajesh Sharma',
      phone: '+91 98110 99004',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      campusId: mainCampus.id,
      departmentId: cseDept.id,
    },
  });
  const demoFaculty = await prisma.faculty.create({
    data: {
      userId: facultyUser.id,
      facultyEmpId: 'FAC-CSE-001',
      campusId: mainCampus.id,
      departmentId: cseDept.id,
      designation: 'Senior Associate Professor',
      qualification: 'Ph.D. in Distributed Data Systems (IIT Delhi)',
      experienceYears: 12,
      officeRoom: 'B204',
      officeHours: 'Tue, Thu 11:00 AM - 01:00 PM',
      avgStudentRating: 4.75,
      reviewCount: 58,
      workloadScore: 94.0,
      workloadStatus: 'OVERLOADED',
    },
  });

  // E. PEER FACULTY (Dr. Amit Singh - LIGHT LOAD 44/100 FOR REBALANCING)
  const peerFacultyUser = await prisma.user.create({
    data: {
      email: 'dr.singh@demo.com',
      passwordHash,
      role: 'FACULTY',
      name: 'Dr. Amit Singh',
      phone: '+91 98110 99015',
      avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      campusId: mainCampus.id,
      departmentId: cseDept.id,
    },
  });
  const peerFaculty = await prisma.faculty.create({
    data: {
      userId: peerFacultyUser.id,
      facultyEmpId: 'FAC-CSE-002',
      campusId: mainCampus.id,
      departmentId: cseDept.id,
      designation: 'Assistant Professor',
      qualification: 'Ph.D. in Network Security (BITS Pilani)',
      experienceYears: 5,
      officeRoom: 'B208',
      officeHours: 'Mon, Fri 10:00 AM - 12:00 PM',
      avgStudentRating: 4.6,
      reviewCount: 24,
      workloadScore: 44.0,
      workloadStatus: 'LIGHT',
    },
  });

  // F. CHIEF ACADEMIC ADVISOR (Prof. S. Verma - ASSIGNED 45 STUDENTS)
  const advisorUser = await prisma.user.create({
    data: {
      email: 'advisor@demo.com',
      passwordHash,
      role: 'ADVISOR',
      name: 'Prof. S. Verma',
      phone: '+91 98110 99005',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      campusId: mainCampus.id,
      departmentId: cseDept.id,
    },
  });
  const advisorFaculty = await prisma.faculty.create({
    data: {
      userId: advisorUser.id,
      facultyEmpId: 'FAC-CSE-ADV',
      campusId: mainCampus.id,
      departmentId: cseDept.id,
      designation: 'Associate Professor & Chief Academic Advisor',
      qualification: 'M.Tech, Ph.D. (IIT Roorkee)',
      experienceYears: 14,
      officeRoom: 'A302',
      officeHours: 'Everyday 03:00 PM - 05:00 PM',
      avgStudentRating: 4.9,
      reviewCount: 36,
      workloadScore: 68.0,
      workloadStatus: 'BALANCED',
      isAdvisor: true,
    },
  });

  // G. DEMO STUDENT (Rahul Sharma - Exact 61.5% Networks Attendance, 70/100 High Risk)
  const studentUser = await prisma.user.create({
    data: {
      email: 'student@demo.com',
      passwordHash,
      role: 'STUDENT',
      name: 'Rahul Sharma',
      phone: '+91 98765 43210',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
      campusId: mainCampus.id,
      departmentId: cseDept.id,
    },
  });
  const demoStudent = await prisma.student.create({
    data: {
      userId: studentUser.id,
      studentRollNo: '23CSE101',
      campusId: mainCampus.id,
      departmentId: cseDept.id,
      programId: btechCse.id,
      currentYear: 3,
      currentSemester: 5,
      section: 'A',
      admissionYear: 2023,
      advisorFacultyId: advisorFaculty.id,
      cgpa: 5.8,
      currentGpa: 5.1,
      attendancePct: 74.2,
      riskScore: 70.0,
      riskLevel: 'HIGH',
      placementStatus: 'ELIGIBLE',
    },
  });

  // ----------------------------------------------------
  // 6. TIMETABLE SLOTS FOR FACULTY
  // ----------------------------------------------------
  console.log('Generating Timetable Slots...');

  // Dr. Rajesh Sharma teaches DBMS & OS across Section A, B, C (16 hrs/wk -> Overloaded 94/100 load)
  const drSharmaSlots = [
    { day: 'Monday', start: '09:00', end: '10:00', room: 'B204', sec: 'A', subj: dbmsSubject.id },
    { day: 'Monday', start: '10:00', end: '11:00', room: 'B204', sec: 'B', subj: dbmsSubject.id },
    { day: 'Monday', start: '14:00', end: '15:00', room: 'B204', sec: 'C', subj: dbmsSubject.id },
    { day: 'Tuesday', start: '09:00', end: '10:00', room: 'B204', sec: 'A', subj: dbmsSubject.id },
    { day: 'Tuesday', start: '11:00', end: '12:00', room: 'B204', sec: 'B', subj: dbmsSubject.id },
    { day: 'Tuesday', start: '14:00', end: '15:00', room: 'A102', sec: 'A', subj: osSubject.id },
    { day: 'Wednesday', start: '09:00', end: '10:00', room: 'B204', sec: 'C', subj: dbmsSubject.id },
    { day: 'Wednesday', start: '11:00', end: '12:00', room: 'A102', sec: 'A', subj: osSubject.id },
    { day: 'Wednesday', start: '14:00', end: '15:00', room: 'A102', sec: 'B', subj: osSubject.id },
    { day: 'Thursday', start: '09:00', end: '10:00', room: 'B204', sec: 'A', subj: dbmsSubject.id },
    { day: 'Thursday', start: '10:00', end: '11:00', room: 'B204', sec: 'B', subj: dbmsSubject.id },
    { day: 'Thursday', start: '14:00', end: '15:00', room: 'A102', sec: 'C', subj: osSubject.id },
    { day: 'Friday', start: '09:00', end: '10:00', room: 'B204', sec: 'C', subj: dbmsSubject.id },
    { day: 'Friday', start: '11:00', end: '12:00', room: 'A102', sec: 'A', subj: osSubject.id },
    { day: 'Friday', start: '14:00', end: '15:00', room: 'A102', sec: 'B', subj: osSubject.id },
    { day: 'Friday', start: '15:00', end: '16:00', room: 'A102', sec: 'C', subj: osSubject.id },
  ];

  for (const s of drSharmaSlots) {
    await prisma.timetableSlot.create({
      data: {
        campusId: mainCampus.id,
        departmentId: cseDept.id,
        programId: btechCse.id,
        subjectId: s.subj,
        facultyId: demoFaculty.id,
        dayOfWeek: s.day,
        startTime: s.start,
        endTime: s.end,
        roomNo: s.room,
        section: s.sec,
        semester: 5,
        academicYear: '2025-2026',
      },
    });
  }

  // Dr. Amit Singh teaches Networks (6 hrs/wk -> Light load)
  const slotNetA = await prisma.timetableSlot.create({
    data: {
      campusId: mainCampus.id,
      departmentId: cseDept.id,
      programId: btechCse.id,
      subjectId: networksSubject.id,
      facultyId: peerFaculty.id,
      dayOfWeek: 'Tuesday',
      startTime: '10:00',
      endTime: '11:00',
      roomNo: 'C302',
      section: 'A',
      semester: 5,
      academicYear: '2025-2026',
    },
  });

  // Prof. S. Verma (Advisor) teaches Web Technologies & Software Engineering (10 hrs/wk)
  const slotWebA = await prisma.timetableSlot.create({
    data: {
      campusId: mainCampus.id,
      departmentId: cseDept.id,
      programId: btechCse.id,
      subjectId: webSubject.id,
      facultyId: advisorFaculty.id,
      dayOfWeek: 'Thursday',
      startTime: '09:00',
      endTime: '10:00',
      roomNo: 'B108',
      section: 'A',
      semester: 5,
      academicYear: '2025-2026',
    },
  });

  const slotSeA = await prisma.timetableSlot.create({
    data: {
      campusId: mainCampus.id,
      departmentId: cseDept.id,
      programId: btechCse.id,
      subjectId: seSubject.id,
      facultyId: advisorFaculty.id,
      dayOfWeek: 'Friday',
      startTime: '10:00',
      endTime: '11:00',
      roomNo: 'B108',
      section: 'A',
      semester: 5,
      academicYear: '2025-2026',
    },
  });

  // ----------------------------------------------------
  // 7. CLASS SESSIONS & SAME-DAY MATERIAL
  // ----------------------------------------------------
  console.log("Creating Today's Class Sessions & Materials...");

  const sessionDbms = await prisma.classSession.create({
    data: {
      facultyId: demoFaculty.id,
      subjectId: dbmsSubject.id,
      section: 'A',
      roomNo: 'B204',
      date: todayDate,
      startTime: '09:00',
      endTime: '10:00',
      topic: 'Normalization & Functional Dependencies',
      status: 'COMPLETED',
    },
  });

  const sessionWeb = await prisma.classSession.create({
    data: {
      facultyId: advisorFaculty.id,
      subjectId: webSubject.id,
      section: 'A',
      roomNo: 'B108',
      date: todayDate,
      startTime: '09:00',
      endTime: '10:00',
      topic: 'Full-Stack Architecture & REST API Design',
      status: 'COMPLETED',
    },
  });

  // Seed verified resources for Today's Learning
  const resourceDbms = await prisma.classResource.create({
    data: {
      facultyId: demoFaculty.id,
      subjectId: dbmsSubject.id,
      classSessionId: sessionDbms.id,
      topic: 'Normalization & Functional Dependencies',
      title: 'Lecture Slides — Normalization (1NF, 2NF, 3NF, BCNF)',
      description: 'Comprehensive decomposition proofs, losslessness, dependency preservation and candidate keys.',
      fileType: 'PPT',
      fileName: 'DBMS_Unit3_Normalization_Slides.pptx',
      fileUrl: '/uploads/resources/CS501/DBMS_Unit3_Normalization_Slides.pptx',
      fileSize: '4.8 MB',
      uploadDate: todayDate,
      isToday: true,
    },
  });

  const resourceWeb = await prisma.classResource.create({
    data: {
      facultyId: advisorFaculty.id,
      subjectId: webSubject.id,
      classSessionId: sessionWeb.id,
      topic: 'Full-Stack Architecture & REST API Design',
      title: 'Lecture Notes — REST API Best Practices & JWT Authentication',
      description: 'Design patterns, status codes, stateless JWT token workflow, role based guards.',
      fileType: 'PDF',
      fileName: 'WebEng_Module4_REST_JWT.pdf',
      fileUrl: '/uploads/resources/CS505/WebEng_Module4_REST_JWT.pdf',
      fileSize: '2.4 MB',
      uploadDate: todayDate,
      isToday: true,
    },
  });

  // ----------------------------------------------------
  // 8. SEED DEMO STUDENT ENROLLMENTS & EXACT ATTENDANCE (61.5% in Networks)
  // ----------------------------------------------------
  console.log('Seeding Demo Student Academic History...');

  // 1. DBMS: 21 Attended / 25 Total = 84.0% (Normal)
  const enrDbms = await prisma.enrollment.create({
    data: {
      studentId: demoStudent.id,
      subjectId: dbmsSubject.id,
      semester: 5,
      academicYear: '2025-2026',
      status: 'ACTIVE',
      internalMarks: 18.0,
      midtermMarks: 16.5,
      assignmentsMarks: 9.0,
      practicalMarks: 8.5,
      finalMarks: 32.0,
      totalMarks: 84.0,
      grade: 'A',
      gradePoint: 9.0,
    },
  });
  for (let i = 1; i <= 25; i++) {
    await prisma.attendanceRecord.create({
      data: {
        studentId: demoStudent.id,
        subjectId: dbmsSubject.id,
        classSessionId: i === 25 ? sessionDbms.id : null,
        date: `2026-08-${(i % 28 + 1).toString().padStart(2, '0')}`,
        status: i <= 21 ? 'PRESENT' : 'ABSENT',
      },
    });
  }

  // 2. Networks: 16 Attended / 26 Total = 61.5% (<75% Alert!)
  const enrNet = await prisma.enrollment.create({
    data: {
      studentId: demoStudent.id,
      subjectId: networksSubject.id,
      semester: 5,
      academicYear: '2025-2026',
      status: 'ACTIVE',
      internalMarks: 11.0,
      midtermMarks: 10.0,
      assignmentsMarks: 4.5,
      practicalMarks: 5.0,
      finalMarks: 24.0,
      totalMarks: 54.5,
      grade: 'C',
      gradePoint: 6.0,
    },
  });
  for (let i = 1; i <= 26; i++) {
    await prisma.attendanceRecord.create({
      data: {
        studentId: demoStudent.id,
        subjectId: networksSubject.id,
        date: `2026-08-${(i % 28 + 1).toString().padStart(2, '0')}`,
        status: i <= 16 ? 'PRESENT' : 'ABSENT',
      },
    });
  }

  // 3. Operating Systems: 20 Attended / 24 Total = 83.3%
  await prisma.enrollment.create({
    data: {
      studentId: demoStudent.id,
      subjectId: osSubject.id,
      semester: 5,
      academicYear: '2025-2026',
      status: 'ACTIVE',
      internalMarks: 14.0,
      midtermMarks: 13.0,
      assignmentsMarks: 7.0,
      practicalMarks: 7.5,
      finalMarks: 28.0,
      totalMarks: 69.5,
      grade: 'B',
      gradePoint: 7.0,
    },
  });
  for (let i = 1; i <= 24; i++) {
    await prisma.attendanceRecord.create({
      data: {
        studentId: demoStudent.id,
        subjectId: osSubject.id,
        date: `2026-08-${(i % 28 + 1).toString().padStart(2, '0')}`,
        status: i <= 20 ? 'PRESENT' : 'ABSENT',
      },
    });
  }

  // 4. Software Engineering: 19 Attended / 22 Total = 86.4%
  await prisma.enrollment.create({
    data: {
      studentId: demoStudent.id,
      subjectId: seSubject.id,
      semester: 5,
      academicYear: '2025-2026',
      status: 'ACTIVE',
      internalMarks: 15.0,
      midtermMarks: 14.0,
      assignmentsMarks: 7.5,
      practicalMarks: 8.0,
      finalMarks: 30.0,
      totalMarks: 74.5,
      grade: 'B+',
      gradePoint: 8.0,
    },
  });

  // 5. Web Technologies: 18 Attended / 23 Total = 78.3%
  await prisma.enrollment.create({
    data: {
      studentId: demoStudent.id,
      subjectId: webSubject.id,
      semester: 5,
      academicYear: '2025-2026',
      status: 'ACTIVE',
      internalMarks: 16.0,
      midtermMarks: 15.0,
      assignmentsMarks: 8.0,
      practicalMarks: 8.5,
      finalMarks: 31.0,
      totalMarks: 78.5,
      grade: 'A',
      gradePoint: 9.0,
    },
  });

  // ----------------------------------------------------
  // 9. ASSIGNMENTS (3 OVERDUE FOR DEMO STUDENT)
  // ----------------------------------------------------
  console.log('Seeding Course Assignments & Submissions...');

  const assignmentDbms = await prisma.assignment.create({
    data: {
      subjectId: dbmsSubject.id,
      facultyId: demoFaculty.id,
      title: 'ER Modeling & Relational Schema Mapping',
      description: 'Convert complex enterprise business requirements into 3NF normalized relation tables with integrity constraints.',
      deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // Active
      maxMarks: 100,
    },
  });

  const assignmentNet = await prisma.assignment.create({
    data: {
      subjectId: networksSubject.id,
      facultyId: peerFaculty.id,
      title: 'Packet Sniffing & TCP Congestion Analysis with Wireshark',
      description: 'Capture 3-way TCP handshake and simulate slow start / fast retransmit states.',
      deadline: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000), // Overdue #1
      maxMarks: 100,
    },
  });

  const assignmentOs = await prisma.assignment.create({
    data: {
      subjectId: osSubject.id,
      facultyId: demoFaculty.id,
      title: 'Process Scheduling Simulator in C++',
      description: 'Implement Round Robin and Preemptive Priority CPU scheduling algorithms.',
      deadline: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000), // Overdue #2
      maxMarks: 100,
    },
  });

  const assignmentSe = await prisma.assignment.create({
    data: {
      subjectId: seSubject.id,
      facultyId: advisorFaculty.id,
      title: 'Microservices Design Document & UML Sequence Diagrams',
      description: 'Design architecture for an event-driven payment processing gateway.',
      deadline: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // Overdue #3
      maxMarks: 100,
    },
  });

  // Student submission for DBMS (Submitted & Graded)
  await prisma.assignmentSubmission.create({
    data: {
      assignmentId: assignmentDbms.id,
      studentId: demoStudent.id,
      fileUrl: '/uploads/submissions/23CSE101_DBMS_A1.pdf',
      comments: 'Completed all 5 relation schema mappings and checked BCNF keys.',
      submissionDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      status: 'SUBMITTED',
    },
  });

  // ----------------------------------------------------
  // 10. LARGE COHORT GENERATION (40 FACULTY & 1,200 STUDENTS)
  // ----------------------------------------------------
  console.log('Generating Realistic Multi-Faculty & Student Body...');

  const firstNames = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Shaurya', 'Atharv', 'Advik', 'Pranav', 'Advaith', 'Aayush', 'Dhruv', 'Kabir', 'Ananya', 'Diya', 'Saanvi', 'Myra', 'Aadhya', 'Aarohi', 'Pari', 'Anika', 'Navya', 'Avni', 'Isha', 'Riya', 'Sneha', 'Tanvi', 'Meera', 'Kavya', 'Simran', 'Pooja', 'Neha', 'Priyanka', 'Ritika', 'Shreya'];
  const lastNames = ['Sharma', 'Verma', 'Patel', 'Iyer', 'Singh', 'Gupta', 'Kumar', 'Reddy', 'Chopra', 'Malhotra', 'Joshi', 'Mehta', 'Nair', 'Deshmukh', 'Bose', 'Chatterjee', 'Kapoor', 'Rao', 'Bhat', 'Saxena'];

  const allFacultyList = [demoFaculty, peerFaculty, advisorFaculty, hodFaculty];

  // Seed remaining 36 faculty across all departments and campuses
  for (let f = 1; f <= 36; f++) {
    const fName = firstNames[f % firstNames.length];
    const lName = lastNames[f % lastNames.length];
    const dept = allDepts[f % allDepts.length];
    const campus = campuses[f % campuses.length];

    const fUser = await prisma.user.create({
      data: {
        email: `faculty.${f}@demo.com`,
        passwordHash,
        role: 'FACULTY',
        name: `Dr. ${fName} ${lName}`,
        campusId: campus.id,
        departmentId: dept.id,
      },
    });

    const fRecord = await prisma.faculty.create({
      data: {
        userId: fUser.id,
        facultyEmpId: `FAC-${dept.code}-${(f + 10).toString().padStart(3, '0')}`,
        campusId: campus.id,
        departmentId: dept.id,
        designation: f % 4 === 0 ? 'Professor' : f % 2 === 0 ? 'Associate Professor' : 'Assistant Professor',
        qualification: 'Ph.D. in Engineering / Sciences',
        experienceYears: 4 + (f % 16),
        avgStudentRating: Number((4.1 + (f % 9) * 0.1).toFixed(2)),
        reviewCount: 15 + (f % 35),
        workloadScore: 55.0,
        workloadStatus: 'BALANCED',
      },
    });

    allFacultyList.push(fRecord);

    // Assign timetable slots for this faculty in their department subject
    const deptSubject = allSubjects.find(s => s.departmentId === dept.id) || dbmsSubject;
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    // Varied slots count (2 to 5 classes/wk)
    const teachingSlotsCount = 2 + (f % 4);
    // Assign specific section for this faculty
    const primarySection = ['A', 'B', 'C', 'D'][f % 4];

    for (let slot = 0; slot < teachingSlotsCount; slot++) {
      const section = slot >= 3 ? ['A', 'B', 'C', 'D'][(f + 1) % 4] : primarySection;
      await prisma.timetableSlot.create({
        data: {
          campusId: campus.id,
          departmentId: dept.id,
          programId: btechCse.id,
          subjectId: deptSubject.id,
          facultyId: fRecord.id,
          dayOfWeek: days[slot % days.length],
          startTime: `${(9 + slot).toString().padStart(2, '0')}:00`,
          endTime: `${(10 + slot).toString().padStart(2, '0')}:00`,
          roomNo: `R-${(100 + (f * 3 + slot) % 50).toString()}`,
          section,
          semester: 5,
          academicYear: '2025-2026',
        },
      });
    }
  }

  // Seed 1,200 students with smooth realistic distribution (75% healthy, 15% medium, 10% critical)
  console.log('Generating 1,200 Realistically Distributed Student Records...');

  for (let s = 1; s <= 1200; s++) {
    const fName = firstNames[s % firstNames.length];
    const lName = lastNames[(s * 3) % lastNames.length];
    const campus = campuses[s % campuses.length];
    const dept = allDepts[s % allDepts.length];
    const year = (s % 4) + 1;
    const semester = year * 2 - (s % 2);
    const section = ['A', 'B', 'C', 'D'][s % 4];

    // Distribute advising load
    const assignedAdvisor = s <= 45 ? advisorFaculty : allFacultyList[s % allFacultyList.length];

    // Deterministic realistic granular variance
    const isCriticalRisk = s % 10 === 0; // 10%
    const isMediumRisk = s % 5 === 0 && !isCriticalRisk; // 15%

    let att = 0;
    let gpa = 0;
    let currentGpa = 0;

    if (isCriticalRisk) {
      // 47.5% - 63.5% with granular decimal variations
      att = Number((47.5 + ((s * 13) % 160) * 0.1).toFixed(1));
      // 3.85 - 5.15 with granular decimal variations
      gpa = Number((3.85 + ((s * 17) % 130) * 0.01).toFixed(2));
      // Noticeable semester drop of 5% to 25%
      const drop = Number((0.20 + (s % 8) * 0.12).toFixed(2));
      currentGpa = Number(Math.max(2.8, gpa - drop).toFixed(2));
    } else if (isMediumRisk) {
      // 66.0% - 74.5% with granular decimal variations
      att = Number((66.0 + ((s * 11) % 85) * 0.1).toFixed(1));
      // 5.40 - 6.95 with granular decimal variations
      gpa = Number((5.40 + ((s * 19) % 155) * 0.01).toFixed(2));
      const drop = Number(((s % 3 === 0 ? 0.35 : -0.15)).toFixed(2));
      currentGpa = Number(Math.max(4.5, gpa - drop).toFixed(2));
    } else {
      // 78.0% - 98.5% healthy
      att = Number((78.0 + ((s * 7) % 205) * 0.1).toFixed(1));
      // 7.20 - 9.85 healthy
      gpa = Number((7.20 + ((s * 23) % 265) * 0.01).toFixed(2));
      currentGpa = Number(Math.min(10.0, Math.max(6.5, gpa + ((s % 4 === 0 ? -0.2 : 0.15)))).toFixed(2));
    }

    const sUser = await prisma.user.create({
      data: {
        email: `student.${s}@edusphere.edu`,
        passwordHash,
        role: 'STUDENT',
        name: `${fName} ${lName}`,
        campusId: campus.id,
        departmentId: dept.id,
      },
    });

    const studentRecord = await prisma.student.create({
      data: {
        userId: sUser.id,
        studentRollNo: `23${dept.code}${s.toString().padStart(4, '0')}`,
        campusId: campus.id,
        departmentId: dept.id,
        programId: btechCse.id,
        currentYear: year,
        currentSemester: semester,
        section,
        admissionYear: 2023 - (year - 1),
        advisorFacultyId: assignedAdvisor.id,
        cgpa: gpa,
        currentGpa,
        attendancePct: att,
        riskScore: 0,
        riskLevel: 'LOW',
        placementStatus: gpa >= 7.0 ? (s % 2 === 0 ? 'PLACED' : 'ELIGIBLE') : 'INELIGIBLE',
      },
    });

    // Seed enrollments for all students in department subject
    const deptSubject = allSubjects.find(sub => sub.departmentId === dept.id) || dbmsSubject;
    await prisma.enrollment.create({
      data: {
        studentId: studentRecord.id,
        subjectId: deptSubject.id,
        semester,
        academicYear: '2025-2026',
        status: 'ACTIVE',
        internalMarks: Number((12 + (s % 8)).toFixed(1)),
        midtermMarks: Number((12 + (s % 7)).toFixed(1)),
        assignmentsMarks: Number((6 + (s % 4)).toFixed(1)),
        practicalMarks: Number((6 + (s % 4)).toFixed(1)),
        finalMarks: Number((24 + (s % 14)).toFixed(1)),
        totalMarks: isCriticalRisk && (s % 3 === 0) ? 35.0 : Number((60 + (s % 35)).toFixed(1)),
        grade: isCriticalRisk && (s % 3 === 0) ? 'F' : gpa >= 8.5 ? 'A+' : gpa >= 7.5 ? 'A' : gpa >= 6.0 ? 'B' : 'C',
        gradePoint: isCriticalRisk && (s % 3 === 0) ? 0.0 : gpa >= 8.5 ? 10.0 : gpa >= 7.5 ? 9.0 : gpa >= 6.0 ? 7.0 : 5.0,
      },
    });

    // Also enroll CSE students into core 5 subjects
    if (dept.code === 'CSE' && s <= 280) {
      for (const subj of cseSubjects) {
        if (subj.id !== deptSubject.id) {
          await prisma.enrollment.create({
            data: {
              studentId: studentRecord.id,
              subjectId: subj.id,
              semester,
              academicYear: '2025-2026',
              status: 'ACTIVE',
              internalMarks: Number((14 + (s % 6)).toFixed(1)),
              midtermMarks: Number((13 + (s % 6)).toFixed(1)),
              assignmentsMarks: Number((7 + (s % 3)).toFixed(1)),
              practicalMarks: Number((7 + (s % 3)).toFixed(1)),
              finalMarks: Number((28 + (s % 12)).toFixed(1)),
              totalMarks: Number((65 + (s % 30)).toFixed(1)),
              grade: 'B+',
              gradePoint: 8.0,
            },
          });
        }
      }
    }

    // Seed Placement Record for placed students
    if (studentRecord.placementStatus === 'PLACED') {
      const companies = ['Google India', 'Microsoft', 'Amazon AWS', 'Adobe', 'Goldman Sachs', 'Infosys', 'TCS Digital', 'Wipro Turbo'];
      await prisma.placementRecord.create({
        data: {
          studentId: studentRecord.id,
          companyName: companies[s % companies.length],
          role: s % 3 === 0 ? 'Software Development Engineer' : 'Data Analyst',
          packageLpa: Number((12.0 + (s % 28) * 1.5).toFixed(1)),
          offerDate: '2026-07-15',
          status: 'SELECTED',
        },
      });
    }

    // Seed Fee records
    await prisma.feeRecord.create({
      data: {
        studentId: studentRecord.id,
        semester,
        academicYear: '2025-2026',
        totalAmount: 95000,
        paidAmount: isCriticalRisk ? 30000 : 95000,
        pendingAmount: isCriticalRisk ? 65000 : 0,
        dueDate: '2026-09-30',
        status: isCriticalRisk ? 'PARTIAL' : 'PAID',
      },
    });
  }

  // ----------------------------------------------------
  // 11. ANNOUNCEMENTS & INSTITUTIONAL ALERTS
  // ----------------------------------------------------
  console.log('Generating Institutional Announcements & Alerts...');

  await prisma.announcement.createMany({
    data: [
      {
        title: 'Mid-Semester Examination Schedule Released',
        content: 'Midterm assessments for all undergraduate and postgraduate programs will commence next Monday. Check room allocations under Exams tab.',
        targetScope: 'UNIVERSITY',
        authorName: 'Office of the Academic Dean',
      },
      {
        title: 'Campus Placement Drive: Google & Microsoft',
        content: 'Registration window open for final year B.Tech and PG students with CGPA >= 7.5. Submit resumes by Friday.',
        targetScope: 'DEPARTMENT',
        authorName: 'Corporate Training & Placement Cell',
      },
    ],
  });

  await prisma.institutionalAlert.createMany({
    data: [
      {
        title: 'Low Attendance Alert in Networks (CS502)',
        description: '28 students currently below 65% attendance in CSE Year 3 Section A. Automated advisory notices dispatched.',
        category: 'CRITICAL',
        targetRole: 'ALL',
        departmentId: cseDept.id,
      },
      {
        title: 'Faculty Workload Capacity Rebalance Triggered',
        description: 'Dr. Rajesh Sharma is overloaded at 94/100 index. Automated section rebalance recommendation generated.',
        category: 'WARNING',
        targetRole: 'ADMIN',
      },
      {
        title: 'Class Learning Material Coverage Verified',
        description: '100% of today lecture sessions have uploaded slides/notes in Today Learning repository.',
        category: 'POSITIVE',
        targetRole: 'ALL',
      },
    ],
  });

  // Calculate actual workloads for all faculty to ensure mathematical precision
  console.log('Running Automatic Workload Recalculation across body...');
  await WorkloadEngineService.evaluateAllFaculty();

  // Run Risk Engine across all students to generate distinct risk scores and assessments
  console.log('Running Automatic Risk Engine across all students...');
  await RiskEngineService.evaluateAllStudents();

  console.log('✅ Realistic Database Seeding completed successfully!');
  console.log('   Student:         student@demo.com    / demo123 (Rahul Sharma, 70/100 Risk)');
  console.log('   Faculty:         faculty@demo.com    / demo123 (Dr. Sharma, 94/100 Overloaded)');
  console.log('   Advisor:         advisor@demo.com    / demo123 (Prof. Verma, 45 Advised Students)');
  console.log('   HOD:             hod@demo.com        / demo123 (Dr. Patel, Clean CSE/AIML Depts)');
  console.log('   Campus Admin:    admin@demo.com      / demo123 (Dr. Iyer)');
  console.log('   Chairman:        chairman@demo.com   / demo123 (Dr. Raman)');
  console.log('----------------------------------------------------');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
