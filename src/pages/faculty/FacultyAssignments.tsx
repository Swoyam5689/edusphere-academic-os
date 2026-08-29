import React, { useState, useEffect } from 'react';
import { FileText, Plus, CheckCircle2, Clock, X, Users, Award, FileCheck } from 'lucide-react';
import api from '../../api/client.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';
import EmptyState from '../../components/common/EmptyState.js';

export const FacultyAssignments: React.FC = () => {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Create Assignment Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedSubjectId, setSelectedSubjectId] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [maxMarks, setMaxMarks] = useState(100);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Grade Modal
  const [gradingSubmission, setGradingSubmission] = useState<{ assignmentId: string; sub: any } | null>(null);
  const [marksObtained, setMarksObtained] = useState('');
  const [feedback, setFeedback] = useState('');
  const [isGrading, setIsGrading] = useState(false);

  const fetchData = async () => {
    try {
      const [aRes, sRes] = await Promise.all([
        api.getFacultyAssignments(),
        api.getFacultySubjects(),
      ]);
      if (aRes.success) setAssignments(aRes.assignments);
      if (sRes.success && sRes.subjects.length > 0) {
        setSubjects(sRes.subjects);
        if (!selectedSubjectId) setSelectedSubjectId(sRes.subjects[0].id);
      }
    } catch (err) {
      console.error('Failed to load faculty assignments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedSubjectId) return;

    setIsSubmitting(true);
    try {
      await api.createFacultyAssignment({
        subjectId: selectedSubjectId,
        title,
        description,
        deadline: deadline ? new Date(deadline).toISOString() : undefined,
        maxMarks: Number(maxMarks) || 100,
      });

      setIsCreateOpen(false);
      setTitle('');
      setDescription('');
      await fetchData();
      alert('Assignment created successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to create assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    setIsGrading(true);
    try {
      await api.gradeAssignmentSubmission(
        gradingSubmission.assignmentId,
        gradingSubmission.sub.id,
        Number(marksObtained),
        feedback
      );

      setGradingSubmission(null);
      setMarksObtained('');
      setFeedback('');
      await fetchData();
      alert('Submission graded successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to grade submission');
    } finally {
      setIsGrading(false);
    }
  };

  if (isLoading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      {/* Create Assignment Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95">
            <button
              onClick={() => setIsCreateOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Create New Assignment</h3>
            <p className="text-xs text-slate-400 mb-4">
              Set coursework requirements, submission deadline & maximum grading points
            </p>

            <form onSubmit={handleCreateAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course / Subject *</label>
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Assignment Title *</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="e.g. Assignment 4: SQL Transactions & ACID Proofs"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Max Marks</label>
                  <input
                    type="number"
                    value={maxMarks}
                    onChange={e => setMaxMarks(Number(e.target.value))}
                    min={10}
                    max={100}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Submission Deadline</label>
                  <input
                    type="date"
                    value={deadline}
                    onChange={e => setDeadline(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Coursework Description / Prompt</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Provide instructions, required problem sets, or submission format guidelines..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-sky-600/20"
                >
                  {isSubmitting ? 'Creating...' : 'Publish Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grade Submission Modal */}
      {gradingSubmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95">
            <button
              onClick={() => setGradingSubmission(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-bold text-white mb-1">Grade Student Submission</h3>
            <p className="text-xs text-sky-400 font-semibold mb-4">
              Student: {gradingSubmission.sub.student.user.name} ({gradingSubmission.sub.student.studentRollNo})
            </p>

            <form onSubmit={handleConfirmGrade} className="space-y-4">
              {gradingSubmission.sub.comments && (
                <div className="p-3 bg-slate-800/60 rounded-xl border border-white/5 text-xs text-slate-300">
                  <span className="font-bold text-slate-400 block mb-1">Student Notes:</span>
                  {gradingSubmission.sub.comments}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Marks Obtained (out of 100) *
                </label>
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={marksObtained}
                  onChange={e => setMarksObtained(e.target.value)}
                  placeholder="e.g. 88"
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-sm font-mono focus:outline-none focus:border-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Feedback / Instructor Comments</label>
                <textarea
                  rows={3}
                  value={feedback}
                  onChange={e => setFeedback(e.target.value)}
                  placeholder="Constructive remarks and feedback for the student..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setGradingSubmission(null)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isGrading}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-emerald-600/20"
                >
                  {isGrading ? 'Submitting Grade...' : 'Save & Publish Grade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <FileText className="w-7 h-7 text-purple-400" /> Assignment & Evaluation Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Create course assignments, inspect student solutions & grade submissions
          </p>
        </div>

        <button
          onClick={() => setIsCreateOpen(true)}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Create Assignment
        </button>
      </div>

      {/* Assignments List with Submissions */}
      {assignments.length === 0 ? (
        <EmptyState
          title="No Coursework Assignments"
          description="Create your first assignment for your enrolled students."
          action={{
            label: '+ Create Assignment',
            onClick: () => setIsCreateOpen(true),
          }}
        />
      ) : (
        <div className="space-y-6">
          {assignments.map(a => (
            <div key={a.id} className="glass-card rounded-2xl p-6 border border-white/10 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 font-mono text-xs font-bold">
                      {a.subject.code}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">{a.subject.name}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mt-1">{a.title}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">{a.description}</p>
                </div>

                <div className="flex items-center gap-3 text-xs text-slate-300">
                  <span className="flex items-center gap-1 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" /> Due: {new Date(a.deadline).toLocaleDateString()}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono font-bold">
                    Max: {a.maxMarks} pts
                  </span>
                </div>
              </div>

              {/* Submissions Roster */}
              <div className="pt-3 border-t border-slate-800">
                <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-sky-400" /> Student Submissions ({a.submissions.length})
                </h4>

                {a.submissions.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {a.submissions.map((sub: any) => (
                      <div
                        key={sub.id}
                        className="p-3.5 rounded-xl bg-slate-800/40 border border-white/5 flex items-center justify-between gap-3 hover:border-sky-500/20 transition-all"
                      >
                        <div>
                          <div className="font-semibold text-white text-xs">{sub.student.user.name}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{sub.student.studentRollNo}</div>
                          {sub.marksObtained !== null && sub.marksObtained !== undefined ? (
                            <span className="inline-block mt-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                              Graded: {sub.marksObtained} / {a.maxMarks} pts
                            </span>
                          ) : (
                            <span className="inline-block mt-1 text-[10px] font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                              Pending Evaluation
                            </span>
                          )}
                        </div>

                        <button
                          onClick={() => {
                            setGradingSubmission({ assignmentId: a.id, sub });
                            setMarksObtained(sub.marksObtained ? String(sub.marksObtained) : '');
                            setFeedback(sub.feedback || '');
                          }}
                          className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-semibold border border-sky-500/30 flex items-center gap-1 shrink-0 transition-all"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          {sub.status === 'GRADED' ? 'Edit Grade' : 'Grade'}
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-2">No student submissions submitted yet.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FacultyAssignments;
