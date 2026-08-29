import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  CalendarCheck,
  GraduationCap,
  Calendar,
  BookOpen,
  FileText,
  Award,
  Bell,
  User,
  LogOut,
  Sparkles,
  Menu,
  X,
  Compass,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const StudentLayout: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const navItems = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/attendance', label: 'Attendance', icon: CalendarCheck },
    { to: '/student/performance', label: 'Marks & CGPA', icon: GraduationCap },
    { to: '/student/resources', label: "Today's Learning", icon: BookOpen, badge: 'Active' },
    { to: '/student/timetable', label: 'Timetable', icon: Calendar },
    { to: '/student/assignments', label: 'Assignments', icon: FileText },
    { to: '/student/exams', label: 'Exams & Seating', icon: Award },
    { to: '/student/profile', label: 'My Profile', icon: User },
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#0a0d14] text-slate-100 flex flex-col md:flex-row">
      {/* Mobile Top Header */}
      <header className="md:hidden flex items-center justify-between p-4 border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-base shadow-lg shadow-sky-500/20">
            E
          </div>
          <span className="font-bold text-base tracking-tight bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
            EduSphere
          </span>
        </div>
        <div className="flex items-center gap-2">
          <NavLink
            to="/student/resources"
            className="p-2 rounded-lg bg-sky-500/10 text-sky-400 border border-sky-500/20 relative"
          >
            <Sparkles className="w-4 h-4" />
          </NavLink>
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800"
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed md:sticky top-0 h-screen w-64 border-r border-slate-800/80 bg-slate-900/80 backdrop-blur-xl flex flex-col z-50 transition-transform duration-300 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        {/* Brand Logo */}
        <div className="p-5 border-b border-slate-800/80 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-500 to-cyan-400 flex items-center justify-center text-white font-extrabold text-lg shadow-xl shadow-sky-500/25">
              E
            </div>
            <div>
              <div className="font-bold text-base leading-tight tracking-tight text-white flex items-center gap-1.5">
                EduSphere
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.2 bg-sky-500/20 text-sky-400 rounded border border-sky-500/30">
                  OS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-wide font-mono">STUDENT PORTAL</p>
            </div>
          </div>
        </div>

        {/* User Card */}
        <div className="p-3 mx-3 my-3 rounded-xl bg-slate-800/40 border border-white/5 flex items-center gap-3">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=100'}
            alt="Student Avatar"
            className="w-10 h-10 rounded-full object-cover border border-sky-500/30"
          />
          <div className="min-w-0 flex-1">
            <div className="text-xs font-bold text-white truncate">{user?.name || 'Rahul Sharma'}</div>
            <div className="text-[10px] text-slate-400 font-mono">B.Tech CSE • Sec A</div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setIsMobileMenuOpen(false)}
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
                  <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-full bg-sky-500/20 text-sky-300 animate-pulse">
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
                const target = await demoLogin('faculty');
                navigate(target);
              }}
              className="px-2 py-1 bg-slate-800/80 hover:bg-purple-900/40 text-purple-300 rounded text-[10px] font-medium border border-purple-500/20 text-center"
            >
              Faculty
            </button>
            <button
              onClick={async () => {
                const target = await demoLogin('admin');
                navigate(target);
              }}
              className="px-2 py-1 bg-slate-800/80 hover:bg-sky-900/40 text-sky-300 rounded text-[10px] font-medium border border-sky-500/20 text-center"
            >
              Admin
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

export default StudentLayout;
