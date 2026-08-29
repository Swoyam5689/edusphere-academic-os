import React, { useState, useEffect } from 'react';
import { Briefcase, AlertTriangle, CheckCircle2, Clock, Users, BookOpen, Search } from 'lucide-react';
import api from '../../api/client.js';
import WorkloadBadge from '../../components/common/WorkloadBadge.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';

export const FacultyWorkloadManager: React.FC = () => {
  const [facultyList, setFacultyList] = useState<any[]>([]);
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedFaculty, setSelectedFaculty] = useState<any | null>(null);
  const [rebalanceSimulated, setRebalanceSimulated] = useState(false);

  useEffect(() => {
    const fetchWorkload = async () => {
      setIsLoading(true);
      try {
        const res = await api.getFacultyWorkloadLeaderboard(
          selectedStatus !== 'ALL' ? selectedStatus : undefined
        );
        if (res.success) {
          setFacultyList(res.facultyList);
        }
      } catch (err) {
        console.error('Failed to load workload:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchWorkload();
  }, [selectedStatus]);

  const handleSimulateRebalance = () => {
    setRebalanceSimulated(true);
    setTimeout(() => {
      if (selectedFaculty) {
        // Adjust local simulated scores
        setFacultyList(prev =>
          prev.map(f => {
            if (f.id === selectedFaculty.id) {
              return {
                ...f,
                workloadScore: 78.0,
                workloadStatus: 'HEAVY',
                teachingHours: Math.max(12, f.teachingHours - 4),
                recommendation: 'Section C successfully transferred. Workload reduced by 22%.',
              };
            }
            return f;
          })
        );
      }
      setRebalanceSimulated(false);
      setSelectedFaculty(null);
    }, 1500);
  };

  if (isLoading && facultyList.length === 0) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      {/* Faculty Workload Deep-Dive & Rebalancing Modal */}
      {selectedFaculty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-amber-500/15 rounded-xl text-amber-400 border border-amber-500/20">
                  <Briefcase className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                    {selectedFaculty.empId} • {selectedFaculty.department}
                  </span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedFaculty.name}</h3>
                  <p className="text-xs text-slate-400">{selectedFaculty.designation}</p>
                </div>
              </div>
              <WorkloadBadge status={selectedFaculty.workloadStatus} score={selectedFaculty.workloadScore} />
            </div>

            {/* Metric Metrics Grid */}
            <div className="grid grid-cols-3 gap-2.5 p-4 rounded-xl bg-slate-950/70 border border-white/5 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Teaching Hours</span>
                <span className="text-sm font-bold text-amber-400 font-mono mt-0.5 block">{selectedFaculty.teachingHours} hrs/wk</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Assigned Students</span>
                <span className="text-sm font-bold text-sky-400 font-mono mt-0.5 block">{selectedFaculty.totalStudents}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Workload Index</span>
                <span className="text-sm font-bold text-rose-400 font-mono mt-0.5 block">{selectedFaculty.workloadScore} / 100</span>
              </div>
            </div>

            {/* Recommendation Box */}
            <div className="p-3.5 rounded-xl bg-slate-800/60 border border-white/5 text-xs text-slate-300 space-y-1">
              <span className="font-bold text-amber-300 block">Automated Capacity Advice:</span>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                {selectedFaculty.recommendation || 'Faculty is operating within standard balanced teaching load.'}
              </p>
            </div>

            {rebalanceSimulated ? (
              <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-center text-emerald-300 font-semibold flex items-center justify-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 animate-spin" />
                Executing Automated Section Redistribution Simulation...
              </div>
            ) : null}

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedFaculty(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              {selectedFaculty.workloadStatus === 'OVERLOADED' && !rebalanceSimulated && (
                <button
                  onClick={handleSimulateRebalance}
                  className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/20"
                >
                  ⚡ Execute Rebalance Action
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Briefcase className="w-7 h-7 text-amber-400" /> Faculty Workload & Capacity Balancing
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic capacity index calculated from teaching hours, student load, course diversity & advising (Click any faculty member for deep dive)
          </p>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-2 overflow-x-auto">
        {(['ALL', 'OVERLOADED', 'HEAVY', 'BALANCED', 'LIGHT'] as const).map(st => (
          <button
            key={st}
            onClick={() => setSelectedStatus(st)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedStatus === st
                ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {st}
          </button>
        ))}
      </div>

      {/* Faculty Workload Table */}
      <div className="glass-card rounded-2xl p-6 border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-3">Emp ID</th>
                <th className="p-3">Faculty Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Teaching Hrs/Wk</th>
                <th className="p-3">Assigned Students</th>
                <th className="p-3">Workload Index</th>
                <th className="p-3">Status</th>
                <th className="p-3">Automated Rebalance Recommendation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {facultyList.map(f => (
                <tr
                  key={f.id}
                  onClick={() => setSelectedFaculty(f)}
                  className="hover:bg-slate-800/40 transition-all cursor-pointer group"
                >
                  <td className="p-3 font-mono font-bold text-sky-400">{f.empId}</td>
                  <td className="p-3 font-semibold text-white group-hover:text-sky-300 transition-colors">
                    {f.name} <span className="text-[10px] text-slate-400 font-normal block">{f.designation}</span>
                  </td>
                  <td className="p-3 text-slate-300">{f.department}</td>
                  <td className="p-3 font-mono">{f.teachingHours}h ({f.totalClasses} classes)</td>
                  <td className="p-3 font-mono text-slate-300">{f.totalStudents}</td>
                  <td className="p-3 font-mono font-bold text-white text-sm">{f.workloadScore} / 100</td>
                  <td className="p-3">
                    <WorkloadBadge status={f.workloadStatus} score={f.workloadScore} showScore={false} />
                  </td>
                  <td className="p-3 text-xs leading-relaxed max-w-xs">
                    {f.recommendation ? (
                      <span className="text-amber-300 bg-amber-500/10 p-1.5 rounded block border border-amber-500/20 group-hover:bg-amber-500/20 transition-all">
                        {f.recommendation}
                      </span>
                    ) : (
                      <span className="text-slate-500">Optimal operating load</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default FacultyWorkloadManager;
