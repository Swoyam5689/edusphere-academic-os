import React, { useState, useEffect } from 'react';
import {
  Users,
  Building,
  GraduationCap,
  CalendarCheck,
  Briefcase,
  AlertTriangle,
  Award,
  TrendingUp,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';
import StatCard from '../../components/common/StatCard.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';
import { CommandCenterData } from '../../types/index.js';

export const AdminCommandCenter: React.FC = () => {
  const [data, setData] = useState<CommandCenterData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCampus, setSelectedCampus] = useState('ALL');
  const [selectedAlert, setSelectedAlert] = useState<any | null>(null);
  const [resolvedAlertIds, setResolvedAlertIds] = useState<Set<string>>(new Set());
  const navigate = useNavigate();

  const handleResolveAlert = (alertId: string) => {
    setResolvedAlertIds(prev => new Set([...prev, alertId]));
    setSelectedAlert(null);
  };

  useEffect(() => {
    const fetchCommandCenter = async () => {
      try {
        const res = await api.getCommandCenter(selectedCampus !== 'ALL' ? selectedCampus : undefined);
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load command center:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCommandCenter();
  }, [selectedCampus]);

  if (isLoading || !data) return <LoadingSkeleton rows={6} />;

  const { kpis, charts, alerts } = data;

  return (
    <div className="space-y-6">
      {/* Alert Action Modal */}
      {selectedAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95 space-y-4">
            <div className="flex items-start gap-3">
              <div
                className={`p-3 rounded-xl border shrink-0 ${
                  selectedAlert.category === 'CRITICAL'
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30'
                    : selectedAlert.category === 'WARNING'
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                }`}
              >
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {selectedAlert.category} Alert
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedAlert.title}</h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">{selectedAlert.description}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5 space-y-2 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Target Role:</span>
                <span className="font-semibold text-white">{selectedAlert.targetRole || 'All Campus Stakeholders'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Timestamp:</span>
                <span className="font-mono text-slate-300">Today, Real-Time</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">System Action:</span>
                <span className="text-emerald-400 font-semibold">Automated Advisory Active</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedAlert(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Dismiss
              </button>
              <button
                onClick={() => {
                  if (selectedAlert.title.includes('Attendance')) {
                    navigate('/admin/at-risk');
                  } else if (selectedAlert.title.includes('Workload')) {
                    navigate('/admin/workload');
                  } else {
                    navigate('/admin/insights');
                  }
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20"
              >
                Inspect Affected Registry →
              </button>
              <button
                onClick={() => handleResolveAlert(selectedAlert.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20"
              >
                Mark Resolved ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Executive Title Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-sky-400" /> University Command Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Single Source of Truth: Click any KPI metric card or live alert for instant deep-dive analytics
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/admin/analytics/drilldown')}
            className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20 flex items-center gap-1.5 transition-all"
          >
            Hierarchical Drill-Down →
          </button>
        </div>
      </div>

      {/* Top Core KPIs (Single Source of Truth) */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Student Population"
          value={kpis.totalStudents.toLocaleString()}
          subtitle="Click to view full directory"
          icon={Users}
          variant="blue"
          onClick={() => navigate('/admin/students')}
        />
        <StatCard
          title="Average Attendance"
          value={`${kpis.avgAttendance.toFixed(1)}%`}
          subtitle="Target: 80% • View Analytics"
          icon={CalendarCheck}
          variant={kpis.avgAttendance >= 75 ? 'emerald' : 'amber'}
          onClick={() => navigate('/admin/attendance')}
        />
        <StatCard
          title="Average CGPA"
          value={`${kpis.avgCgpa.toFixed(2)} / 10.0`}
          subtitle="Click for reports & transcripts"
          icon={GraduationCap}
          variant="purple"
          onClick={() => navigate('/admin/reports')}
        />
        <StatCard
          title="At-Risk Student Cohort"
          value={`${kpis.atRiskCount} Students`}
          subtitle={`${kpis.atRiskPercentage}% • View Risk Registry`}
          icon={AlertTriangle}
          variant={kpis.atRiskCount > 0 ? 'rose' : 'emerald'}
          onClick={() => navigate('/admin/at-risk')}
        />
      </div>

      {/* Secondary KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Faculty Body"
          value={kpis.totalFaculty}
          subtitle="Click for Faculty Matrix"
          icon={Briefcase}
          variant="cyan"
          onClick={() => navigate('/admin/workload')}
        />
        <StatCard
          title="Avg Faculty Workload"
          value={`${kpis.avgFacultyWorkload.toFixed(1)} / 100`}
          subtitle={`${kpis.overloadedFacultyCount} overloaded • Review`}
          icon={Briefcase}
          variant={kpis.overloadedFacultyCount > 0 ? 'amber' : 'emerald'}
          onClick={() => navigate('/admin/workload')}
        />
        <StatCard
          title="Placement Conversion"
          value={`${kpis.placementRate.toFixed(1)}%`}
          subtitle="Click for Corporate Analytics"
          icon={Award}
          variant="emerald"
          onClick={() => navigate('/admin/analytics/drilldown')}
        />
        <StatCard
          title="Class Resource Coverage"
          value={`${kpis.resourceCoveragePct.toFixed(0)}%`}
          subtitle="Same-day teaching notes"
          icon={Sparkles}
          variant="blue"
          onClick={() => navigate('/student/resources')}
        />
      </div>

      {/* Department Performance Matrix Chart */}
      <div className="glass-card rounded-2xl p-6 border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-sky-400" /> Department Performance & Workload Comparison
            </h3>
            <p className="text-xs text-slate-400">Attendance % vs Average CGPA across university departments</p>
          </div>
          <button
            onClick={() => navigate('/admin/departments')}
            className="text-xs text-sky-400 hover:text-sky-300 font-semibold"
          >
            Manage Departments →
          </button>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={charts.departments} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="name" stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Legend wrapperStyle={{ fontSize: '12px' }} />
              <Bar dataKey="avgAttendance" name="Avg Attendance %" fill="#0ea5e9" radius={[4, 4, 0, 0]} isAnimationActive={false} />
              <Bar dataKey="avgWorkload" name="Avg Workload Index" fill="#f59e0b" radius={[4, 4, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Grid: Campus Comparison & Active Institutional Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campus Benchmarking */}
        <div className="glass-card rounded-2xl p-6 border-white/10">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Building className="w-4 h-4 text-purple-400" /> Campus Benchmarks
            </h3>
            <button
              onClick={() => navigate('/admin/analytics/drilldown')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Drill-Down →
            </button>
          </div>

          <div className="space-y-3">
            {charts.campuses.map(c => (
              <div
                key={c.id}
                onClick={() => navigate('/admin/analytics/drilldown')}
                className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-between hover:border-sky-500/30 hover:bg-slate-800/70 transition-all cursor-pointer group"
              >
                <div>
                  <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors flex items-center gap-1.5">
                    {c.name} <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </h4>
                  <p className="text-xs text-slate-400">
                    {c.studentsCount} Students • {c.facultyCount} Faculty
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-sm font-bold text-sky-400 font-mono">{c.avgAttendance}% Att.</span>
                  <div className="text-[11px] text-slate-400">CGPA: {c.avgCgpa}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Institutional Alerts */}
        <div className="glass-card rounded-2xl p-6 border-white/10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" /> Live Institutional Alert Feed
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Click alert to take action</span>
            </div>

            <div className="space-y-2.5">
              {alerts
                .filter(a => !resolvedAlertIds.has(a.id))
                .map(a => (
                  <div
                    key={a.id}
                    onClick={() => setSelectedAlert(a)}
                    className={`p-3.5 rounded-xl border text-xs cursor-pointer hover:scale-[1.01] active:scale-[0.99] transition-all group ${
                      a.category === 'CRITICAL'
                        ? 'bg-rose-500/10 border-rose-500/30 text-rose-200 hover:bg-rose-500/20'
                        : a.category === 'WARNING'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-200 hover:bg-amber-500/20'
                        : a.category === 'POSITIVE'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200 hover:bg-emerald-500/20'
                        : 'bg-blue-500/10 border-blue-500/30 text-blue-200 hover:bg-blue-500/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold flex items-center gap-1.5">
                        {a.title}
                        <span className="text-[10px] text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                          • Click to manage →
                        </span>
                      </span>
                      <span className="text-[10px] font-mono opacity-75">{a.category}</span>
                    </div>
                    <p className="text-[11px] opacity-90 leading-relaxed">{a.description}</p>
                  </div>
                ))}
              {alerts.filter(a => !resolvedAlertIds.has(a.id)).length === 0 && (
                <div className="p-6 text-center text-xs text-slate-400 bg-slate-800/40 rounded-xl border border-white/5">
                  All alerts have been reviewed and resolved.
                </div>
              )}
            </div>
          </div>

          <button
            onClick={() => navigate('/admin/insights')}
            className="w-full mt-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-white/5 transition-all text-center"
          >
            Review Institutional Insights →
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminCommandCenter;
