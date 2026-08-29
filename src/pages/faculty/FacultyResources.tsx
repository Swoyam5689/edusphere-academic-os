import React, { useState, useEffect } from 'react';
import { BookOpen, UploadCloud, Plus, Calendar, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../api/client.js';
import ResourceUploadModal from '../../components/common/ResourceUploadModal.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';

export const FacultyResources: React.FC = () => {
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any | null>(null);

  const fetchSessions = async () => {
    try {
      const res = await api.getFacultyTodaySessions();
      if (res.success) {
        setSessions(res.sessions);
      }
    } catch (err) {
      console.error('Failed to load sessions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const handleOpenUpload = (session?: any) => {
    setSelectedSession(session || {
      id: 'session-default',
      subjectId: 'CS501',
      subjectCode: 'CS501 (DBMS)',
      topic: 'Normalization & Functional Dependencies',
    });
    setIsModalOpen(true);
  };

  if (isLoading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      {/* Upload Modal */}
      {selectedSession && (
        <ResourceUploadModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedSession(null);
          }}
          onSuccess={() => {
            fetchSessions();
          }}
          subjectId={selectedSession.subjectId}
          subjectCode={selectedSession.subject?.code || selectedSession.subjectCode || 'CS501'}
          defaultTopic={selectedSession.topic || 'Normalization & Functional Dependencies'}
          classSessionId={selectedSession.id && !selectedSession.id.startsWith('session-') ? selectedSession.id : undefined}
        />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Same-Day Class Material Publishing
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Publish lecture slides and notes immediately to student dashboards and notifications
          </p>
        </div>

        <button
          onClick={() => handleOpenUpload()}
          className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-sky-600/20 flex items-center gap-2 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" /> Upload Material
        </button>
      </div>

      {/* Today's Teaching Sessions Resource Cards */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-white">Today's Class Sessions</h2>
        {sessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {sessions.map(sess => (
              <div key={sess.id} className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono text-xs font-bold">
                      {sess.subject.code}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {sess.startTime} – {sess.endTime}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-white">{sess.subject.name}</h3>
                  <p className="text-xs font-semibold text-sky-300 mt-1">Topic: {sess.topic}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-slate-400">
                    {sess.classResources?.length || 0} resource(s) published
                  </span>
                  <button
                    onClick={() => handleOpenUpload(sess)}
                    className="px-3.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-md shadow-sky-600/20 flex items-center gap-1.5"
                  >
                    <UploadCloud className="w-3.5 h-3.5" /> Upload Material
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 glass-card rounded-2xl text-center border-dashed border-slate-700">
            <p className="text-xs text-slate-400 mb-3">No sessions found for today.</p>
            <button
              onClick={() => handleOpenUpload()}
              className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg"
            >
              + Upload Material for CS501 (DBMS)
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyResources;
