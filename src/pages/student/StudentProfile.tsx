import React, { useState, useEffect } from 'react';
import { User, Award, FileText, CreditCard, Building, Mail, Phone, Calendar, ShieldCheck, Download } from 'lucide-react';
import api from '../../api/client.js';
import LoadingSkeleton from '../../components/common/LoadingSkeleton.js';

export const StudentProfile: React.FC = () => {
  const [profile, setProfile] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.getStudentProfile();
        if (res.success) {
          setProfile(res.profile);
        }
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading || !profile) return <LoadingSkeleton rows={6} />;

  return (
    <div className="space-y-6">
      {/* Profile Header Card */}
      <div className="glass-card rounded-2xl p-6 border border-white/10 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/40">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          <img
            src={profile.user.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150'}
            alt="Student Avatar"
            className="w-24 h-24 rounded-2xl object-cover border-2 border-sky-500/40 shadow-xl"
          />
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h1 className="text-2xl font-extrabold text-white">{profile.user.name}</h1>
                <p className="text-xs font-mono text-sky-400 font-semibold">{profile.studentRollNo}</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 self-center sm:self-auto">
                Placement Status: {profile.placementStatus}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <span>{profile.user.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <span>{profile.user.phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-slate-400" />
                <span>{profile.campus.name}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Academic Credentials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Academic Details */}
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <Building className="w-4 h-4 text-sky-400" /> Academic Enrolment
          </h3>
          <div className="space-y-2 text-xs divide-y divide-slate-800">
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Department</span>
              <span className="font-semibold text-white">{profile.department.name}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Degree Program</span>
              <span className="font-semibold text-white">{profile.program.name}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Academic Year / Semester</span>
              <span className="font-semibold text-white">Year {profile.currentYear} • Semester {profile.currentSemester}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Section Allocation</span>
              <span className="font-semibold text-white">Section {profile.section}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Admission Year</span>
              <span className="font-semibold text-white">{profile.admissionYear}</span>
            </div>
            <div className="flex justify-between pt-2">
              <span className="text-slate-400">Assigned Faculty Advisor</span>
              <span className="font-semibold text-sky-400">{profile.advisor?.user.name || 'Prof. S. Verma'}</span>
            </div>
          </div>
        </div>

        {/* Fee Payment History */}
        <div className="glass-card rounded-2xl p-6 space-y-3">
          <h3 className="text-base font-bold text-white mb-2 flex items-center gap-2">
            <CreditCard className="w-4 h-4 text-emerald-400" /> Academic Fee Status
          </h3>
          {profile.feeRecords.length > 0 ? (
            <div className="space-y-2.5">
              {profile.feeRecords.map((f: any) => (
                <div key={f.id} className="p-3 bg-slate-800/40 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-white">Semester {f.semester} Tuition Fee</div>
                    <div className="text-[10px] text-slate-400">Total: ₹{f.totalAmount.toLocaleString()}</div>
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    f.status === 'PAID' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                  }`}>
                    {f.status}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No active fee balance records.</p>
          )}
        </div>
      </div>

      {/* Achievements & Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Achievements */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" /> Verified Achievements & Certifications
          </h3>
          <div className="space-y-2.5">
            {profile.achievements.map((ach: any) => (
              <div key={ach.id} className="p-3 bg-slate-800/40 rounded-xl border border-white/5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-white">{ach.title}</span>
                  <span className="text-[10px] font-mono text-slate-400">{ach.date}</span>
                </div>
                <p className="text-slate-400 mt-1">{ach.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Documents */}
        <div className="glass-card rounded-2xl p-6">
          <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-sky-400" /> Official Academic Documents
          </h3>
          <div className="space-y-2.5">
            {profile.documents.map((doc: any) => (
              <div key={doc.id} className="p-3 bg-slate-800/40 rounded-xl border border-white/5 flex items-center justify-between text-xs">
                <div>
                  <div className="font-semibold text-white">{doc.title}</div>
                  <div className="text-[10px] text-slate-400 font-mono">{doc.documentType} • {doc.fileSize}</div>
                </div>
                <button
                  onClick={() => alert(`Downloading verified document: ${doc.title}`)}
                  className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 border border-slate-700"
                >
                  <Download className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentProfile;
