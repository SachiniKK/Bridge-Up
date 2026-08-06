import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Users,
  CalendarDays,
  Briefcase,
  Award,
  Settings
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/learning-path', label: 'Learning Path', icon: BookOpen },
  { to: '/communities', label: 'Communities', icon: Users },
  { to: '/events', label: 'Events & Meetups', icon: CalendarDays },
  { to: '/employer-demand', label: 'Employer Demand', icon: Briefcase },
  { to: '/skill-passport', label: 'Skill Passport', icon: Award },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppShell() {
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-30">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-slate-800/50">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            BridgeUp
          </h1>
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-slate-800 text-blue-400 shadow-sm'
                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                }`
              }
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/50">
          <p className="text-[10px] text-slate-600 text-center font-medium uppercase tracking-widest">
            BridgeUp &copy; {new Date().getFullYear()}
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 bg-slate-50 min-h-screen overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
