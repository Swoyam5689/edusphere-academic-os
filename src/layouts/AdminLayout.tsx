import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Building,
  GraduationCap,
  Layers,
  Activity,
  AlertTriangle,
  Lightbulb,
  Search,
  FileSpreadsheet,
  LogOut,
  Sparkles,
  BookOpen,
  Calendar,
  Compass,
  Briefcase,
  LayoutDashboard,
  FileText,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';
import GlobalSearchModal from '../components/common/GlobalSearchModal.js';

export const AdminLayout: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const navigate = useNavigate();

  const isFaculty = user?.role === 'FACULTY';
  const isAdvisor = user?.role === 'ADVISOR';

  const adminNav = [
    { to: '/admin/command-center', label: 'Command Center', icon: ShieldAlert },
    { to: '/admin/analytics/drilldown', label: 'Attendance Analytics', icon: Activity },
    { to: '/admin/at-risk', label: 'At-Risk Students', icon: AlertTriangle, badge: 'Active' },
    { to: '/admin/workload', label: 'Faculty Workload', icon: Briefcase },
    { to: '/admin/insights', label: 'Institutional Insights', icon: Lightbulb },
    { to: '/admin/students', label: 'Students Directory', icon: Users },
    { to: '/admin/campuses', label: 'Campuses & Depts', icon: Building },
    { to: '/admin/reports', label: 'Reports & Export', icon: FileSpreadsheet },
  ];

  const advisorNav = [
    { to: '/faculty/dashboard', label: 'Advisor Dashboard', icon: LayoutDashboard },
    { to: '/admin/at-risk', label: 'At-Risk Advisees', icon: AlertTriangle, badge: '45' },
    { to: '/faculty/attendance', label: 'Mark Attendance', icon: Activity },
    { to: '/faculty/resources', label: 'Class Material Upload', icon: BookOpen },
    { to: '/faculty/assignments', label: 'Assignments & Grading', icon: FileText },
    { to: '/admin/students', label: 'Student Directory', icon: Users },
    { to: '/faculty/workload', label: 'Workload & Capacity', icon: Briefcase },
    { to: '/admin/command-center', label: 'University Command Center', icon: Building },
  ];

  const facultyNav = [
    { to: '/faculty/dashboard', label: 'Faculty Dashboard', icon: LayoutDashboard },
    { to: '/faculty/attendance', label: 'Mark Attendance', icon: Activity },
    { to: '/faculty/resources', label: 'Class Material Upload', icon: BookOpen, badge: 'Today' },
    { to: '/faculty/assignments', label: 'Assignments & Grading', icon: FileText },
    { to: '/faculty/workload', label: 'My Workload', icon: Briefcase },
    { to: '/admin/command-center', label: 'University Command Center', icon: Building },
  ];

  const currentNav = isAdvisor ? advisorNav : isFaculty ? facultyNav : adminNav;

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex">
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />

      {/* Sidebar */}
      <aside className="w-64 border-r border-slate-800/80 bg-slate-900/85 backdrop-blur-xl flex flex-col shrink-0 sticky top-0 h-screen z-40">
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-extrabold text-lg shadow-xl shadow-sky-500/25">
              E
            </div>
            <div>
              <div className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                EduSphere
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-amber-500/20 text-amber-400 rounded border border-amber-500/30">
                  {user?.role === 'CHAIRMAN' ? 'CHAIRMAN' : user?.role === 'FACULTY' ? 'FACULTY' : 'ADMIN'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono tracking-wider">COMMAND PLATFORM</p>
            </div>
          </div>
        </div>

        {/* Global Search Trigger Bar */}
        <div className="px-3 pt-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-800/60 hover:bg-slate-800 border border-white/5 text-xs text-slate-400 transition-all"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-sky-400" />
              <span>Search repository...</span>
            </div>
            <kbd className="px-1.5 py-0.5 text-[9px] bg-slate-700/60 rounded text-slate-300 font-mono">⌘K</kbd>
          </button>
        </div>

        {/* User Card */}
        <div className="p-3 mx-3 my-3 rounded-xl bg-slate-800/40 border border-white/5 flex items-center gap-3">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100'}
            alt="User Avatar"
            className="w-10 h-10 rounded-full object-cover border border-amber-500/30"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">{user?.name || 'Institutional Admin'}</div>
            <div className="text-[10px] text-slate-400 font-mono">{user?.role || 'UNIVERSITY_ADMIN'}</div>
          </div>
        </div>

        {/* Nav Links */}
        <nav className="flex-1 px-3 py-1 space-y-1 overflow-y-auto">
          {currentNav.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-sky-500/15 text-sky-400 border border-sky-500/30 shadow-md shadow-sky-500/10'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-amber-500/20 text-amber-300">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {/* Demo Role Switcher Quick Actions */}
        <div className="p-3 border-t border-slate-800 bg-slate-900/60">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1">
            <Compass className="w-3 h-3 text-sky-400" /> Switch Demo Role
          </div>
          <div className="grid grid-cols-3 gap-1">
            <button
              onClick={async () => {
                const target = await demoLogin('student');
                navigate(target);
              }}
              className="px-2 py-1 bg-slate-800/80 hover:bg-emerald-900/40 text-emerald-300 rounded text-[10px] font-medium border border-emerald-500/20 text-center"
            >
              Student
            </button>
            <button
              onClick={async () => {
                const target = await demoLogin('faculty');
                navigate(target);
              }}
              className="px-2 py-1 bg-slate-800/80 hover:bg-purple-900/40 text-purple-300 rounded text-[10px] font-medium border border-purple-500/20 text-center"
            >
              Faculty
            </button>
            <button
              onClick={async () => {
                const target = await demoLogin('chairman');
                navigate(target);
              }}
              className="px-2 py-1 bg-slate-800/80 hover:bg-amber-900/40 text-amber-300 rounded text-[10px] font-medium border border-amber-500/20 text-center"
            >
              Chairman
            </button>
          </div>
          <button
            onClick={handleLogout}
            className="w-full mt-3 flex items-center justify-center gap-2 px-3 py-2 bg-slate-800/60 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg text-xs font-semibold border border-white/5 transition-all"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-x-hidden min-h-screen">
        <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
