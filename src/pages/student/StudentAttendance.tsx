import React, { useState, useEffect } from 'react';
import { CalendarCheck, AlertTriangle, CheckCircle2, Info, Clock, AlertCircle, TrendingUp } from 'lucide-react';
import api from '../../api/client.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';
import { StudentAttendanceData } from '../../types/index.js';

export const StudentAttendance: React.FC = () => {
  const [data, setData] = useState<StudentAttendanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAttendance = async () => {
      try {
        const res = await api.getStudentAttendance();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load attendance:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAttendance();
  }, []);

  const [selectedSubjectForSim, setSelectedSubjectForSim] = useState<any | null>(null);
  const [extraAttended, setExtraAttended] = useState<number>(5);
  const [extraConducted, setExtraConducted] = useState<number>(5);
  const [filterSubjectCode, setFilterSubjectCode] = useState<string>('ALL');

  if (isLoading || !data) {
    return <LoadingSkeleton rows={6} />;
  }

  const { summary, history } = data;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'GOOD':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">GOOD (≥85%)</span>;
      case 'NORMAL':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-blue-500/15 text-blue-400 border border-blue-500/30">NORMAL (75-84%)</span>;
      case 'WARNING':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-amber-500/15 text-amber-400 border border-amber-500/30">WARNING (65-74%)</span>;
      case 'CRITICAL':
        return <span className="px-2.5 py-1 text-xs font-bold rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 animate-pulse">CRITICAL (&lt;65%)</span>;
      default:
        return null;
    }
  };

  // Simulated calculation
  const simConducted = (selectedSubjectForSim?.conducted || 0) + extraConducted;
  const simAttended = (selectedSubjectForSim?.attended || 0) + extraAttended;
  const simPct = simConducted > 0 ? Number(((simAttended / simConducted) * 100).toFixed(1)) : 0;

  const filteredHistory = filterSubjectCode === 'ALL'
    ? history
    : history.filter(h => h.subjectCode === filterSubjectCode);

  return (
    <div className="space-y-6">
      {/* Interactive Attendance Simulator Modal */}
      {selectedSubjectForSim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-sky-500/10 text-sky-400">
                  {selectedSubjectForSim.subjectCode} • Attendance Simulator
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedSubjectForSim.subjectName}</h3>
              </div>
            </div>

            {/* Current vs Simulated Metric */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-950/80 border border-white/5 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400 block">Current Attendance</span>
                <span className="text-2xl font-extrabold text-white mt-1 block">
                  {selectedSubjectForSim.percentage.toFixed(1)}%
                </span>
                <span className="text-[10px] text-slate-500">
                  {selectedSubjectForSim.attended} / {selectedSubjectForSim.conducted} classes
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-sky-950/30 border border-sky-500/30 text-center">
                <span className="text-[10px] uppercase font-bold text-sky-300 block">Projected Attendance</span>
                <span className={`text-2xl font-extrabold mt-1 block ${simPct >= 75 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {simPct.toFixed(1)}%
                </span>
                <span className="text-[10px] text-sky-300/80 font-mono">
                  {simAttended} / {simConducted} classes
                </span>
              </div>
            </div>

            {/* Interactive Sliders */}
            <div className="space-y-3 p-4 rounded-xl bg-slate-800/40 border border-white/5">
              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Upcoming Classes Conducted:</span>
                  <span className="font-bold text-white font-mono">{extraConducted}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={extraConducted}
                  onChange={e => {
                    const val = Number(e.target.value);
                    setExtraConducted(val);
                    if (extraAttended > val) setExtraAttended(val);
                  }}
                  className="w-full accent-sky-500 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-300 mb-1">
                  <span>Classes You Will Attend:</span>
                  <span className="font-bold text-emerald-400 font-mono">{extraAttended}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max={extraConducted}
                  value={extraAttended}
                  onChange={e => setExtraAttended(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Mathematical Recovery Advice */}
            <div className="p-3.5 rounded-xl bg-slate-900 border border-white/5 text-xs text-slate-300 space-y-1.5 leading-relaxed">
              <div className="font-bold text-white flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-sky-400" /> Milestone Target Targets:
              </div>
              <div className="text-[11px] text-slate-300">
                • Target 75% Safe Line: Requires <strong className="text-white">{selectedSubjectForSim.requiredClasses}</strong> consecutive present sessions.
              </div>
              <div className="text-[11px] text-slate-300">
                • Safe Buffer Limit: {selectedSubjectForSim.percentage >= 75 ? `You can miss up to ${selectedSubjectForSim.missableClasses} classes.` : 'No buffer remaining.'}
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSubjectForSim(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close Simulator
              </button>
              <button
                onClick={() => {
                  setFilterSubjectCode(selectedSubjectForSim.subjectCode);
                  setSelectedSubjectForSim(null);
                }}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20"
              >
                Filter History Logs →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Attendance Analytics</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Real-time biometric & faculty-verified lecture attendance metrics (Click any course card to open live simulator)
          </p>
        </div>
        <div className="flex items-center gap-3">
          {getStatusBadge(summary.status)}
        </div>
      </div>

      {/* Top Banner KPI Card */}
      <div className="glass-card rounded-2xl p-6 bg-gradient-to-r from-slate-900 via-slate-900/90 to-slate-800 border-white/10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Institutional Overall</span>
            <div className="text-4xl font-extrabold text-white mt-1 flex items-baseline gap-2">
              {summary.overallPercentage.toFixed(1)}%
            </div>
            <p className="text-xs text-slate-400 mt-1">Minimum 75% required for exam eligibility</p>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium">Classes Attended</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5">
              {summary.overallAttended} <span className="text-xs text-slate-400 font-normal">/ {summary.overallConducted}</span>
            </div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium">Classes Missed</span>
            <div className="text-xl font-bold text-rose-400 mt-0.5">{summary.overallMissed}</div>
          </div>

          <div className="p-3 bg-slate-800/60 rounded-xl border border-white/5">
            <span className="text-[11px] text-slate-400 font-medium">Safe Margin Buffer</span>
            <div className="text-xl font-bold text-sky-400 mt-0.5">
              {summary.overallPercentage >= 75 ? 'ELIGIBLE' : 'DEBARRED RISK'}
            </div>
          </div>
        </div>
      </div>

      {/* Subject Wise Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-bold text-white">Enrolled Course Breakdown</h2>
          <span className="text-xs text-sky-400 font-semibold font-mono">Click card to simulate recovery →</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {summary.subjectMetrics.map(sub => {
            const isBelow75 = sub.percentage < 75.0;
            return (
              <div
                key={sub.subjectId}
                onClick={() => {
                  setSelectedSubjectForSim(sub);
                  setExtraConducted(5);
                  setExtraAttended(5);
                }}
                className={`glass-card rounded-2xl p-5 border transition-all cursor-pointer hover:scale-[1.01] hover:border-sky-500/40 active:scale-[0.99] group ${
                  isBelow75 ? 'border-rose-500/40 bg-rose-950/10 hover:bg-rose-950/20' : 'border-white/10 hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-xs font-mono font-bold bg-sky-500/10 text-sky-400 rounded">
                        {sub.subjectCode}
                      </span>
                      <span className="text-xs text-slate-400">{sub.credits} Credits</span>
                      <span className="text-[10px] text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        • Simulate →
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mt-1 group-hover:text-sky-300 transition-colors">
                      {sub.subjectName}
                    </h3>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-extrabold text-white">{sub.percentage.toFixed(1)}%</span>
                    <div className="mt-1">{getStatusBadge(sub.status)}</div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-800 rounded-full h-2.5 overflow-hidden my-3">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      sub.percentage >= 85
                        ? 'bg-emerald-500'
                        : sub.percentage >= 75
                        ? 'bg-blue-500'
                        : sub.percentage >= 65
                        ? 'bg-amber-500'
                        : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.min(100, sub.percentage)}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs py-2 border-t border-slate-800">
                  <div className="text-slate-400">
                    Conducted: <span className="text-white font-semibold">{sub.conducted}</span>
                  </div>
                  <div className="text-slate-400">
                    Attended: <span className="text-emerald-400 font-semibold">{sub.attended}</span>
                  </div>
                </div>

                {/* Exact Calculation Engines Display */}
                <div className="mt-3 p-3 rounded-xl bg-slate-800/80 border border-white/5 text-xs space-y-1">
                  {sub.percentage >= 75 ? (
                    <div className="flex items-center gap-2 text-emerald-300">
                      <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
                      <span>
                        You can miss <strong>{sub.missableClasses}</strong> more classes while staying ≥ 75%.
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-rose-300 font-medium">
                      <AlertTriangle className="w-4 h-4 shrink-0 text-rose-400" />
                      <span>
                        Attend next <strong>{sub.requiredClasses}</strong> consecutive classes to reach 75%.
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Attendance History Table */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-4 h-4 text-sky-400" /> Session Attendance Log
          </h3>
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs text-slate-400 mr-1">Filter:</span>
            {['ALL', ...summary.subjectMetrics.map(s => s.subjectCode)].map(code => (
              <button
                key={code}
                onClick={() => setFilterSubjectCode(code)}
                className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold transition-all ${
                  filterSubjectCode === code
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {code}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/60 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-3">Date</th>
                <th className="p-3">Subject</th>
                <th className="p-3">Topic Covered</th>
                <th className="p-3">Faculty</th>
                <th className="p-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {filteredHistory.slice(0, 15).map(h => (
                <tr key={h.id} className="hover:bg-slate-800/30 transition-all">
                  <td className="p-3 font-mono text-slate-400">{h.date}</td>
                  <td className="p-3 font-semibold text-white">
                    {h.subjectCode} <span className="text-slate-400 font-normal">({h.subjectName})</span>
                  </td>
                  <td className="p-3 text-slate-300">{h.topic}</td>
                  <td className="p-3 text-slate-400">{h.faculty}</td>
                  <td className="p-3 text-right">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.status === 'PRESENT'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : h.status === 'LATE'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {h.status}
                    </span>
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

export default StudentAttendance;
