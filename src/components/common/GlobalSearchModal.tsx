import React, { useState, useEffect } from 'react';
import { Search, X, User, BookOpen, Building2, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../api/client.js';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    students: any[];
    faculty: any[];
    subjects: any[];
    departments: any[];
  }>({ students: [], faculty: [], subjects: [], departments: [] });
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!query || query.length < 2) {
      setResults({ students: [], faculty: [], subjects: [], departments: [] });
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.globalSearch(query);
        if (res.success && res.results) {
          setResults(res.results);
        }
      } catch (e) {
        // Ignore
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (link: string) => {
    onClose();
    navigate(link);
  };

  const hasAnyResults =
    results.students.length > 0 ||
    results.faculty.length > 0 ||
    results.subjects.length > 0 ||
    results.departments.length > 0;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-sm">
      <div className="glass-card w-full max-w-2xl rounded-2xl border border-white/10 shadow-2xl bg-slate-900/95 overflow-hidden">
        <div className="flex items-center px-4 border-b border-slate-800">
          <Search className="w-5 h-5 text-slate-400" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search students, faculty, courses, departments... (e.g. Rahul, CS501, Sharma)"
            className="w-full px-3 py-4 bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none"
          />
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-white/5"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {isLoading && (
            <p className="text-center py-6 text-xs text-slate-400">Searching institutional records...</p>
          )}

          {!isLoading && query.length >= 2 && !hasAnyResults && (
            <p className="text-center py-6 text-xs text-slate-400">No matching records found for "{query}"</p>
          )}

          {results.students.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                Students
              </span>
              <div className="space-y-1.5">
                {results.students.map(s => (
                  <div
                    key={s.id}
                    onClick={() => handleSelect(s.link)}
                    className="p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-white/5 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{s.title}</div>
                        <div className="text-[10px] text-slate-400">{s.subtitle}</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.faculty.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                Faculty
              </span>
              <div className="space-y-1.5">
                {results.faculty.map(f => (
                  <div
                    key={f.id}
                    onClick={() => handleSelect(f.link)}
                    className="p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-white/5 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                        <User className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{f.title}</div>
                        <div className="text-[10px] text-slate-400">{f.subtitle}</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}

          {results.subjects.length > 0 && (
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 block">
                Courses & Subjects
              </span>
              <div className="space-y-1.5">
                {results.subjects.map(sub => (
                  <div
                    key={sub.id}
                    onClick={() => handleSelect(sub.link)}
                    className="p-2.5 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-white/5 flex items-center justify-between cursor-pointer transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                        <BookOpen className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-semibold text-white">{sub.title}</div>
                        <div className="text-[10px] text-slate-400">{sub.subtitle}</div>
                      </div>
                    </div>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GlobalSearchModal;
