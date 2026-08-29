import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Activity, CheckCircle, XCircle, Clock, AlertCircle, Save, CheckCircle2, BookOpen, Plus } from 'lucide-react';
import api from '../../api/client.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';
import EmptyState from '../../components/common/EmptyState.js';

export const FacultyAttendance: React.FC = () => {
  const [searchParams] = useSearchParams();
  const sessionIdParam = searchParams.get('sessionId');

  const [sessions, setSessions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>(sessionIdParam || '');
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [sessionData, setSessionData] = useState<any | null>(null);
  const [roster, setRoster] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);

  const fetchInitialData = async () => {
    try {
      const [sessRes, subjRes] = await Promise.all([
        api.getFacultyTodaySessions(),
        api.getFacultySubjects(),
      ]);

      if (subjRes.success && subjRes.subjects.length > 0) {
        setSubjects(subjRes.subjects);
        setSelectedSubjectId(subjRes.subjects[0].id);
      }

      if (sessRes.success && sessRes.sessions.length > 0) {
        setSessions(sessRes.sessions);
        if (!selectedSessionId) {
          setSelectedSessionId(sessRes.sessions[0].id);
        }
      }
    } catch (err) {
      console.error('Failed to load attendance initial data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInitialData();
  }, []);

  const loadRosterForSession = async (sessionId: string) => {
    setIsLoading(true);
    try {
      const res = await api.getSessionAttendanceMatrix(sessionId);
      if (res.success) {
        setSessionData(res.session);
        setRoster(res.roster);
      }
    } catch (err) {
      console.error('Failed to load roster:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedSessionId) {
      loadRosterForSession(selectedSessionId);
    }
  }, [selectedSessionId]);

  const handleCreateNewSession = async () => {
    if (!selectedSubjectId) return;
    setIsCreatingSession(true);
    try {
      const activeSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0];
      const res = await api.createClassSession({
        subjectId: activeSubject.id,
        topic: 'Class Lecture & Problem Solving',
        section: 'A',
        roomNo: 'B204',
      });

      if (res.success && res.session) {
        setSessions(prev => [res.session, ...prev]);
        setSelectedSessionId(res.session.id);
        await loadRosterForSession(res.session.id);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to initialize session');
    } finally {
      setIsCreatingSession(false);
    }
  };

  const handleStatusChange = (studentId: string, newStatus: string) => {
    setRoster(prev =>
      prev.map(item => (item.studentId === studentId ? { ...item, status: newStatus } : item))
    );
  };

  const markAll = (status: string) => {
    setRoster(prev => prev.map(item => ({ ...item, status })));
  };

  const handleSave = async () => {
    if (!selectedSessionId) return;
    setIsSaving(true);
    try {
      const records = roster.map(r => ({
        studentId: r.studentId,
        status: r.status,
      }));
      await api.saveSessionAttendance(selectedSessionId, records);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2500);
      await loadRosterForSession(selectedSessionId);
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading && !sessionData && sessions.length > 0) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-emerald-400" /> Class Session Attendance
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Conduct live roll-call and mark real-time biometric attendance records
          </p>
        </div>

        {sessions.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold">Active Session:</span>
            <select
              value={selectedSessionId}
              onChange={e => setSelectedSessionId(e.target.value)}
              className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
            >
              {sessions.map(s => (
                <option key={s.id} value={s.id}>
                  {s.subject?.code || 'CS501'} — {s.topic || 'Lecture'} ({s.startTime}–{s.endTime})
                </option>
              ))}
            </select>
          </div>
        ) : (
          subjects.length > 0 && (
            <div className="flex items-center gap-2">
              <select
                value={selectedSubjectId}
                onChange={e => setSelectedSubjectId(e.target.value)}
                className="px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs font-semibold text-white focus:outline-none focus:border-sky-500"
              >
                {subjects.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.code} — {s.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleCreateNewSession}
                disabled={isCreatingSession}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" /> Start Roll Call
              </button>
            </div>
          )
        )}
      </div>

      {/* Session Details & Bulk Actions */}
      {sessionData ? (
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono text-xs font-bold">
                  {sessionData.subjectCode}
                </span>
                <span className="text-sm font-bold text-white">{sessionData.subjectName}</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Topic: <span className="text-slate-200 font-medium">{sessionData.topic}</span> • Section {sessionData.section} • Room {sessionData.room}
              </p>
            </div>

            {/* Quick Bulk Actions */}
            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => markAll('PRESENT')}
                className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 text-xs font-semibold border border-emerald-500/30"
              >
                All Present
              </button>
              <button
                onClick={() => markAll('ABSENT')}
                className="px-3 py-1.5 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-300 text-xs font-semibold border border-rose-500/30"
              >
                All Absent
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="px-4 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 flex items-center gap-1.5"
              >
                {saveSuccess ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-300" /> Saved!
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Attendance
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Student Roster Attendance Matrix */}
          <div className="glass-card rounded-2xl p-6 border-white/10">
            <h3 className="text-base font-bold text-white mb-4">
              Enrolled Student Roster ({roster.length} Students)
            </h3>

            {roster.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-800/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                    <tr>
                      <th className="p-3">Roll No</th>
                      <th className="p-3">Student Name</th>
                      <th className="p-3">Section</th>
                      <th className="p-3">Current Attendance %</th>
                      <th className="p-3 text-right">Attendance Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800 text-slate-300">
                    {roster.map(st => {
                      const isBelow75 = st.currentAttendancePct < 75.0;
                      return (
                        <tr key={st.studentId} className="hover:bg-slate-800/30 transition-all">
                          <td className="p-3 font-mono font-bold text-sky-400">{st.rollNo}</td>
                          <td className="p-3 font-semibold text-white">{st.name}</td>
                          <td className="p-3 font-mono">{st.section}</td>
                          <td className="p-3">
                            <span className={`font-mono font-bold ${isBelow75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                              {st.currentAttendancePct.toFixed(1)}%
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="inline-flex items-center gap-1 p-1 bg-slate-800 rounded-lg border border-slate-700">
                              {(['PRESENT', 'ABSENT', 'LATE'] as const).map(statusOpt => (
                                <button
                                  key={statusOpt}
                                  type="button"
                                  onClick={() => handleStatusChange(st.studentId, statusOpt)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all ${
                                    st.status === statusOpt
                                      ? statusOpt === 'PRESENT'
                                        ? 'bg-emerald-500 text-white shadow'
                                        : statusOpt === 'ABSENT'
                                        ? 'bg-rose-500 text-white shadow'
                                        : 'bg-amber-500 text-white shadow'
                                      : 'text-slate-400 hover:text-white'
                                  }`}
                                >
                                  {statusOpt}
                                </button>
                              ))}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No enrolled students found for this course.</p>
            )}
          </div>
        </div>
      ) : (
        <EmptyState
          title="No Active Attendance Session"
          description="Select a course above and click 'Start Roll Call' to conduct an attendance session."
        />
      )}
    </div>
  );
};

export default FacultyAttendance;
