import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  CalendarCheck,
  BookOpen,
  Calendar,
  Sparkles,
  ArrowRight,
  Clock,
  MapPin,
  User as UserIcon,
  FileText,
  AlertCircle,
  CheckCircle,
  Download,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import StatCard from '../../components/common/StatCard.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';
import api from '../../api/client.js';
import { StudentDashboardData } from '../../types/index.js';

export const StudentDashboard: React.FC = () => {
  const [data, setData] = useState<StudentDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await api.getStudentDashboard();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  const [advisorModalOpen, setAdvisorModalOpen] = useState(false);
  const [advisorMessage, setAdvisorMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any | null>(null);

  if (isLoading || !data) {
    return <LoadingSkeleton rows={5} />;
  }

  const { student, todayClasses, todayLearning, smartInsights, upcomingAssignments, upcomingExams } = data;

  const handleSendAdvisorMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!advisorMessage.trim()) return;
    setMessageSent(true);
    setTimeout(() => {
      setMessageSent(false);
      setAdvisorMessage('');
      setAdvisorModalOpen(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Contact Advisor Modal */}
      {advisorModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-500/15 rounded-xl text-sky-400 border border-sky-500/20">
                <UserIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Academic Advisory Connect</h3>
                <p className="text-xs text-slate-400">
                  {student.advisor?.name || 'Prof. S. Verma'} ({student.advisor?.email || 'advisor@demo.com'})
                </p>
              </div>
            </div>

            {messageSent ? (
              <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-center space-y-1">
                <CheckCircle className="w-7 h-7 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-300">Advisory Request Dispatched</h4>
                <p className="text-xs text-slate-400">Your advisor has been notified via student portal & email.</p>
              </div>
            ) : (
              <form onSubmit={handleSendAdvisorMessage} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Send Message / Advisory Query</label>
                  <textarea
                    rows={4}
                    value={advisorMessage}
                    onChange={e => setAdvisorMessage(e.target.value)}
                    placeholder="Hello Professor, I would like to discuss my attendance recovery plan and mid-semester coursework..."
                    className="w-full p-3 bg-slate-950 rounded-xl border border-slate-700 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                    required
                  />
                </div>

                <div className="p-3 bg-slate-800/60 rounded-xl border border-white/5 text-[11px] text-slate-300 space-y-1">
                  <div>• Office Hours: <span className="text-white font-medium">Mon-Thu 3:00 PM - 5:00 PM</span></div>
                  <div>• Location: <span className="text-white font-medium">Faculty Block B, Room 204</span></div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setAdvisorModalOpen(false)}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20"
                  >
                    Send to Advisor →
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Class Details Modal */}
      {selectedClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95 space-y-4">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-500/15 rounded-xl text-sky-400 border border-sky-500/20">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono text-[10px] font-bold">
                  {selectedClass.time}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{selectedClass.subject}</h3>
                <p className="text-xs text-slate-400">Instructor: {selectedClass.faculty}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Classroom / Lab:</span>
                <span className="font-semibold text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-sky-400" /> {selectedClass.room}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Section:</span>
                <span className="font-semibold text-white">Section {student.section}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Attendance Status:</span>
                <span className="text-emerald-400 font-semibold">Active Session Scheduled</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedClass(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setSelectedClass(null);
                  navigate('/student/timetable');
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20"
              >
                View Weekly Timetable →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Good morning, {student.name} 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            {student.rollNo} • {student.program} • Semester {student.semester} ({student.section})
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1 bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold rounded-full flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            Academic Status: {student.academicStanding}
          </span>
        </div>
      </div>

      {/* Top Core Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current CGPA"
          value={`${student.cgpa.toFixed(2)} / 10.0`}
          subtitle={`Current GPA: ${student.currentGpa.toFixed(2)} • View Grades`}
          icon={GraduationCap}
          variant="purple"
          onClick={() => navigate('/student/performance')}
        />
        <StatCard
          title="Overall Attendance"
          value={`${student.overallAttendance.toFixed(1)}%`}
          subtitle={student.overallAttendance >= 75 ? 'Above 75% • View Breakdown' : 'Attention: Below 75% • Calculate'}
          icon={CalendarCheck}
          variant={student.overallAttendance >= 75 ? 'emerald' : 'rose'}
          onClick={() => navigate('/student/attendance')}
        />
        <StatCard
          title="Credits Completed"
          value={`${student.creditsCompleted} Credits`}
          subtitle="48 / 160 Total Degree Credits"
          icon={BookOpen}
          variant="blue"
          onClick={() => navigate('/student/performance')}
        />
        <StatCard
          title="Academic Advisor"
          value={student.advisor?.name ? student.advisor.name.replace('Prof. ', '').replace('Dr. ', '') : 'Prof. Verma'}
          subtitle="Click to message advisor"
          icon={UserIcon}
          variant="cyan"
          onClick={() => setAdvisorModalOpen(true)}
        />
      </div>

      {/* TODAY'S LEARNING — MAJOR HIGHLIGHT FEATURE */}
      <div className="glass-card rounded-2xl p-6 border-sky-500/30 bg-gradient-to-br from-sky-950/40 via-slate-900/80 to-indigo-950/30 shadow-xl shadow-sky-950/20">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-sky-500/20 text-sky-400 border border-sky-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white tracking-tight flex items-center gap-2">
                Today's Learning
                <span className="text-xs px-2 py-0.5 rounded-full bg-sky-500/20 text-sky-300 font-mono">
                  {todayLearning.count} New Uploads Today
                </span>
              </h2>
              <p className="text-xs text-slate-400">Class resources published by your faculty today</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/student/resources')}
            className="text-xs font-bold text-sky-400 hover:text-sky-300 flex items-center gap-1 self-start sm:self-auto"
          >
            View All Materials <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {todayLearning.resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
            {todayLearning.resources.map(res => (
              <div
                key={res.id}
                className="p-4 rounded-xl bg-slate-800/60 hover:bg-slate-800/90 border border-white/5 transition-all flex items-start justify-between gap-3"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 text-[10px] font-bold font-mono">
                      {res.subjectCode}
                    </span>
                    <span className="text-xs text-slate-400 truncate">• {res.topic}</span>
                  </div>
                  <h4 className="text-sm font-semibold text-white truncate">{res.title}</h4>
                  <p className="text-[11px] text-slate-400 mt-1">Uploaded by {res.facultyName}</p>
                </div>
                <button
                  onClick={() => {
                    const element = document.createElement('a');
                    const file = new Blob(
                      [
                        `=====================================================\n` +
                          `EDUSPHERE ACADEMIC OS — VERIFIED COURSE MATERIAL\n` +
                          `=====================================================\n` +
                          `Course: ${res.subjectCode}\n` +
                          `Topic: ${res.topic}\n` +
                          `Title: ${res.title}\n` +
                          `Instructor: ${res.facultyName}\n` +
                          `Published: ${new Date().toLocaleDateString()}\n\n` +
                          `Notes:\nVerified lecture slides & notes.\n`
                      ],
                      { type: 'text/plain' }
                    );
                    element.href = URL.createObjectURL(file);
                    element.download = `${res.title.replace(/\s+/g, '_')}.txt`;
                    document.body.appendChild(element);
                    element.click();
                    document.body.removeChild(element);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-semibold border border-sky-500/30 flex items-center gap-1.5 shrink-0 transition-all cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download
                </button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400 py-3 text-center">No new class resources uploaded today.</p>
        )}
      </div>

      {/* Grid: Today's Classes & Smart Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* TODAY'S CLASSES */}
        <div className="lg:col-span-2 glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-sky-400" /> Today's Scheduled Classes
            </h3>
            <button
              onClick={() => navigate('/student/timetable')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Weekly Schedule →
            </button>
          </div>

          {todayClasses.length > 0 ? (
            <div className="space-y-3">
              {todayClasses.map(cls => (
                <div
                  key={cls.id}
                  onClick={() => setSelectedClass(cls)}
                  className="p-4 rounded-xl bg-slate-800/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-sky-500/40 hover:bg-slate-800/70 transition-all cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 font-mono text-xs font-bold shrink-0">
                      {cls.time}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                        {cls.subject}
                        <span className="text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          • Click for details
                        </span>
                      </h4>
                      <p className="text-xs text-slate-400">{cls.faculty}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    <span className="flex items-center gap-1 text-xs text-slate-300 px-2.5 py-1 rounded-md bg-slate-800 border border-slate-700">
                      <MapPin className="w-3 h-3 text-sky-400" /> {cls.room}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-xs text-slate-400">
              No classes scheduled for today. Check weekly timetable.
            </div>
          )}
        </div>

        {/* SMART ACADEMIC INSIGHTS */}
        <div className="glass-card rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-amber-400" /> Smart Academic Insights
            </h3>
            <div className="space-y-2.5">
              {smartInsights.map((insight, idx) => (
                <div
                  key={idx}
                  onClick={() => {
                    if (insight.includes('Attendance')) navigate('/student/attendance');
                    else if (insight.includes('GPA') || insight.includes('CGPA')) navigate('/student/performance');
                    else if (insight.includes('Exam')) navigate('/student/exams');
                    else navigate('/student/assignments');
                  }}
                  className="p-3 rounded-xl bg-slate-800/50 border border-white/5 text-xs text-slate-300 leading-relaxed flex items-start gap-2.5 hover:border-sky-500/30 hover:bg-slate-800/80 transition-all cursor-pointer group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 mt-1.5"></span>
                  <span className="group-hover:text-white transition-colors">{insight}</span>
                </div>
              ))}
            </div>
          </div>
          <button
            onClick={() => navigate('/student/attendance')}
            className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-white/5 transition-all text-center"
          >
            Open Attendance Calculator →
          </button>
        </div>
      </div>

      {/* Bottom Grid: Upcoming Assignments & Upcoming Exams */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* UPCOMING ASSIGNMENTS */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileText className="w-4 h-4 text-purple-400" /> Pending Assignments
            </h3>
            <button
              onClick={() => navigate('/student/assignments')}
              className="text-xs text-slate-400 hover:text-white"
            >
              View All
            </button>
          </div>

          {upcomingAssignments.length > 0 ? (
            <div className="space-y-2.5">
              {upcomingAssignments.map(a => (
                <div
                  key={a.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <span className="text-[10px] font-bold text-purple-400 font-mono">{a.subject}</span>
                    <h4 className="text-xs font-semibold text-white truncate">{a.title}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      Due: {new Date(a.deadline).toLocaleDateString()} • Max: {a.maxMarks} pts
                    </p>
                  </div>
                  <button
                    onClick={() => navigate('/student/assignments')}
                    className="px-3 py-1.5 rounded-lg bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 text-xs font-semibold border border-purple-500/30 transition-all"
                  >
                    Submit
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No upcoming assignments due this week.</p>
          )}
        </div>

        {/* UPCOMING EXAMS */}
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400" /> Upcoming Examinations
            </h3>
            <button
              onClick={() => navigate('/student/exams')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Exams & Seating
            </button>
          </div>

          {upcomingExams.length > 0 ? (
            <div className="space-y-2.5">
              {upcomingExams.map(e => (
                <div
                  key={e.id}
                  className="p-3 rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-rose-500/20 text-rose-300 font-mono">
                        {e.examType}
                      </span>
                      <span className="text-xs font-semibold text-white">{e.subject}</span>
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Date: {e.examDate} • Time: {e.time}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 text-xs font-mono border border-slate-700">
                    {e.room}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-6 text-center">No upcoming exams scheduled.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;
