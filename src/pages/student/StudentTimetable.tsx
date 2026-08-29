import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, BookOpen } from 'lucide-react';
import api from '../../api/client.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';

export const StudentTimetable: React.FC = () => {
  const [slots, setSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState('ALL');
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  useEffect(() => {
    const fetchTimetable = async () => {
      try {
        const res = await api.getStudentTimetable();
        if (res.success) {
          setSlots(res.timetable);
        }
      } catch (err) {
        console.error('Failed to load timetable:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  if (isLoading) return <LoadingSkeleton rows={5} />;

  const filteredDays = selectedDay === 'ALL' ? daysOfWeek : [selectedDay];

  return (
    <div className="space-y-6">
      {/* Lecture Slot Modal */}
      {selectedSlot && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="glass-card w-full max-w-md rounded-2xl p-6 relative border border-white/10 shadow-2xl bg-slate-900/95 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono bg-sky-500/20 text-sky-300">
                  {selectedSlot.dayOfWeek} • {selectedSlot.startTime} - {selectedSlot.endTime}
                </span>
                <h3 className="text-lg font-bold text-white mt-1">{selectedSlot.subject.name}</h3>
                <p className="text-xs font-mono text-sky-400">{selectedSlot.subject.code} • {selectedSlot.subject.credits || 4} Credits</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/70 border border-white/5 space-y-2.5 text-xs text-slate-300">
              <div className="flex justify-between">
                <span className="text-slate-400">Course Instructor:</span>
                <span className="font-semibold text-white">{selectedSlot.faculty.user.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Venue Room:</span>
                <span className="font-mono font-bold text-sky-400 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5" /> {selectedSlot.roomNo}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Class Section:</span>
                <span className="font-semibold text-white">Section {selectedSlot.section || 'A'}</span>
              </div>
            </div>

            <div className="p-3 bg-slate-800/60 rounded-xl border border-white/5 text-[11px] text-slate-300 space-y-1">
              <span className="font-bold text-slate-200 block">Syllabus Overview:</span>
              <p className="text-slate-400">{selectedSlot.subject.syllabus || 'Core conceptual modules, weekly lab practice, and continuous assessment.'}</p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setSelectedSlot(null)}
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
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">Weekly Class Timetable</h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Section A • Academic Year 2025–2026 • Semester 5 (Click any slot to view instructor & syllabus details)
          </p>
        </div>

        {/* Day Filter Buttons */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          <button
            onClick={() => setSelectedDay('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              selectedDay === 'ALL'
                ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            All Days
          </button>
          {daysOfWeek.map(day => (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedDay === day
                  ? 'bg-sky-500 text-white shadow-md shadow-sky-500/20'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {day.slice(0, 3)}
            </button>
          ))}
        </div>
      </div>

      {/* Timetable Grid */}
      <div className="space-y-6">
        {filteredDays.map(day => {
          const daySlots = slots.filter(s => s.dayOfWeek.toLowerCase() === day.toLowerCase());

          return (
            <div key={day} className="glass-card rounded-2xl p-5 border border-white/5">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-400" /> {day}
                </h3>
                <span className="text-xs text-slate-400 font-mono">{daySlots.length} lecture slots</span>
              </div>

              {daySlots.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {daySlots.map(slot => (
                    <div
                      key={slot.id}
                      onClick={() => setSelectedSlot(slot)}
                      className="p-4 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-white/5 hover:border-sky-500/40 transition-all flex flex-col justify-between cursor-pointer group"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="px-2 py-0.5 rounded bg-sky-500/10 text-sky-300 font-mono text-[10px] font-bold">
                            {slot.subject.code}
                          </span>
                          <span className="flex items-center gap-1 text-[11px] text-slate-300 font-mono">
                            <Clock className="w-3 h-3 text-slate-400" />
                            {slot.startTime} – {slot.endTime}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
                          {slot.subject.name}
                        </h4>
                      </div>

                      <div className="mt-4 pt-2.5 border-t border-slate-700/60 flex items-center justify-between text-xs text-slate-400">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5 text-slate-400" /> {slot.faculty.user.name}
                        </span>
                        <span className="flex items-center gap-1 font-mono text-slate-300">
                          <MapPin className="w-3.5 h-3.5 text-sky-400" /> {slot.roomNo}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 py-3 text-center">No scheduled lectures on {day}.</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentTimetable;
