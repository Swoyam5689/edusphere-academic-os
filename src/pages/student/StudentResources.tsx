import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Download,
  Presentation,
  FileText,
  Link as LinkIcon,
  Calendar,
  Sparkles,
  Filter,
  X,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';
import api from '../../api/client.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';
import EmptyState from '../../components/common/EmptyState.js';
import { ClassResourceItem } from '../../types/index.js';

export const StudentResources: React.FC = () => {
  const [resources, setResources] = useState<ClassResourceItem[]>([]);
  const [groupedByDate, setGroupedByDate] = useState<Record<string, ClassResourceItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('ALL');
  const [selectedType, setSelectedType] = useState('ALL');
  const [activePreview, setActivePreview] = useState<ClassResourceItem | null>(null);

  const fetchResources = async () => {
    try {
      const res = await api.getStudentResources(
        selectedSubject !== 'ALL' ? selectedSubject : undefined,
        searchQuery || undefined
      );
      if (res.success) {
        setResources(res.resources);
        setGroupedByDate(res.groupedByDate);
      }
    } catch (err) {
      console.error('Failed to load resources:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [selectedSubject, searchQuery]);

  const filteredDates = Object.keys(groupedByDate).filter(date => {
    const items = groupedByDate[date];
    if (selectedType === 'ALL') return true;
    return items.some(i => i.fileType === selectedType);
  });

  const getIconForType = (type: string) => {
    switch (type) {
      case 'PPT':
        return <Presentation className="w-5 h-5 text-amber-400" />;
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-400" />;
      case 'LINK':
        return <LinkIcon className="w-5 h-5 text-sky-400" />;
      default:
        return <FileText className="w-5 h-5 text-blue-400" />;
    }
  };

  const handleDownload = (res: ClassResourceItem) => {
    const element = document.createElement('a');
    const file = new Blob(
      [
        `=====================================================\n` +
          `EDUSPHERE ACADEMIC OS — VERIFIED COURSE MATERIAL\n` +
          `=====================================================\n` +
          `Course: ${res.subject?.code || 'CS501'} (${res.subject?.name || 'Database Management Systems'})\n` +
          `Topic: ${res.topic}\n` +
          `Title: ${res.title}\n` +
          `Instructor: ${res.faculty?.user.name || 'Dr. Rajesh Sharma'}\n` +
          `Published Date: ${res.uploadDate}\n\n` +
          `Description / Notes:\n` +
          `${res.description || 'Comprehensive lecture notes and slides covering core conceptual foundations.'}\n\n` +
          `[End of Document]`
      ],
      { type: 'text/plain' }
    );
    element.href = URL.createObjectURL(file);
    element.download = res.fileName || `${res.title.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <div className="space-y-6">
      {/* Resource Preview Modal */}
      {activePreview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card w-full max-w-2xl rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95 space-y-4">
            <button
              onClick={() => setActivePreview(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="p-3 bg-sky-500/15 rounded-xl text-sky-400 border border-sky-500/20">
                {getIconForType(activePreview.fileType)}
              </div>
              <div>
                <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono text-[10px] font-bold">
                  {activePreview.subject?.code} • {activePreview.fileType}
                </span>
                <h3 className="text-lg font-bold text-white mt-0.5">{activePreview.title}</h3>
                <p className="text-xs text-slate-400">Published by {activePreview.faculty?.user.name} on {activePreview.uploadDate}</p>
              </div>
            </div>

            {/* Document Content Simulation */}
            <div className="p-5 rounded-xl bg-slate-950/80 border border-white/5 font-mono text-xs text-slate-300 space-y-3 leading-relaxed">
              <div className="text-sky-400 font-bold border-b border-slate-800 pb-2">
                Topic: {activePreview.topic}
              </div>
              <p>
                {activePreview.description ||
                  'Complete lecture notes and diagrammatic illustrations presented in class. Includes functional dependency closures, candidate key derivation, and BCNF lossless join proof.'}
              </p>
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 text-[11px] text-slate-400 space-y-1">
                <div>• Verified Course Material: <span className="text-emerald-400">Yes (Faculty Verified)</span></div>
                <div>• File Attachment: <span className="text-white">{activePreview.fileName}</span></div>
                <div>• File Size: <span className="text-white">{activePreview.fileSize || '3.2 MB'}</span></div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setActivePreview(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-lg"
              >
                Close
              </button>
              <button
                onClick={() => handleDownload(activePreview)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-sky-600/20 flex items-center gap-1.5"
              >
                <Download className="w-3.5 h-3.5" /> Download File
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-sky-400" /> Class Resources & Today's Learning
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Chronological lecture slides, notes & references published by faculty
          </p>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-2xl p-4 flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search by topic, keyword or title... (e.g. Normalization, BCNF, TCP)"
            className="w-full pl-9 pr-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedType}
            onChange={e => setSelectedType(e.target.value)}
            className="px-3 py-2 bg-slate-800/80 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-sky-500"
          >
            <option value="ALL">All File Types</option>
            <option value="PPT">Presentations (PPT)</option>
            <option value="PDF">Documents (PDF)</option>
            <option value="LINK">External Links</option>
          </select>
        </div>
      </div>

      {/* Chronological Resource Groups */}
      {isLoading ? (
        <LoadingSkeleton rows={5} />
      ) : filteredDates.length === 0 ? (
        <EmptyState
          title="No Class Resources Found"
          description="No lecture notes or slides match your current search and filters."
        />
      ) : (
        <div className="space-y-6">
          {filteredDates.map(date => {
            const isTodayDate = date === new Date().toISOString().split('T')[0];
            const items = groupedByDate[date].filter(
              item => selectedType === 'ALL' || item.fileType === selectedType
            );

            if (items.length === 0) return null;

            return (
              <div key={date} className="space-y-3">
                {/* Date Header Pill */}
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold font-mono ${
                      isTodayDate
                        ? 'bg-sky-500 text-white shadow-lg shadow-sky-500/25'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    {isTodayDate ? `TODAY — ${date}` : date}
                  </div>
                  <div className="h-px bg-slate-800 flex-1"></div>
                </div>

                {/* Items Grid for this Date */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map(res => (
                    <div
                      key={res.id}
                      className="glass-card rounded-xl p-4 border border-white/5 hover:border-sky-500/30 transition-all flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 font-mono text-[10px] font-bold">
                            {res.subject?.code || 'CS501'}
                          </span>
                          <span className="text-[10px] text-slate-400">{res.fileSize || '2.4 MB'}</span>
                        </div>
                        <h4 className="text-sm font-bold text-white leading-snug">{res.title}</h4>
                        <p className="text-xs text-sky-300/80 font-medium mt-1">Topic: {res.topic}</p>
                        {res.description && (
                          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{res.description}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {getIconForType(res.fileType)}
                          <span className="text-xs text-slate-300">{res.faculty?.user.name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setActivePreview(res)}
                            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700"
                          >
                            Preview
                          </button>
                          <button
                            onClick={() => handleDownload(res)}
                            className="px-3 py-1.5 rounded-lg bg-sky-600/20 hover:bg-sky-600/30 text-sky-300 text-xs font-semibold border border-sky-500/30 flex items-center gap-1.5 transition-all"
                          >
                            <Download className="w-3.5 h-3.5" /> Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default StudentResources;
