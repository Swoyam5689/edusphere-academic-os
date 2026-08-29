import React, { useState, useEffect } from 'react';
import { Activity, ChevronRight, ArrowLeft, Users, Building, GraduationCap, AlertTriangle } from 'lucide-react';
import api from '../../api/client.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';
import RiskBadge from '../../components/common/RiskBadge.js';

export const AttendanceAnalytics: React.FC = () => {
  const [drillState, setDrillState] = useState<{
    campusId?: string;
    campusName?: string;
    departmentId?: string;
    departmentName?: string;
    programId?: string;
    programName?: string;
    year?: number;
    section?: string;
  }>({});

  const [drillData, setDrillData] = useState<{
    level: string;
    parentLabel: string;
    data: any[];
  } | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const fetchDrillLevel = async () => {
    setIsLoading(true);
    try {
      const res = await api.getDrillDown({
        campusId: drillState.campusId,
        departmentId: drillState.departmentId,
        programId: drillState.programId,
        year: drillState.year,
        section: drillState.section,
      });

      if (res.success) {
        setDrillData(res);
      }
    } catch (err) {
      console.error('Failed to load drill down:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDrillLevel();
  }, [drillState]);

  const handleRowClick = (item: any) => {
    if (drillData?.level === 'CAMPUSES') {
      setDrillState({ ...drillState, campusId: item.id, campusName: item.name });
    } else if (drillData?.level === 'DEPARTMENTS') {
      setDrillState({ ...drillState, departmentId: item.id, departmentName: item.name });
    } else if (drillData?.level === 'PROGRAMS') {
      setDrillState({ ...drillState, programId: item.id, programName: item.name });
    } else if (drillData?.level === 'YEARS') {
      setDrillState({ ...drillState, year: item.year });
    } else if (drillData?.level === 'SECTIONS') {
      setDrillState({ ...drillState, section: item.id });
    }
  };

  const handleResetTo = (step: 'ALL' | 'CAMPUS' | 'DEPT' | 'PROGRAM' | 'YEAR') => {
    if (step === 'ALL') {
      setDrillState({});
    } else if (step === 'CAMPUS') {
      setDrillState({ campusId: drillState.campusId, campusName: drillState.campusName });
    } else if (step === 'DEPT') {
      setDrillState({
        campusId: drillState.campusId,
        campusName: drillState.campusName,
        departmentId: drillState.departmentId,
        departmentName: drillState.departmentName,
      });
    } else if (step === 'PROGRAM') {
      setDrillState({
        campusId: drillState.campusId,
        campusName: drillState.campusName,
        departmentId: drillState.departmentId,
        departmentName: drillState.departmentName,
        programId: drillState.programId,
        programName: drillState.programName,
      });
    } else if (step === 'YEAR') {
      setDrillState({
        campusId: drillState.campusId,
        campusName: drillState.campusName,
        departmentId: drillState.departmentId,
        departmentName: drillState.departmentName,
        programId: drillState.programId,
        programName: drillState.programName,
        year: drillState.year,
      });
    }
  };

  const [selectedStudentForOverride, setSelectedStudentForOverride] = useState<any | null>(null);
  const [studentRecords, setStudentRecords] = useState<any | null>(null);
  const [overrideStatus, setOverrideStatus] = useState<string>('PRESENT');
  const [overrideRemarks, setOverrideRemarks] = useState<string>('');
  const [selectedRecordId, setSelectedRecordId] = useState<string | null>(null);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [isSavingOverride, setIsSavingOverride] = useState(false);
  const [overrideMessage, setOverrideMessage] = useState<string | null>(null);

  const handleOpenStudentOverride = async (student: any) => {
    setSelectedStudentForOverride(student);
    setOverrideRemarks('');
    setOverrideMessage(null);
    try {
      const res = await api.getStudentAttendanceByAdmin(student.id);
      if (res.success) {
        setStudentRecords(res);
        if (res.summary?.subjectMetrics?.length > 0) {
          setSelectedSubjectId(res.summary.subjectMetrics[0].subjectId);
        }
      }
    } catch (err) {
      console.error('Failed to load student attendance:', err);
    }
  };

  const handleSaveOverride = async () => {
    if (!selectedStudentForOverride) return;
    setIsSavingOverride(true);
    try {
      const res = await api.overrideStudentAttendance({
        studentId: selectedStudentForOverride.id,
        subjectId: selectedSubjectId || undefined,
        recordId: selectedRecordId || undefined,
        status: overrideStatus,
        remarks: overrideRemarks || 'Administrative attendance adjustment',
      });

      if (res.success) {
        setOverrideMessage('Attendance updated and recalculated successfully!');
        // Refresh student data in modal
        const refreshed = await api.getStudentAttendanceByAdmin(selectedStudentForOverride.id);
        if (refreshed.success) {
          setStudentRecords(refreshed);
        }
        // Refresh drill level
        fetchDrillLevel();
        setTimeout(() => setOverrideMessage(null), 3000);
      }
    } catch (err: any) {
      alert(err.message || 'Failed to save attendance override');
    } finally {
      setIsSavingOverride(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Administrative Attendance Edit Modal */}
      {selectedStudentForOverride && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-2xl rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95 space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400">
                  {selectedStudentForOverride.rollNo} • Attendance Correction & Duty Leave Override
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedStudentForOverride.name}</h3>
                <p className="text-xs text-slate-400">{selectedStudentForOverride.email}</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-extrabold text-white font-mono">
                  {studentRecords?.summary?.overallPercentage?.toFixed(1) || selectedStudentForOverride.attendancePct.toFixed(1)}%
                </span>
                <span className="text-xs text-slate-400 block">Overall Attendance</span>
              </div>
            </div>

            {overrideMessage && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-xs text-emerald-300 font-semibold flex items-center gap-2">
                ✓ {overrideMessage}
              </div>
            )}

            {/* Subject Summary Pills */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {studentRecords?.summary?.subjectMetrics?.map((sub: any) => (
                <div
                  key={sub.subjectId}
                  onClick={() => {
                    setSelectedSubjectId(sub.subjectId);
                    setSelectedRecordId(null);
                  }}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedSubjectId === sub.subjectId
                      ? 'bg-sky-500/15 border-sky-500/40'
                      : 'bg-slate-800/40 border-white/5 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-white font-mono">{sub.subjectCode}</span>
                    <span className={`font-bold ${sub.percentage < 75 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {sub.percentage.toFixed(1)}%
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 block truncate">{sub.subjectName}</span>
                </div>
              ))}
            </div>

            {/* Override Controls Form */}
            <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5 space-y-3">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                {selectedRecordId ? 'Edit Selected Record' : 'Add Duty Leave / Session Attendance Adjustment'}
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">New Attendance Status:</label>
                  <select
                    value={overrideStatus}
                    onChange={e => setOverrideStatus(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white focus:outline-none focus:border-sky-500"
                  >
                    <option value="PRESENT">PRESENT (Full Credit)</option>
                    <option value="EXCUSED">EXCUSED (Duty Leave / Medical Exemption)</option>
                    <option value="LATE">LATE (Partial Attendance)</option>
                    <option value="ABSENT">ABSENT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Administrative Remarks / Reason:</label>
                  <input
                    type="text"
                    value={overrideRemarks}
                    onChange={e => setOverrideRemarks(e.target.value)}
                    placeholder="e.g. Official Hackathon Duty Leave, Medical Certificate"
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-1">
                {selectedRecordId && (
                  <button
                    onClick={() => {
                      setSelectedRecordId(null);
                      setOverrideRemarks('');
                    }}
                    className="px-3 py-1.5 bg-slate-800 text-slate-400 text-xs font-semibold rounded-lg"
                  >
                    Cancel Edit
                  </button>
                )}
                <button
                  onClick={handleSaveOverride}
                  disabled={isSavingOverride}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                >
                  {isSavingOverride ? 'Updating...' : 'Save & Sync Attendance'}
                </button>
              </div>
            </div>

            {/* Attendance History Roster */}
            <div>
              <h4 className="text-xs font-bold text-white mb-2">Recent Session History (Click record to edit)</h4>
              <div className="max-h-48 overflow-y-auto space-y-1.5 pr-1">
                {studentRecords?.history?.map((h: any) => (
                  <div
                    key={h.id}
                    onClick={() => {
                      setSelectedRecordId(h.id);
                      setSelectedSubjectId(h.subjectId);
                      setOverrideStatus(h.status);
                      setOverrideRemarks(h.remarks || '');
                    }}
                    className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                      selectedRecordId === h.id
                        ? 'bg-sky-500/20 border-sky-500'
                        : 'bg-slate-800/40 border-white/5 hover:bg-slate-800'
                    }`}
                  >
                    <div>
                      <span className="font-mono text-slate-400 text-[10px] mr-2">{h.date}</span>
                      <span className="font-bold text-white mr-2">{h.subjectCode}</span>
                      {h.remarks && <span className="text-[10px] text-amber-300/90 italic">({h.remarks})</span>}
                    </div>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono ${
                        h.status === 'PRESENT'
                          ? 'bg-emerald-500/20 text-emerald-400'
                          : h.status === 'EXCUSED'
                          ? 'bg-blue-500/20 text-blue-400'
                          : 'bg-rose-500/20 text-rose-400'
                      }`}
                    >
                      {h.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedStudentForOverride(null)}
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Activity className="w-7 h-7 text-sky-400" /> Hierarchical Attendance Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Dynamic drill-down & attendance correction console (Click student row to edit/override attendance)
          </p>
        </div>
      </div>

      {/* Breadcrumb Navigator */}
      <div className="glass-card rounded-2xl p-4 flex items-center gap-2 text-xs font-semibold overflow-x-auto">
        <button
          onClick={() => handleResetTo('ALL')}
          className={`hover:text-sky-400 transition-all ${
            !drillState.campusId ? 'text-sky-400 font-bold' : 'text-slate-400'
          }`}
        >
          University
        </button>

        {drillState.campusId && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => handleResetTo('CAMPUS')}
              className={`hover:text-sky-400 transition-all ${
                drillState.campusId && !drillState.departmentId ? 'text-sky-400 font-bold' : 'text-slate-400'
              }`}
            >
              {drillState.campusName || 'Campus'}
            </button>
          </>
        )}

        {drillState.departmentId && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => handleResetTo('DEPT')}
              className={`hover:text-sky-400 transition-all ${
                drillState.departmentId && !drillState.programId ? 'text-sky-400 font-bold' : 'text-slate-400'
              }`}
            >
              {drillState.departmentName || 'Department'}
            </button>
          </>
        )}

        {drillState.programId && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => handleResetTo('PROGRAM')}
              className={`hover:text-sky-400 transition-all ${
                drillState.programId && !drillState.year ? 'text-sky-400 font-bold' : 'text-slate-400'
              }`}
            >
              {drillState.programName || 'Program'}
            </button>
          </>
        )}

        {drillState.year && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <button
              onClick={() => handleResetTo('YEAR')}
              className={`hover:text-sky-400 transition-all ${
                drillState.year && !drillState.section ? 'text-sky-400 font-bold' : 'text-slate-400'
              }`}
            >
              Year {drillState.year}
            </button>
          </>
        )}

        {drillState.section && (
          <>
            <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />
            <span className="text-sky-400 font-bold">Section {drillState.section}</span>
          </>
        )}
      </div>

      {/* Drill-down Interactive Table */}
      <div className="glass-card rounded-2xl p-6 border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Viewing Level: <span className="text-sky-400">{drillData?.level}</span>
            </h3>
            <p className="text-xs text-slate-400">
              {drillData?.level === 'STUDENTS'
                ? 'Click any student row below to edit or override attendance'
                : 'Click any row below to drill into the next sub-hierarchy level'}
            </p>
          </div>
        </div>

        {isLoading ? (
          <LoadingSkeleton rows={5} />
        ) : !drillData || drillData.data.length === 0 ? (
          <p className="text-center py-8 text-xs text-slate-400">No records found for this drill level.</p>
        ) : drillData.level === 'STUDENTS' ? (
          /* Students Level Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Roll No</th>
                  <th className="p-3">Student Name</th>
                  <th className="p-3">Email</th>
                  <th className="p-3">Attendance %</th>
                  <th className="p-3">CGPA</th>
                  <th className="p-3">Risk Level</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {drillData.data.map(st => (
                  <tr
                    key={st.id}
                    onClick={() => handleOpenStudentOverride(st)}
                    className="hover:bg-slate-800/40 transition-all cursor-pointer group"
                  >
                    <td className="p-3 font-mono font-bold text-sky-400">{st.rollNo}</td>
                    <td className="p-3 font-semibold text-white group-hover:text-sky-300 transition-colors">{st.name}</td>
                    <td className="p-3 text-slate-400">{st.email}</td>
                    <td className="p-3">
                      <span
                        className={`font-mono font-bold ${
                          st.attendancePct < 75 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {st.attendancePct.toFixed(1)}%
                      </span>
                    </td>
                    <td className="p-3 font-mono text-white">{st.cgpa.toFixed(2)}</td>
                    <td className="p-3">
                      <RiskBadge level={st.riskLevel} score={st.riskScore} />
                    </td>
                    <td className="p-3 text-right">
                      <span className="px-2.5 py-1 rounded bg-sky-600/20 text-sky-300 text-[10px] font-bold border border-sky-500/30 group-hover:bg-sky-600 group-hover:text-white transition-all">
                        Edit Attendance →
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Hierarchy Aggregates Table */
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Entity Name</th>
                  <th className="p-3">Student Population</th>
                  <th className="p-3">Average Attendance %</th>
                  <th className="p-3">Average CGPA</th>
                  <th className="p-3">At-Risk Count</th>
                  <th className="p-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {drillData.data.map(item => (
                  <tr
                    key={item.id}
                    onClick={() => handleRowClick(item)}
                    className="hover:bg-slate-800/60 cursor-pointer transition-all group"
                  >
                    <td className="p-3 font-bold text-white group-hover:text-sky-400 flex items-center gap-2">
                      <Building className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-400" />
                      {item.name}
                    </td>
                    <td className="p-3 font-mono text-slate-300">{item.studentCount} Students</td>
                    <td className="p-3">
                      <span
                        className={`font-mono font-bold ${
                          item.avgAttendance < 75 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {item.avgAttendance}%
                      </span>
                    </td>
                    <td className="p-3 font-mono text-white">{item.avgCgpa}</td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          item.atRiskCount > 0
                            ? 'bg-rose-500/20 text-rose-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {item.atRiskCount} At-Risk
                      </span>
                    </td>
                    <td className="p-3 text-right text-sky-400 font-semibold flex items-center justify-end gap-1">
                      Drill Down <ChevronRight className="w-3.5 h-3.5" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceAnalytics;
