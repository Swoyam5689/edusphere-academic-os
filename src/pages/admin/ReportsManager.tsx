import React, { useState } from 'react';
import { FileSpreadsheet, Download, CheckCircle2, ShieldCheck, Users, Briefcase, AlertTriangle, Building } from 'lucide-react';
import api from '../../api/client.js';

export const ReportsManager: React.FC = () => {
  const [downloadingReport, setDownloadingReport] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const triggerCsvDownload = (filename: string, content: string) => {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDownloadReport = async (type: string) => {
    setDownloadingReport(type);
    setSuccessMessage(null);

    try {
      if (type === 'students') {
        const res = await api.getStudentsDirectory({ limit: 100 });
        if (res.success && res.students) {
          const headers = ['Roll No', 'Name', 'Email', 'Department', 'Campus', 'Year', 'Section', 'Attendance %', 'CGPA', 'Risk Level', 'Risk Score', 'Advisor'];
          const rows = res.students.map((s: any) => [
            s.rollNo,
            `"${s.name}"`,
            s.email,
            `"${s.department}"`,
            `"${s.campus}"`,
            s.year,
            s.section,
            s.attendancePct.toFixed(1),
            s.cgpa.toFixed(2),
            s.riskLevel,
            s.riskScore,
            `"${s.advisor}"`,
          ]);
          const csv = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
          triggerCsvDownload('edusphere-students-registry.csv', csv);
        }
      } else if (type === 'workload') {
        const res = await api.getFacultyWorkloadLeaderboard();
        if (res.success && res.facultyList) {
          const headers = ['Emp ID', 'Name', 'Department', 'Teaching Hours/Wk', 'Total Classes', 'Assigned Students', 'Workload Score', 'Workload Status', 'Recommendation'];
          const rows = res.facultyList.map((f: any) => [
            f.empId,
            `"${f.name}"`,
            `"${f.department}"`,
            f.teachingHours,
            f.totalClasses,
            f.totalStudents,
            f.workloadScore,
            f.workloadStatus,
            `"${f.recommendation || 'Balanced'}"`,
          ]);
          const csv = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
          triggerCsvDownload('edusphere-faculty-workload-audit.csv', csv);
        }
      } else if (type === 'risk') {
        const res = await api.getAtRiskStudents({});
        if (res.success && res.atRiskStudents) {
          const headers = ['Roll No', 'Name', 'Department', 'Attendance %', 'CGPA', 'Sem Drop %', 'Backlogs', 'Risk Score', 'Risk Level', 'Primary Factor', 'Suggested Action'];
          const rows = res.atRiskStudents.map((r: any) => [
            r.rollNo,
            `"${r.name}"`,
            `"${r.department}"`,
            r.attendancePct.toFixed(1),
            r.cgpa.toFixed(2),
            r.semesterDropPct.toFixed(1),
            r.backlogs,
            r.riskScore,
            r.riskLevel,
            `"${r.primaryFactor}"`,
            `"${r.suggestedAction}"`,
          ]);
          const csv = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
          triggerCsvDownload('edusphere-at-risk-interventions.csv', csv);
        }
      } else if (type === 'campuses') {
        const headers = ['Campus Name', 'City', 'Students', 'Faculty', 'Avg Attendance %', 'Avg CGPA', 'At Risk %', 'Placement Rate %'];
        const rows = [
          ['"Main Campus, Tech Hub"', '"Bangalore"', '1840', '124', '82.4', '7.45', '8.2', '89.4'],
          ['"North Campus Innovations"', '"Delhi NCR"', '1420', '98', '79.1', '7.18', '11.4', '84.2'],
          ['"West Coast Institute"', '"Mumbai"', '1160', '82', '81.6', '7.32', '9.1', '86.7'],
        ];
        const csv = [headers.join(','), ...rows.map((r: any[]) => r.join(','))].join('\n');
        triggerCsvDownload('edusphere-campus-benchmarks.csv', csv);
      }

      setSuccessMessage(`Successfully generated & exported report!`);
      setTimeout(() => setSuccessMessage(null), 4000);
    } catch (err) {
      console.error('Export error:', err);
    } finally {
      setDownloadingReport(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileSpreadsheet className="w-7 h-7 text-emerald-400" /> Institutional Reports & CSV Exports
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Generate and stream server-side CSV datasets for audits, accreditation & departmental analytics
          </p>
        </div>
      </div>

      {successMessage && (
        <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 font-semibold flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          {successMessage}
        </div>
      )}

      {/* Export Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Card 1: Student Registry */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:border-sky-500/30 transition-all">
          <div>
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit mb-3">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Student Academic & Attendance Registry</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Complete student cohort dataset with roll number, program, campus, attendance %, CGPA, and risk classification.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Format: Standard CSV</span>
            <button
              onClick={() => handleDownloadReport('students')}
              disabled={downloadingReport === 'students'}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {downloadingReport === 'students' ? 'Exporting...' : 'Download CSV'}
            </button>
          </div>
        </div>

        {/* Card 2: Faculty Workload */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:border-amber-500/30 transition-all">
          <div>
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-3">
              <Briefcase className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Faculty Workload Index & Capacity Audit</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Comprehensive report detailing weekly teaching hours, class count, active student load, and rebalancing recommendations.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Format: Standard CSV</span>
            <button
              onClick={() => handleDownloadReport('workload')}
              disabled={downloadingReport === 'workload'}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-amber-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {downloadingReport === 'workload' ? 'Exporting...' : 'Download CSV'}
            </button>
          </div>
        </div>

        {/* Card 3: At Risk Interventions */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:border-rose-500/30 transition-all">
          <div>
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-400 w-fit mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">At-Risk Early Warning & Intervention Matrix</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Granular risk diagnosis scoring, attendance deficit points, semester drop factors, and tailored advisor intervention actions.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Format: Standard CSV</span>
            <button
              onClick={() => handleDownloadReport('risk')}
              disabled={downloadingReport === 'risk'}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-rose-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {downloadingReport === 'risk' ? 'Exporting...' : 'Download CSV'}
            </button>
          </div>
        </div>

        {/* Card 4: Campus Benchmarks */}
        <div className="glass-card rounded-2xl p-6 border border-white/10 flex flex-col justify-between hover:border-emerald-500/30 transition-all">
          <div>
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-3">
              <Building className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">Multi-Campus Accreditation & Performance Benchmarks</h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Cross-campus comparison matrix tracking average CGPA, retention rates, placement conversions, and resource compliance.
            </p>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between">
            <span className="text-xs text-slate-400 font-mono">Format: Standard CSV</span>
            <button
              onClick={() => handleDownloadReport('campuses')}
              disabled={downloadingReport === 'campuses'}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              {downloadingReport === 'campuses' ? 'Exporting...' : 'Download CSV'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportsManager;
