import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext.js';

// Layouts
import StudentLayout from './layouts/StudentLayout.js';
import AdminLayout from './layouts/AdminLayout.js';

// Pages
import LoginPage from './pages/LoginPage.js';
import StudentDashboard from './pages/student/StudentDashboard.js';
import StudentAttendance from './pages/student/StudentAttendance.js';
import StudentPerformance from './pages/student/StudentPerformance.js';
import StudentTimetable from './pages/student/StudentTimetable.js';
import StudentResources from './pages/student/StudentResources.js';
import StudentAssignments from './pages/student/StudentAssignments.js';
import StudentExams from './pages/student/StudentExams.js';
import StudentProfile from './pages/student/StudentProfile.js';

import FacultyDashboard from './pages/faculty/FacultyDashboard.js';
import FacultyAttendance from './pages/faculty/FacultyAttendance.js';
import FacultyResources from './pages/faculty/FacultyResources.js';
import FacultyAssignments from './pages/faculty/FacultyAssignments.js';
import FacultyWorkload from './pages/faculty/FacultyWorkload.js';

import AdminCommandCenter from './pages/admin/AdminCommandCenter.js';
import AttendanceAnalytics from './pages/admin/AttendanceAnalytics.js';
import AtRiskStudents from './pages/admin/AtRiskStudents.js';
import FacultyWorkloadManager from './pages/admin/FacultyWorkloadManager.js';
import InstitutionalInsights from './pages/admin/InstitutionalInsights.js';
import StudentManager from './pages/admin/StudentManager.js';
import DepartmentManager from './pages/admin/DepartmentManager.js';
import ReportsManager from './pages/admin/ReportsManager.js';

const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles,
}) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-sky-400 font-mono text-sm">
        Loading EduSphere...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect based on current role
    if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
    if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
    return <Navigate to="/admin/command-center" replace />;
  }

  return <>{children}</>;
};

const RootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center text-sky-400 font-mono text-sm">
        Initializing EduSphere...
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;
  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />;
  if (user.role === 'FACULTY') return <Navigate to="/faculty/dashboard" replace />;
  return <Navigate to="/admin/command-center" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Student Experience */}
          <Route
            path="/student"
            element={
              <ProtectedRoute allowedRoles={['STUDENT', 'CHAIRMAN', 'UNIVERSITY_ADMIN']}>
                <StudentLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<StudentDashboard />} />
            <Route path="attendance" element={<StudentAttendance />} />
            <Route path="performance" element={<StudentPerformance />} />
            <Route path="timetable" element={<StudentTimetable />} />
            <Route path="resources" element={<StudentResources />} />
            <Route path="assignments" element={<StudentAssignments />} />
            <Route path="exams" element={<StudentExams />} />
            <Route path="profile" element={<StudentProfile />} />
          </Route>

          {/* Faculty Experience */}
          <Route
            path="/faculty"
            element={
              <ProtectedRoute allowedRoles={['FACULTY', 'ADVISOR', 'HOD', 'CAMPUS_ADMIN', 'UNIVERSITY_ADMIN', 'CHAIRMAN']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="dashboard" element={<FacultyDashboard />} />
            <Route path="attendance" element={<FacultyAttendance />} />
            <Route path="resources" element={<FacultyResources />} />
            <Route path="assignments" element={<FacultyAssignments />} />
            <Route path="workload" element={<FacultyWorkload />} />
          </Route>

          {/* Admin & Chairman Experience */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={['CAMPUS_ADMIN', 'UNIVERSITY_ADMIN', 'CHAIRMAN', 'HOD', 'ADVISOR', 'FACULTY']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="command-center" element={<AdminCommandCenter />} />
            <Route path="analytics/drilldown" element={<AttendanceAnalytics />} />
            <Route path="at-risk" element={<AtRiskStudents />} />
            <Route path="workload" element={<FacultyWorkloadManager />} />
            <Route path="insights" element={<InstitutionalInsights />} />
            <Route path="students" element={<StudentManager />} />
            <Route path="campuses" element={<DepartmentManager />} />
            <Route path="departments" element={<DepartmentManager />} />
            <Route path="reports" element={<ReportsManager />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
};

export default App;
