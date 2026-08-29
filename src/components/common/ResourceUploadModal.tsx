import React, { useState, useEffect } from 'react';
import { X, UploadCloud, FileText, Presentation, Link as LinkIcon, CheckCircle2 } from 'lucide-react';
import api from '../../api/client.js';

interface ResourceUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  subjectId?: string;
  subjectCode?: string;
  defaultTopic?: string;
  classSessionId?: string;
}

export const ResourceUploadModal: React.FC<ResourceUploadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  subjectId: initialSubjectId = '',
  subjectCode: initialSubjectCode = '',
  defaultTopic = '',
  classSessionId,
}) => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState(initialSubjectId);
  const [topic, setTopic] = useState(defaultTopic);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [fileType, setFileType] = useState<'PPT' | 'PDF' | 'DOC' | 'LINK'>('PPT');
  const [fileName, setFileName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    if (isOpen) {
      api.getFacultySubjects().then(res => {
        if (res.success && res.subjects.length > 0) {
          setSubjects(res.subjects);
          const found = res.subjects.find((s: any) => s.id === initialSubjectId || s.code === initialSubjectId || s.code === initialSubjectCode);
          if (found) {
            setSelectedSubjectId(found.id);
          } else if (!selectedSubjectId) {
            setSelectedSubjectId(res.subjects[0].id);
          }
        }
      }).catch(() => {});
    }
  }, [isOpen, initialSubjectId, initialSubjectCode]);

  useEffect(() => {
    if (defaultTopic) setTopic(defaultTopic);
  }, [defaultTopic]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedSubjectId) {
      setErrorMsg('Please select a subject and enter a resource title');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const actualFileName = fileName || `${title.replace(/\s+/g, '_')}.${fileType.toLowerCase() === 'link' ? 'url' : fileType.toLowerCase()}`;
      await api.uploadClassResource({
        subjectId: selectedSubjectId,
        classSessionId,
        topic: topic || 'General Lecture',
        title,
        description,
        fileType,
        fileName: actualFileName,
        fileSize: '3.6 MB',
      });

      setSuccessMsg('Material published! Enrolled students notified.');
      setTimeout(() => {
        onSuccess();
        onClose();
        setSuccessMsg('');
        setTitle('');
        setDescription('');
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload resource');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-lg rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="p-2.5 rounded-xl bg-sky-500/15 text-sky-400 border border-sky-500/20">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Upload Class Material</h3>
            <p className="text-xs text-slate-400">
              Same-day teaching resources published directly to Student's <span className="text-sky-400 font-semibold">Today's Learning</span>
            </p>
          </div>
        </div>

        {successMsg ? (
          <div className="py-8 text-center flex flex-col items-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mb-2 animate-bounce" />
            <p className="text-emerald-300 font-semibold">{successMsg}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
                {errorMsg}
              </div>
            )}

            {subjects.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Course / Subject *</label>
                <select
                  value={selectedSubjectId}
                  onChange={e => setSelectedSubjectId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-800 border border-slate-700 text-white text-xs focus:outline-none focus:border-sky-500 font-medium"
                >
                  {subjects.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.code} — {s.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Topic / Lesson Unit</label>
              <input
                type="text"
                value={topic}
                onChange={e => setTopic(e.target.value)}
                placeholder="e.g. Normalization & Functional Dependencies"
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Resource Title *</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Lecture Slides — Normalization (1NF to BCNF)"
                required
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="grid grid-cols-4 gap-2">
              {(['PPT', 'PDF', 'DOC', 'LINK'] as const).map(type => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFileType(type)}
                  className={`p-2.5 rounded-lg border text-xs font-medium flex flex-col items-center gap-1 transition-all ${
                    fileType === type
                      ? 'bg-sky-500/20 border-sky-500 text-sky-300 shadow-md shadow-sky-500/10'
                      : 'bg-slate-800/50 border-slate-700/70 text-slate-400 hover:text-white'
                  }`}
                >
                  {type === 'PPT' && <Presentation className="w-4 h-4" />}
                  {type === 'PDF' && <FileText className="w-4 h-4" />}
                  {type === 'DOC' && <FileText className="w-4 h-4" />}
                  {type === 'LINK' && <LinkIcon className="w-4 h-4" />}
                  {type}
                </button>
              ))}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Brief Description (Optional)</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                rows={2}
                placeholder="Key highlights or required reading instructions..."
                className="w-full px-3 py-2 rounded-lg bg-slate-800/80 border border-slate-700 text-white text-sm focus:outline-none focus:border-sky-500"
              />
            </div>

            <div className="p-3 rounded-xl border border-dashed border-slate-700 bg-slate-800/40 text-center">
              <UploadCloud className="w-6 h-6 text-slate-400 mx-auto mb-1" />
              <p className="text-xs text-slate-300">
                Ready to attach <span className="text-sky-400 font-mono font-semibold">presentation_slides.{fileType.toLowerCase()}</span>
              </p>
              <p className="text-[10px] text-slate-500 mt-1">Directly syncs to all enrolled students instantly</p>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white text-xs font-bold rounded-lg shadow-lg shadow-sky-600/25 transition-all flex items-center gap-1.5"
              >
                {isSubmitting ? 'Publishing...' : 'Publish Material'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ResourceUploadModal;
