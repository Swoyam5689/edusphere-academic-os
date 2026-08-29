import React, { useState, useEffect } from 'react';
import { Building, Layers, Users, BookOpen } from 'lucide-react';
import api from '../../api/client.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';

export const DepartmentManager: React.FC = () => {
  const [campuses, setCampuses] = useState<any[]>([]);
  const [departments, setDepartments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cRes, dRes] = await Promise.all([api.getCampuses(), api.getDepartments()]);
        if (cRes.success) setCampuses(cRes.campuses);
        if (dRes.success) setDepartments(dRes.departments);
      } catch (err) {
        console.error('Failed to load campuses and departments:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) return <LoadingSkeleton rows={5} />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Building className="w-7 h-7 text-sky-400" /> Campuses & Academic Departments
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Institutional structure, affiliated degree programs & enrollment distribution
          </p>
        </div>
      </div>

      {/* Campuses Grid */}
      <div>
        <h2 className="text-base font-bold text-white mb-3">University Campuses ({campuses.length})</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {campuses.map(c => (
            <div key={c.id} className="glass-card rounded-2xl p-5 border border-white/10 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-sky-500/15 text-sky-400">
                    {c.code}
                  </span>
                  <span className="text-[11px] font-mono text-slate-400">Est. {c.establishedYear}</span>
                </div>
                <h3 className="text-base font-bold text-white mt-1">{c.name}</h3>
                <p className="text-xs text-slate-400 mt-1">{c.location}</p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div>
                  Students: <span className="font-bold text-white font-mono">{c._count?.students || 0}</span>
                </div>
                <div>
                  Faculty: <span className="font-bold text-white font-mono">{c._count?.faculty || 0}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Departments Grid */}
      <div>
        <h2 className="text-base font-bold text-white mb-3">Academic Departments ({departments.length})</h2>
        <div className="glass-card rounded-2xl p-6 border-white/10">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-800/70 text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-700">
                <tr>
                  <th className="p-3">Dept Code</th>
                  <th className="p-3">Department Name</th>
                  <th className="p-3">Campus</th>
                  <th className="p-3">Programs</th>
                  <th className="p-3">Students</th>
                  <th className="p-3">Faculty</th>
                  <th className="p-3 text-right">Active Subjects</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {departments.map(d => (
                  <tr key={d.id} className="hover:bg-slate-800/30 transition-all">
                    <td className="p-3 font-mono font-bold text-sky-400">{d.code}</td>
                    <td className="p-3 font-semibold text-white">{d.name}</td>
                    <td className="p-3 text-slate-400">{d.campus?.name}</td>
                    <td className="p-3 font-mono">{d.programs?.length || 1}</td>
                    <td className="p-3 font-mono">{d._count?.students || 0}</td>
                    <td className="p-3 font-mono">{d._count?.faculty || 0}</td>
                    <td className="p-3 font-mono text-right text-sky-400 font-bold">{d._count?.subjects || 0}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DepartmentManager;
