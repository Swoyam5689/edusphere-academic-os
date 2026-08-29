const API_BASE_URL = '/api';

class ApiClient {
  private getToken(): string | null {
    return localStorage.getItem('edusphere_token');
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        localStorage.removeItem('edusphere_token');
      }

      let data: any = {};
      try {
        data = await response.json();
      } catch (jsonErr) {
        data = { success: response.ok, error: response.statusText };
      }

      if (!response.ok || data.success === false) {
        throw new Error(data.error || `Request failed with status ${response.status}`);
      }

      return data as T;
    } catch (err: any) {
      console.warn(`[API] ${endpoint} error:`, err.message);
      throw err;
    }
  }

  // Auth APIs
  async login(email: string, password: string) {
    return this.request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  }

  async demoLogin(roleKey: string) {
    return this.request<{ success: boolean; token: string; user: any; targetUrl?: string }>('/auth/demo-login', {
      method: 'POST',
      body: JSON.stringify({ roleKey }),
    });
  }

  async getCurrentUser() {
    return this.request<{ success: boolean; user: any }>('/auth/me');
  }

  async logout() {
    return this.request<{ success: boolean }>('/auth/logout', { method: 'POST' });
  }

  // Student APIs
  async getStudentDashboard() {
    return this.request<any>('/student/dashboard');
  }

  async getStudentAttendance() {
    return this.request<any>('/student/attendance');
  }

  async getStudentPerformance() {
    return this.request<any>('/student/performance');
  }

  async getStudentTimetable() {
    return this.request<any>('/student/timetable');
  }

  async getStudentResources(subjectId?: string, search?: string) {
    const params = new URLSearchParams();
    if (subjectId) params.append('subjectId', subjectId);
    if (search) params.append('search', search);
    return this.request<any>(`/student/resources?${params.toString()}`);
  }

  async getStudentAssignments() {
    return this.request<any>('/student/assignments');
  }

  async submitAssignment(assignmentId: string, comments: string, fileUrl?: string) {
    return this.request<any>(`/student/assignments/${assignmentId}/submit`, {
      method: 'POST',
      body: JSON.stringify({ comments, fileUrl }),
    });
  }

  async getStudentExams() {
    return this.request<any>('/student/exams');
  }

  async getStudentProfile() {
    return this.request<any>('/student/profile');
  }

  async getNotifications() {
    return this.request<any>('/student/notifications');
  }

  async markNotificationRead(id: string) {
    return this.request<any>(`/student/notifications/${id}/read`, { method: 'PUT' });
  }

  async markAllNotificationsRead() {
    return this.request<any>('/student/notifications/mark-all-read', { method: 'PUT' });
  }

  // Faculty APIs
  async getFacultyDashboard() {
    return this.request<any>('/faculty/dashboard');
  }

  async getFacultySubjects() {
    return this.request<any>('/faculty/subjects');
  }

  async getFacultyTodaySessions() {
    return this.request<any>('/faculty/sessions/today');
  }

  async createClassSession(data: { subjectId: string; topic: string; section?: string; roomNo?: string }) {
    return this.request<any>('/faculty/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async createFacultyAssignment(data: { subjectId: string; title: string; description?: string; deadline?: string; maxMarks?: number }) {
    return this.request<any>('/faculty/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async uploadClassResource(data: {
    subjectId: string;
    classSessionId?: string;
    topic: string;
    title: string;
    description?: string;
    fileType?: string;
    fileName?: string;
    fileSize?: string;
  }) {
    return this.request<any>('/faculty/resources/upload', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSessionAttendanceMatrix(sessionId: string) {
    return this.request<any>(`/faculty/attendance/${sessionId}`);
  }

  async saveSessionAttendance(sessionId: string, records: Array<{ studentId: string; status: string; remarks?: string }>) {
    return this.request<any>(`/faculty/attendance/${sessionId}`, {
      method: 'POST',
      body: JSON.stringify({ records }),
    });
  }

  async getFacultyAssignments() {
    return this.request<any>('/faculty/assignments');
  }

  async gradeAssignmentSubmission(assignmentId: string, submissionId: string, marksObtained: number, feedback?: string) {
    return this.request<any>(`/faculty/assignments/${assignmentId}/grade`, {
      method: 'POST',
      body: JSON.stringify({ submissionId, marksObtained, feedback }),
    });
  }

  async getFacultyWorkload() {
    return this.request<any>('/faculty/workload');
  }

  // Admin / Command Center APIs
  async getCommandCenter(campusId?: string, departmentId?: string) {
    const params = new URLSearchParams();
    if (campusId) params.append('campusId', campusId);
    if (departmentId) params.append('departmentId', departmentId);
    return this.request<any>(`/admin/command-center?${params.toString()}`);
  }

  async getDrillDown(params: { campusId?: string; departmentId?: string; programId?: string; year?: number; section?: string }) {
    const query = new URLSearchParams();
    if (params.campusId) query.append('campusId', params.campusId);
    if (params.departmentId) query.append('departmentId', params.departmentId);
    if (params.programId) query.append('programId', params.programId);
    if (params.year) query.append('year', String(params.year));
    if (params.section) query.append('section', params.section);
    return this.request<any>(`/admin/drilldown?${query.toString()}`);
  }

  async getInstitutionalInsights() {
    return this.request<any>('/admin/insights');
  }

  async getAtRiskStudents(params: { level?: string; campusId?: string; departmentId?: string; search?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params.level) query.append('level', params.level);
    if (params.campusId) query.append('campusId', params.campusId);
    if (params.departmentId) query.append('departmentId', params.departmentId);
    if (params.search) query.append('search', params.search);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    return this.request<any>(`/admin/at-risk?${query.toString()}`);
  }

  async getStudentRiskFactorDetails(studentId: string) {
    return this.request<any>(`/admin/at-risk/${studentId}`);
  }

  async getFacultyWorkloadLeaderboard(status?: string, departmentId?: string) {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    if (departmentId) query.append('departmentId', departmentId);
    return this.request<any>(`/admin/workload?${query.toString()}`);
  }

  async getStudentsDirectory(params: { search?: string; campusId?: string; departmentId?: string; programId?: string; year?: number; riskLevel?: string; page?: number; limit?: number }) {
    const query = new URLSearchParams();
    if (params.search) query.append('search', params.search);
    if (params.campusId) query.append('campusId', params.campusId);
    if (params.departmentId) query.append('departmentId', params.departmentId);
    if (params.programId) query.append('programId', params.programId);
    if (params.year) query.append('year', String(params.year));
    if (params.riskLevel) query.append('riskLevel', params.riskLevel);
    if (params.page) query.append('page', String(params.page));
    if (params.limit) query.append('limit', String(params.limit));
    return this.request<any>(`/admin/students?${query.toString()}`);
  }

  async getCampuses() {
    return this.request<any>('/admin/campuses');
  }

  async getDepartments() {
    return this.request<any>('/admin/departments');
  }

  async getAlerts() {
    return this.request<any>('/admin/alerts');
  }

  async getStudentAttendanceByAdmin(studentId: string) {
    return this.request<any>(`/admin/attendance/student/${studentId}`);
  }

  async overrideStudentAttendance(data: { studentId: string; subjectId?: string; recordId?: string; status: string; remarks?: string }) {
    return this.request<any>('/admin/attendance/override', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async globalSearch(query: string) {
    return this.request<any>(`/admin/search?q=${encodeURIComponent(query)}`);
  }
}

export const api = new ApiClient();
export default api;
