import React, { useState, useEffect } from 'react';
import { FileText, Clock, CheckCircle2, AlertCircle, UploadCloud, X } from 'lucide-react';
import api from '../../api/client.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';
import EmptyState from '../../components/common/EmptyState.js';

export const StudentAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [submittingAssignment, setSubmittingAssignment] = useState<any | null>(null);
  const [submissionComments, setSubmissionComments] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchAssignments = async () => {
    try {
      const res = await api.getStudentAssignments();
      if (res.success) {
        setAssignments(res.assignments);
      }
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const handleOpenSubmit = (assignment: any) => {
    setSubmittingAssignment(assignment);
    setSubmissionComments('');
  };

  const handleConfirmSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment) return;

    setIsSubmitting(true);
    try {
      await api.submitAssignment(
        submittingAssignment.id,
        submissionComments,
        '/uploads/submissions/sample-solution.pdf'
      );
      setSubmittingAssignment(null);
      await fetchAssignments();
      alert('Assignment submitted successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Assignments & Submissions</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Submit coursework, track grading feedback & check deadlines
          </p>
        </div>
      </div>

      {/* Submission Modal */}
      {submittingAssignment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95">
            <button
              onClick={() => setSubmittingAssignment(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Submit Assignment</h3>
            <p className="text-xs text-sky-400 font-semibold mb-4">
              {submittingAssignment.subjectCode} — {submittingAssignment.title}
            </p>

            <form onSubmit={handleConfirmSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Submission Notes / Code Links / Comments
                </label>
                <textarea
                  rows={4}
                  value={submissionComments}
                  onChange={e => setSubmissionComments(e.target.value)}
                  placeholder="Paste GitHub repository links or brief explanation of your solution..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="p-4 rounded-xl border border-dashed border-slate-700 bg-slate-800/40 text-center">
                <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                <p className="text-xs text-slate-300">Solution document attached: <span className="text-sky-400 font-mono">solution.pdf</span></p>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSubmittingAssignment(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-sky-600/20"
                >
                  {isSubmitting ? 'Submitting...' : 'Confirm Submission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assignments List */}
      {assignments.length === 0 ? (
        <EmptyState title="No Assignments" description="You have no pending assignments at this time." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assignments.map(a => {
            const isOverdue = a.status === 'OVERDUE';
            const isSubmitted = a.status === 'SUBMITTED' || a.status === 'GRADED' || a.status === 'LATE';

            return (
              <div
                key={a.id}
                className={`glass-card rounded-2xl p-5 border flex flex-col justify-between ${
                  isOverdue ? 'border-rose-500/30 bg-rose-950/10' : 'border-white/10'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono text-[10px] font-bold">
                      {a.subjectCode}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        a.status === 'GRADED'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : a.status === 'SUBMITTED'
                          ? 'bg-blue-500/20 text-blue-300'
                          : a.status === 'OVERDUE'
                          ? 'bg-rose-500/20 text-rose-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {a.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white mb-1">{a.title}</h3>
                  <p className="text-xs text-slate-400 mb-3">{a.description}</p>
                </div>

                <div className="pt-3 border-t border-slate-800/80 space-y-3">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" /> Due: {new Date(a.deadline).toLocaleDateString()}
                    </span>
                    <span className="font-mono text-slate-300">Max: {a.maxMarks} pts</span>
                  </div>

                  {a.submission?.marksObtained !== null && a.submission?.marksObtained !== undefined && (
                    <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs text-emerald-300 font-medium">
                      <span>Graded Score:</span>
                      <span className="font-bold font-mono text-sm">{a.submission.marksObtained} / {a.maxMarks}</span>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleOpenSubmit(a)}
                      className={`w-full py-2 rounded-lg text-xs font-bold transition-all ${
                        isSubmitted
                          ? 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
                          : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/20'
                      }`}
                    >
                      {isSubmitted ? 'Resubmit / Edit Solution' : 'Submit Solution'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentAssignments;
