import React, { useState, useEffect } from 'react';
import { Briefcase, Clock, Users, BookOpen, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import api from '../../api/client.js';
import WorkloadBadge from '../../components/common/WorkloadBadge.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';

export const FacultyWorkload: React.FC = () => {
  const [workload, setWorkload] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchWorkload = async () => {
      try {
        const res = await api.getFacultyWorkload();
        if (res.success) {
          setWorkload(res.workload);
        }
      } catch (err) {
        console.error('Failed to load workload:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkload();
  }, []);

  if (isLoading || !workload) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Faculty Workload Engine</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mathematical workload score, teaching load distribution & peer balancing advice
          </p>
        </div>
        <div>
          <WorkloadBadge status={workload.status} score={workload.calculatedScore} />
        </div>
      </div>

      {/* Main Score Banner */}
      <div className="glass-card rounded-2xl p-6 border-rose-500/30 bg-gradient-to-r from-slate-900 via-rose-950/20 to-slate-900">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-rose-400">Total Workload Index</span>
            <div className="text-5xl font-extrabold text-white mt-1 font-mono">
              {workload.calculatedScore} <span className="text-xl text-slate-400 font-normal">/ 100</span>
            </div>
            <div className="mt-2">
              <WorkloadBadge status={workload.status} score={workload.calculatedScore} />
            </div>
          </div>

          <div className="max-w-md p-4 rounded-xl bg-slate-800/80 border border-white/5">
            <h4 className="text-xs font-bold text-amber-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" /> Automated Capacity Rebalancing
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed">
              {workload.recommendation || 'Workload distribution is within optimal operating capacity.'}
            </p>
          </div>
        </div>
      </div>

      {/* Factor Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border-white/10">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Weekly Teaching Load</span>
          <div className="text-3xl font-extrabold text-white mt-1 font-mono">{workload.teachingHours} Hours</div>
          <p className="text-xs text-slate-400 mt-1">{workload.totalClasses} lectures per week</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border-white/10">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Student Volume</span>
          <div className="text-3xl font-extrabold text-sky-400 mt-1 font-mono">{workload.totalStudents} Students</div>
          <p className="text-xs text-slate-400 mt-1">Across Section A, B & C</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border-white/10">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Subject Diversity & Grading</span>
          <div className="text-3xl font-extrabold text-purple-400 mt-1 font-mono">{workload.totalSubjects} Courses</div>
          <p className="text-xs text-slate-400 mt-1">{workload.assignmentLoad} pending grading submissions</p>
        </div>
      </div>

      {/* Threshold Scale Reference */}
      <div className="glass-card rounded-2xl p-6 border-white/10 text-xs">
        <h3 className="text-sm font-bold text-white mb-3">Institutional Workload Classification Bands</h3>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="p-3 rounded-xl bg-sky-500/10 border border-sky-500/20">
            <span className="font-bold text-sky-400">LIGHT (0 – 50)</span>
            <p className="text-slate-400 mt-1">Capacity for research, doctoral advising, and new elective courses.</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
            <span className="font-bold text-emerald-400">BALANCED (51 – 75)</span>
            <p className="text-slate-400 mt-1">Target institutional standard. Healthy balance between teaching and research.</p>
          </div>
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20">
            <span className="font-bold text-amber-400">HEAVY (76 – 90)</span>
            <p className="text-slate-400 mt-1">High load. Additional teaching assistant allocation recommended.</p>
          </div>
          <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30">
            <span className="font-bold text-rose-300">OVERLOADED (91 – 100)</span>
            <p className="text-slate-300 mt-1">Trigger condition. Automated rebalancing suggests redistributing sections.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FacultyWorkload;
