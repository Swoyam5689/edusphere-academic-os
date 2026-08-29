import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  UploadCloud,
  CheckCircle2,
  AlertTriangle,
  FileCheck,
  Star,
  Activity,
  Plus,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import StatCard from '../../components/common/StatCard.js';
import WorkloadBadge from '../../components/common/WorkloadBadge.js';
import ResourceUploadModal from '../../components/common/ResourceUploadModal.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';
import { FacultyDashboardData } from '../../types/index.js';

export const FacultyDashboard: React.FC = () => {
  const [data, setData] = useState<FacultyDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedSessionForUpload, setSelectedSessionForUpload] = useState<any | null>(null);
  const navigate = useNavigate();

  const fetchDashboard = async () => {
    try {
      const res = await api.getFacultyDashboard();
      if (res.success) {
        setData(res);
      }
    } catch (err) {
      console.error('Failed to load faculty dashboard:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleOpenUpload = (session: any) => {
    setSelectedSessionForUpload(session);
    setUploadModalOpen(true);
  };

  const [reviewsModalOpen, setReviewsModalOpen] = useState(false);

  if (isLoading || !data) return <LoadingSkeleton rows={5} />;

  const { faculty, metrics, todaySchedule, todaySessions } = data;

  return (
    <div className="space-y-6">
      {/* Student Reviews & Feedback Modal */}
      {reviewsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/15 rounded-xl text-amber-400 border border-amber-500/20">
                  <Star className="w-6 h-6 fill-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Student Feedback & Teaching Rating</h3>
                  <p className="text-xs text-slate-400">
                    {faculty.name} • {faculty.avgRating.toFixed(2)} / 5.0 Rating ({faculty.reviewCount} Verified Responses)
                  </p>
                </div>
              </div>
            </div>

            {/* Score Metric Card */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5 grid grid-cols-3 gap-3 text-center">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Clarity</span>
                <span className="text-base font-bold text-emerald-400">4.8 / 5.0</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Responsiveness</span>
                <span className="text-base font-bold text-sky-400">4.7 / 5.0</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Course Notes</span>
                <span className="text-base font-bold text-purple-400">4.9 / 5.0</span>
              </div>
            </div>

            {/* Qualitative Feedback Comments */}
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">"Excellent DBMS normalization explanations"</span>
                  <span className="text-[10px] text-amber-400 font-mono">★★★★★ 5.0</span>
                </div>
                <p className="text-slate-400 text-[11px]">The lecture slides and step-by-step 3NF derivations uploaded today were super clear!</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-800/50 border border-white/5 text-xs text-slate-300 space-y-1">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-white">"Very helpful in lab problem solving"</span>
                  <span className="text-[10px] text-amber-400 font-mono">★★★★★ 4.8</span>
                </div>
                <p className="text-slate-400 text-[11px]">Always clarifies SQL subquery doubts during lab sessions.</p>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setReviewsModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => {
                  setReviewsModalOpen(false);
                  navigate('/faculty/workload');
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20"
              >
                View Full Workload & Metrics →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {selectedSessionForUpload && (
        <ResourceUploadModal
          isOpen={uploadModalOpen}
          onClose={() => {
            setUploadModalOpen(false);
            setSelectedSessionForUpload(null);
          }}
          onSuccess={() => {
            fetchDashboard();
          }}
          subjectId={selectedSessionForUpload.subjectId}
          subjectCode={selectedSessionForUpload.subjectCode}
          defaultTopic={selectedSessionForUpload.topic || 'Normalization & Functional Dependencies'}
          classSessionId={selectedSessionForUpload.id && !selectedSessionForUpload.id.startsWith('session-') ? selectedSessionForUpload.id : undefined}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Welcome back, {faculty.name} 🎓
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
            {faculty.empId} • {faculty.designation} • {faculty.department}
          </p>
        </div>

        {/* Workload Status Pill */}
        <div className="flex items-center gap-2">
          <WorkloadBadge status={metrics.workloadStatus} score={metrics.workloadScore} />
        </div>
      </div>

      {/* Workload Alert Banner if Overloaded */}
      {metrics.workloadStatus === 'OVERLOADED' && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-bold text-rose-200">Workload Capacity Exceeded (Score: {metrics.workloadScore}/100)</h4>
              <p className="text-xs text-rose-300/80 mt-0.5">{metrics.workloadRecommendation}</p>
            </div>
          </div>
          <button
            onClick={() => navigate('/faculty/workload')}
            className="px-3 py-1.5 bg-rose-600/20 hover:bg-rose-600/30 text-rose-200 text-xs font-semibold rounded-lg border border-rose-500/30 shrink-0"
          >
            Review Load →
          </button>
        </div>
      )}

      {/* Faculty KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Assigned Students"
          value={metrics.studentsAssigned}
          subtitle="Click to take class attendance"
          icon={Users}
          variant="blue"
          onClick={() => navigate('/faculty/attendance')}
        />
        <StatCard
          title="Courses Taught"
          value={metrics.subjectsTaught}
          subtitle="CS501 (DBMS), CS503 (AI)"
          icon={BookOpen}
          variant="purple"
          onClick={() => navigate('/faculty/resources')}
        />
        <StatCard
          title="Teaching Hours"
          value={`${metrics.classesPerWeek} hrs/wk`}
          subtitle="18 weekly slots • View Workload"
          icon={Clock}
          variant="amber"
          onClick={() => navigate('/faculty/workload')}
        />
        <StatCard
          title="Student Rating"
          value={`${faculty.avgRating.toFixed(2)} ★`}
          subtitle={`From ${faculty.reviewCount} verified reviews • View`}
          icon={Star}
          variant="emerald"
          onClick={() => setReviewsModalOpen(true)}
        />
      </div>

      {/* TODAY'S CLASSES & RESOURCE UPLOAD FLOW */}
      <div className="glass-card rounded-2xl p-6 border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Clock className="w-5 h-5 text-sky-400" /> Today's Teaching Sessions
            </h2>
            <p className="text-xs text-slate-400">
              Select class session to mark attendance or upload same-day lecture notes/slides
            </p>
          </div>
        </div>

        {todaySessions.length > 0 ? (
          <div className="space-y-3">
            {todaySessions.map(sess => (
              <div
                key={sess.id}
                className="p-4 rounded-xl bg-slate-800/40 border border-white/5 hover:border-sky-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-3">
                  <div className="px-2.5 py-1.5 rounded-lg bg-sky-500/10 text-sky-400 font-mono text-xs font-bold shrink-0">
                    {sess.time}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-sm">{sess.subjectCode}</span>
                      <span className="text-xs text-slate-400">• Section {sess.section} • Room {sess.room}</span>
                    </div>
                    <p className="text-xs font-semibold text-sky-300 mt-0.5">Topic: {sess.topic}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-auto">
                  <button
                    onClick={() => navigate(`/faculty/attendance?sessionId=${sess.id}`)}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-all"
                  >
                    <Activity className="w-3.5 h-3.5 text-emerald-400" /> Mark Attendance
                  </button>

                  <button
                    onClick={() => handleOpenUpload(sess)}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-lg shadow-sky-600/20 flex items-center gap-1.5 transition-all"
                  >
                    <UploadCloud className="w-4 h-4" /> Upload Material
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-xs text-slate-400 mb-3">No scheduled teaching sessions today.</p>
            <button
              onClick={() => {
                handleOpenUpload({
                  id: 'session-quick',
                  subjectId: 'CS501',
                  subjectCode: 'CS501 (DBMS)',
                  topic: 'Normalization & Functional Dependencies',
                });
              }}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-sky-600/20"
            >
              + Upload Material for Today's Class
            </button>
          </div>
        )}
      </div>

      {/* Quick Action Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-purple-400" /> Pending Assignment Evaluations
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            You have {metrics.pendingGrading} student submissions in queue for grading.
          </p>
          <button
            onClick={() => navigate('/faculty/assignments')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-white/5 transition-all text-center"
          >
            Open Evaluation Portal →
          </button>
        </div>

        <div className="glass-card rounded-2xl p-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-400" /> Institutional Command Center
            </h3>
          </div>
          <p className="text-xs text-slate-400 mb-4">
            Inspect university-wide student retention, at-risk cohorts, and campus comparison.
          </p>
          <button
            onClick={() => navigate('/admin/command-center')}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-white/5 transition-all text-center"
          >
            Open Command Center →
          </button>
        </div>
      </div>
    </div>
  );
};

export default FacultyDashboard;
