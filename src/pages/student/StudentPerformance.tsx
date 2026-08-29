import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Award,
  TrendingUp,
  BookOpen,
  CheckCircle2,
  HelpCircle,
} from 'lucide-react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  BarChart,
  Bar,
} from 'recharts';
import api from '../../api/client.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';
import { StudentPerformanceData } from '../../types/index.js';

export const StudentPerformance: React.FC = () => {
  const [data, setData] = useState<StudentPerformanceData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const res = await api.getStudentPerformance();
        if (res.success) {
          setData(res.performance);
        }
      } catch (err) {
        console.error('Failed to load performance:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchPerformance();
  }, []);

  const [selectedCourse, setSelectedCourse] = useState<any | null>(null);

  if (isLoading || !data) {
    return <LoadingSkeleton rows={6} />;
  }

  // Pre-seed semester history graph points for a rich 5-semester trend
  const trendChartData = [
    { semester: 'Sem 1', gpa: 6.4, cgpa: 6.4 },
    { semester: 'Sem 2', gpa: 6.8, cgpa: 6.6 },
    { semester: 'Sem 3', gpa: 5.9, cgpa: 6.37 },
    { semester: 'Sem 4', gpa: 5.5, cgpa: 6.15 },
    { semester: 'Sem 5 (Current)', gpa: data.currentGpa, cgpa: data.cgpa },
  ];

  return (
    <div className="space-y-6">
      {/* Course Evaluation Breakdown Modal */}
      {selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-purple-500/10 text-purple-300">
                  {selectedCourse.subjectCode} • Course Evaluation Scorecard
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedCourse.subjectName}</h3>
                <p className="text-xs text-slate-400">{selectedCourse.credits} Credits • Semester {data.currentSemester}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-white">{selectedCourse.totalMarks} <span className="text-xs text-slate-400">/ 100</span></span>
                <div className="text-xs font-bold text-purple-400">Grade: {selectedCourse.grade}</div>
              </div>
            </div>

            {/* Detailed Component Breakdown */}
            <div className="space-y-2.5 p-4 rounded-xl bg-slate-950/80 border border-white/5 text-xs text-slate-300">
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Internal Continuous Assessment (Max: 20):</span>
                <span className="font-mono font-bold text-white">{selectedCourse.internalMarks} pts</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Mid-Semester Written Examination (Max: 20):</span>
                <span className="font-mono font-bold text-white">{selectedCourse.midtermMarks} pts</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Assignments & Case Studies (Max: 10):</span>
                <span className="font-mono font-bold text-white">{selectedCourse.assignmentsMarks} pts</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-slate-800">
                <span>Practical / Laboratory Work (Max: 10):</span>
                <span className="font-mono font-bold text-white">{selectedCourse.practicalMarks} pts</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span>End-Semester Final Assessment (Max: 40):</span>
                <span className="font-mono font-bold text-emerald-400">{selectedCourse.finalMarks} pts</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedCourse(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Academic Performance</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Standardized GPA/CGPA calculations, marks evaluation & semester progression (Click any course to inspect breakdown)
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-purple-500/10 border border-purple-500/20 rounded-xl text-right">
            <span className="text-[10px] text-purple-300 uppercase tracking-wider block font-bold">Cumulative CGPA</span>
            <span className="text-2xl font-extrabold text-white font-mono">{data.cgpa.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-2xl p-5 border-white/10 hover:border-purple-500/30 transition-all">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Semester GPA</span>
          <div className="text-3xl font-extrabold text-white mt-1 font-mono">{data.currentGpa.toFixed(2)}</div>
          <p className="text-xs text-slate-400 mt-1">Calculated from 5 active courses</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border-white/10 hover:border-sky-500/30 transition-all">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Degree Credits</span>
          <div className="text-3xl font-extrabold text-sky-400 mt-1 font-mono">48 / 160</div>
          <p className="text-xs text-slate-400 mt-1">30% Degree Completion</p>
        </div>

        <div className="glass-card rounded-2xl p-5 border-white/10 hover:border-emerald-500/30 transition-all">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Classification</span>
          <div className="text-xl font-bold text-emerald-400 mt-2">First Class Standing</div>
          <p className="text-xs text-slate-400 mt-1">Eligible for Campus Placements</p>
        </div>
      </div>

      {/* GPA Semester Trend Chart */}
      <div className="glass-card rounded-2xl p-6">
        <h3 className="text-base font-bold text-white mb-1 flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-sky-400" /> Multi-Semester Progression & GPA Trajectory
        </h3>
        <p className="text-xs text-slate-400 mb-4">Historical comparison of Semester GPA vs Cumulative CGPA</p>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendChartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="semester" stroke="#64748b" textAnchor="middle" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <YAxis domain={[0, 10]} stroke="#64748b" tick={{ fill: '#94a3b8', fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
              <Line type="monotone" dataKey="gpa" name="Semester GPA" stroke="#38bdf8" strokeWidth={3} dot={{ r: 5 }} isAnimationActive={false} />
              <Line type="monotone" dataKey="cgpa" name="Cumulative CGPA" stroke="#a855f7" strokeWidth={2} strokeDasharray="4 4" isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Enrolled Courses Marks Breakdown */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-purple-400" /> Current Semester Course Marks Matrix (Semester {data.currentSemester})
          </h3>
          <span className="text-xs text-sky-400 font-mono">Click course row to view breakdown →</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-800/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
              <tr>
                <th className="p-3">Course Code</th>
                <th className="p-3">Course Name</th>
                <th className="p-3">Credits</th>
                <th className="p-3">Internal (20)</th>
                <th className="p-3">Midterm (20)</th>
                <th className="p-3">Assign (10)</th>
                <th className="p-3">Pract (10)</th>
                <th className="p-3">Final (40)</th>
                <th className="p-3 font-bold text-white">Total (100)</th>
                <th className="p-3 text-right">Grade (GP)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {data.enrollments.map(e => (
                <tr
                  key={e.id}
                  onClick={() => setSelectedCourse(e)}
                  className="hover:bg-slate-800/50 transition-all cursor-pointer group"
                >
                  <td className="p-3 font-mono font-bold text-sky-400">{e.subjectCode}</td>
                  <td className="p-3 font-semibold text-white group-hover:text-sky-300 transition-colors">{e.subjectName}</td>
                  <td className="p-3">{e.credits}</td>
                  <td className="p-3 font-mono">{e.internalMarks}</td>
                  <td className="p-3 font-mono">{e.midtermMarks}</td>
                  <td className="p-3 font-mono">{e.assignmentsMarks}</td>
                  <td className="p-3 font-mono">{e.practicalMarks}</td>
                  <td className="p-3 font-mono">{e.finalMarks}</td>
                  <td className="p-3 font-mono font-bold text-white text-sm">{e.totalMarks}</td>
                  <td className="p-3 text-right">
                    <span
                      className={`px-2.5 py-1 rounded text-xs font-bold font-mono ${
                        e.grade === 'A+' || e.grade === 'A'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : e.grade === 'B+' || e.grade === 'B'
                          ? 'bg-sky-500/20 text-sky-300'
                          : e.grade === 'C'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {e.grade} ({e.gradePoint?.toFixed(1)})
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Configurable Grading Policy Reference */}
      <div className="glass-card rounded-2xl p-5 border border-white/5 bg-slate-900/40 text-xs">
        <h4 className="font-bold text-slate-300 mb-2 flex items-center gap-1.5">
          <HelpCircle className="w-4 h-4 text-slate-400" /> Configurable University Grading Scale
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
          <div className="p-2 rounded bg-slate-800/60 text-center">
            <span className="font-bold text-emerald-400">A+ (10.0)</span>
            <div className="text-[10px] text-slate-400">90 – 100%</div>
          </div>
          <div className="p-2 rounded bg-slate-800/60 text-center">
            <span className="font-bold text-emerald-400">A (9.0)</span>
            <div className="text-[10px] text-slate-400">80 – 89%</div>
          </div>
          <div className="p-2 rounded bg-slate-800/60 text-center">
            <span className="font-bold text-sky-400">B+ (8.0)</span>
            <div className="text-[10px] text-slate-400">70 – 79%</div>
          </div>
          <div className="p-2 rounded bg-slate-800/60 text-center">
            <span className="font-bold text-sky-400">B (7.0)</span>
            <div className="text-[10px] text-slate-400">60 – 69%</div>
          </div>
          <div className="p-2 rounded bg-slate-800/60 text-center">
            <span className="font-bold text-amber-400">C (6.0)</span>
            <div className="text-[10px] text-slate-400">50 – 59%</div>
          </div>
          <div className="p-2 rounded bg-slate-800/60 text-center">
            <span className="font-bold text-amber-400">D (5.0)</span>
            <div className="text-[10px] text-slate-400">40 – 49%</div>
          </div>
          <div className="p-2 rounded bg-slate-800/60 text-center">
            <span className="font-bold text-rose-400">F (0.0)</span>
            <div className="text-[10px] text-slate-400">&lt; 40%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentPerformance;
