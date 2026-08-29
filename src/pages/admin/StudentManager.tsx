import React, { useState, useEffect } from 'react';
import { Users, Search, Filter, Download } from 'lucide-react';
import api from '../../api/client.js';
import RiskBadge from '../../components/common/RiskBadge.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';

export const StudentManager: React.FC = () => {
  const [students, setStudents] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRisk, setSelectedRisk] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState<any | null>(null);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const res = await api.getStudentsDirectory({
        search: searchQuery || undefined,
        riskLevel: selectedRisk !== 'ALL' ? selectedRisk : undefined,
        page,
        limit: 20,
      });

      if (res.success) {
        setStudents(res.students);
        setTotal(res.total);
        setTotalPages(res.totalPages);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [selectedRisk, page]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchStudents();
  };

  const handleDownloadTranscript = (st: any) => {
    const element = document.createElement('a');
    const content =
      `========================================================================\n` +
      `       EDUSPHERE UNIVERSITY — PROVISIONAL ACADEMIC TRANSCRIPT           \n` +
      `========================================================================\n` +
      `Student Name: ${st.name}\n` +
      `Roll Number: ${st.rollNo}\n` +
      `Email: ${st.email}\n` +
      `Department: ${st.department}\n` +
      `Campus: ${st.campus}\n` +
      `Current Year / Section: Year ${st.year} (${st.section})\n` +
      `Cumulative CGPA: ${st.cgpa.toFixed(2)} / 10.0\n` +
      `Overall Attendance: ${st.attendancePct.toFixed(1)}%\n` +
      `Academic Risk Status: ${st.riskLevel} (${st.riskScore}/100 Risk Score)\n` +
      `Assigned Academic Advisor: ${st.advisor}\n` +
      `Generated Date: ${new Date().toLocaleDateString()}\n` +
      `========================================================================\n` +
      `Controller of Academic Records — EduSphere Academic OS\n`;

    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `Transcript_${st.rollNo}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Student Profile Modal */}
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400">
                  {selectedStudent.rollNo} • Year {selectedStudent.year} ({selectedStudent.section})
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedStudent.name}</h3>
                <p className="text-xs text-slate-400">{selectedStudent.email} • {selectedStudent.department}</p>
              </div>
              <RiskBadge level={selectedStudent.riskLevel} score={selectedStudent.riskScore} />
            </div>

            <div className="grid grid-cols-3 gap-2.5 p-4 rounded-xl bg-slate-950/70 border border-white/5 text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Attendance</span>
                <span
                  className={`text-sm font-bold font-mono mt-0.5 block ${
                    selectedStudent.attendancePct < 65 ? 'text-rose-400' : selectedStudent.attendancePct < 75 ? 'text-amber-400' : 'text-emerald-400'
                  }`}
                >
                  {selectedStudent.attendancePct.toFixed(1)}%
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">CGPA</span>
                <span className="text-sm font-bold text-white font-mono mt-0.5 block">{selectedStudent.cgpa.toFixed(2)}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block uppercase">Risk Score</span>
                <span className="text-sm font-bold text-rose-400 font-mono mt-0.5 block">{selectedStudent.riskScore} / 100</span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-white/5 space-y-1.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Campus:</span>
                <span className="text-white font-medium">{selectedStudent.campus}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Academic Advisor:</span>
                <span className="text-white font-medium">{selectedStudent.advisor}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedStudent(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={() => handleDownloadTranscript(selectedStudent)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20"
              >
                Download Transcript Summary
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Users className="w-7 h-7 text-sky-400" /> Student Directory
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Server-side paginated repository supporting institutional cohorts (Click any student for detailed records)
          </p>
        </div>

        <a
          href="/api/admin/export/students"
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 flex items-center gap-2 self-start sm:self-auto"
        >
          <Download className="w-4 h-4" /> Export All as CSV
        </a>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-3">
        <form onSubmit={handleSearchSubmit} className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by Roll No, Student Name, or Email..."
            className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </form>

        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          {(['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const).map(lvl => (
            <button
              key={lvl}
              onClick={() => {
                setSelectedRisk(lvl);
                setPage(1);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRisk === lvl
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Students Table */}
      <div className="glass-card rounded-2xl p-6 border-white/10">
        {isLoading ? (
          <LoadingSkeleton rows={6} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Campus</th>
                  <th className="p-3">Year / Sec</th>
                  <th className="p-3">Attendance %</th>
                  <th className="p-3">CGPA</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3">Advisor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {students.map(st => (
                  <tr
                    key={st.id}
                    onClick={() => setSelectedStudent(st)}
                    className="hover:bg-slate-800/40 transition-all cursor-pointer group"
                  >
                    <td className="p-3 font-mono font-bold text-sky-400">{st.rollNo}</td>
                    <td className="p-3 font-semibold text-white group-hover:text-sky-300 transition-colors">
                      {st.name}
                      <span className="text-[10px] text-slate-400 font-normal block">{st.email}</span>
                    </td>
                    <td className="p-3 text-slate-300">{st.department}</td>
                    <td className="p-3 text-slate-400">{st.campus}</td>
                    <td className="p-3 font-mono">Yr {st.year} ({st.section})</td>
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
                    <td className="p-3">
                      <RiskBadge level={st.riskLevel} score={st.riskScore} />
                    </td>
                    <td className="p-3 text-slate-400">{st.advisor}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing page {page} of {totalPages} ({total} total students)
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

export default StudentManager;
