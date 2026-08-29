import React, { useState, useEffect } from 'react';
import { Award, Calendar, Clock, MapPin, CheckCircle2 } from 'lucide-react';
import api from '../../api/client.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';

export const StudentExams: React.FC = () => {
  const [data, setData] = useState<{ upcomingExams: any[]; results: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await api.getStudentExams();
        if (res.success) {
          setData(res);
        }
      } catch (err) {
        console.error('Failed to load exams:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchExams();
  }, []);

  const [selectedExam, setSelectedExam] = useState<any | null>(null);

  const handleDownloadHallTicket = () => {
    const element = document.createElement('a');
    const content =
      `========================================================================\n` +
      `       EDUSPHERE UNIVERSITY — OFFICIAL EXAMINATION HALL TICKET          \n` +
      `========================================================================\n` +
      `Candidate Name: Rahul Sharma\n` +
      `Registration / Roll No: 23CSE101\n` +
      `Program: B.Tech Computer Science & Engineering (Semester 5, Sec A)\n` +
      `Campus: Main Campus, Tech Hub\n` +
      `Issued Date: ${new Date().toLocaleDateString()}\n\n` +
      `------------------------------------------------------------------------\n` +
      `EXAMINATION SCHEDULE & VENUE ALLOCATIONS:\n` +
      `------------------------------------------------------------------------\n` +
      (data?.upcomingExams || [])
        .map(
          e =>
            `• [${e.examType}] ${e.subjectCode} - ${e.subjectName}\n` +
            `  Date: ${e.examDate} | Time: ${e.time} | Room: ${e.roomNo} | Seat: ${e.roomNo}-A12\n`
        )
        .join('\n') +
      `\n------------------------------------------------------------------------\n` +
      `IMPORTANT CANDIDATE INSTRUCTIONS:\n` +
      `1. Carry this official digital hall ticket and your University ID Card.\n` +
      `2. Report to the examination hall at least 15 minutes before start time.\n` +
      `3. Mobile phones, smartwatches, and programmable devices are strictly prohibited.\n` +
      `========================================================================\n` +
      `Controller of Examinations — EduSphere Academic OS\n`;

    const file = new Blob([content], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `HallTicket_23CSE101_Midterm.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  if (isLoading || !data) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      {/* Exam Details Modal */}
      {selectedExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-rose-500/20 text-rose-300">
                  {selectedExam.examType} ASSESSMENT
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedExam.subjectName}</h3>
                <p className="text-xs font-mono text-sky-400">{selectedExam.subjectCode}</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5 space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Date & Time:</span>
                <span className="font-semibold text-white">{selectedExam.examDate} • {selectedExam.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Hall:</span>
                <span className="font-mono font-bold text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-rose-400" /> {selectedExam.roomNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Assigned Desk:</span>
                <span className="font-mono font-bold text-emerald-400">Desk {selectedExam.roomNo}-A12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Duration:</span>
                <span className="font-semibold text-white">2 Hours (Max: {selectedExam.totalMarks} Marks)</span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-white/5 text-[11px] text-slate-300 space-y-1">
              <span className="font-bold text-slate-200 block">Syllabus Units Covered:</span>
              <p className="text-slate-400">Units 1, 2 & 3 (Core conceptual theory, diagram design & proofs).</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedExam(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl"
              >
                Close
              </button>
              <button
                onClick={handleDownloadHallTicket}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20"
              >
                Download Hall Ticket
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Examinations & Seating</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Mid-term and semester final exam schedules, hall tickets & venue details (Click any exam card for seating instructions)
          </p>
        </div>
      </div>

      {/* Upcoming Exam Cards */}
      <div>
        <h2 className="text-base font-bold text-white mb-3">Upcoming Examination Schedule</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.upcomingExams.map(e => (
            <div
              key={e.id}
              onClick={() => setSelectedExam(e)}
              className="glass-card rounded-2xl p-5 border border-white/10 hover:border-sky-500/40 hover:bg-slate-800/40 flex flex-col justify-between cursor-pointer transition-all group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-rose-500/20 text-rose-300">
                    {e.examType} ASSESSMENT
                  </span>
                  <span className="text-xs font-mono text-slate-400">Total: {e.totalMarks} Marks</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1 group-hover:text-sky-300 transition-colors flex items-center justify-between">
                  {e.subjectName}
                  <span className="text-[10px] text-sky-400 opacity-0 group-hover:opacity-100 transition-opacity font-normal">
                    View Seating →
                  </span>
                </h3>
                <p className="text-xs font-mono text-sky-400">{e.subjectCode}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 space-y-2">
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-sky-400" />
                    <span>{e.examDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-sky-400" />
                    <span>{e.time}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-800/80 border border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" /> Examination Venue:
                  </span>
                  <span className="font-bold text-white font-mono">{e.roomNo}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hall Ticket Verification Advice */}
      <div className="p-4 rounded-xl bg-slate-800/50 border border-white/5 text-xs text-slate-400 flex items-center justify-between">
        <span>Please carry your digital identity card and arrive at the hall 15 minutes prior to the exam start time.</span>
        <button
          onClick={handleDownloadHallTicket}
          className="px-3.5 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-semibold border border-sky-500/30 flex items-center gap-1.5 cursor-pointer"
        >
          Download Hall Ticket
        </button>
      </div>
    </div>
  );
};

export default StudentExams;
