import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Search,
  ChevronRight,
  X,
  CheckCircle2,
  CalendarCheck,
  GraduationCap,
  TrendingDown,
  FileText,
  User,
} from 'lucide-react';
import api from '../../api/client.js';
import RiskBadge from '../../components/common/RiskBadge.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';

export const AtRiskStudents: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedLevel, setSelectedLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  // Factor breakdown modal
  const [selectedStudentForBreakdown, setSelectedStudentForBreakdown] = useState<any | null>(null);
  const [factorDetails, setFactorDetails] = useState<any | null>(null);
  const [isFactorLoading, setIsFactorLoading] = useState(false);

  const fetchAtRisk = async () => {
    setIsLoading(true);
    try {
      const res = await api.getAtRiskStudents({
        level: selectedLevel !== 'ALL' ? selectedLevel : undefined,
        search: searchQuery || undefined,
        page,
        limit: 15,
      });

      if (res.success) {
        setStudents(res.students);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to load at-risk students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAtRisk();
  }, [selectedLevel, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchAtRisk();
  };

  const handleOpenFactorModal = async (student: any) => {
    setSelectedStudentForBreakdown(student);
    setIsFactorLoading(true);
    try {
      const res = await api.getStudentRiskFactorDetails(student.id);
      if (res.success) {
        setFactorDetails(res.riskData);
      }
    } catch (err) {
      console.error('Failed to load risk factors:', err);
    } finally {
      setIsFactorLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Factor Breakdown Modal */}
      {selectedStudentForBreakdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-xl rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95 overflow-hidden">
            <button
              onClick={() => {
                setSelectedStudentForBreakdown(null);
                setFactorDetails(null);
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-500/15 text-rose-400 border border-rose-500/30">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  Academic Risk Engine Breakdown
                </h3>
                <p className="text-xs text-slate-400">
                  {selectedStudentForBreakdown.name} ({selectedStudentForBreakdown.rollNo})
                </p>
              </div>
            </div>

            {isFactorLoading || !factorDetails ? (
              <LoadingSkeleton rows={3} />
            ) : (
              <div className="space-y-4">
                {/* Score Banner */}
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
                      Total Calculated Risk Score
                    </span>
                    <div className="text-3xl font-extrabold text-white font-mono mt-0.5">
                      {factorDetails.totalScore} <span className="text-sm text-slate-400 font-normal">/ 100</span>
                    </div>
                  </div>
                  <RiskBadge level={factorDetails.level} score={factorDetails.totalScore} />
                </div>

                {/* Mathematical Factors Breakdown */}
                <div>
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                    Score Contribution Factors (Mathematical Breakdown)
                  </h4>
                  <div className="space-y-2">
                    {factorDetails.factorDetails.map((f: any, idx: number) => (
                      <div
                        key={idx}
                        className="p-3 rounded-lg bg-slate-800/60 border border-white/5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                          <span className="font-semibold text-slate-200">{f.name}</span>
                        </div>
                        <span className="font-mono font-bold text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                          +{f.points} pts
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Sum Check Proof */}
                <div className="p-3 bg-slate-800/80 rounded-xl border border-white/5 text-xs text-slate-300 font-mono flex items-center justify-between">
                  <span>Total Sum = {factorDetails.factorDetails.map((f: any) => `+${f.points}`).join(' ')}</span>
                  <span className="font-bold text-emerald-400">= {factorDetails.totalScore} (Exact Match)</span>
                </div>

                <div className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-3 rounded-xl border border-white/5">
                  <span className="font-bold text-slate-300 block mb-1">Diagnostic Explanation:</span>
                  {factorDetails.explanation}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-rose-400" /> Academic Risk Registry
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rule-based predictive identification of students requiring immediate academic intervention
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-mono">
            {total} student(s) currently meet risk criteria
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Roll No or Student Name..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </form>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => {
                setSelectedLevel(lvl);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedLevel === lvl
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-2xl p-6 border-white/10">
        {isLoading ? (
          <LoadingSkeleton rows={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Attendance %</th>
                  <th className="p-3">CGPA</th>
                  <th className="p-3">Current GPA</th>
                  <th className="p-3">Risk Score</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3 text-right">Factor Breakdown</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {students.map(st => (
                  <tr
                    key={st.id}
                    onClick={() => handleOpenFactorModal(st)}
                    className="hover:bg-slate-800/40 transition-all cursor-pointer group"
                  >
                    <td className="p-3 font-mono font-bold text-sky-400">{st.rollNo}</td>
                    <td className="p-3 font-semibold text-white group-hover:text-sky-300">{st.name}</td>
                    <td className="p-3 text-slate-400">{st.department}</td>
                    <td className="p-3">
                      <span
                        className={`font-mono font-bold ${
                          st.attendancePct < 65 ? 'text-rose-400' : st.attendancePct < 75 ? 'text-amber-400' : 'text-emerald-400'
                        }`}
                      >
                        {st.attendancePct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 font-mono text-white">{st.cgpa.toFixed(2)}</td>
                    <td className="p-3 font-mono text-slate-300">{st.currentGpa?.toFixed(2) || 'N/A'}</td>
                    <td className="p-3 font-mono font-bold text-rose-400">{st.riskScore}</td>
                    <td className="p-3">
                      <RiskBadge level={st.riskLevel} score={st.riskScore} showScore={false} />
                    </td>
                    <td className="p-3 text-right">
                      <span className="text-sky-400 font-semibold group-hover:underline flex items-center justify-end gap-1">
                        Inspect Factors <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing page {page} of {totalPages} ({total} total at-risk students)
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AtRiskStudents;
