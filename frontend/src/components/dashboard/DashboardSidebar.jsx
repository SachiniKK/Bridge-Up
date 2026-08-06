import React from 'react';
import { 
  Home, 
  Map, 
  Users, 
  Calendar, 
  TrendingUp, 
  Award, 
  Settings, 
  Star 
} from 'lucide-react';

export default function DashboardSidebar({ user }) {
  const getInitials = () => {
    if (!user) return 'KP';
    const first = user.firstName ? user.firstName[0] : '';
    const last = user.lastName ? user.lastName[0] : '';
    return (first + last).toUpperCase() || 'KP';
  };

  const getUserName = () => {
    if (!user) return 'Kavindu P.';
    const first = user.firstName || 'Kavindu';
    const last = user.lastName ? ` ${user.lastName[0]}.` : '';
    return first + last;
  };

  const navigation = [
    {
      title: 'MAIN',
      items: [
        { name: 'Dashboard', icon: Home, active: true },
        { name: 'Learning Path', icon: Map, active: false },
      ],
    },
    {
      title: 'DISCOVER',
      items: [
        { name: 'Communities', icon: Users, active: false },
        { name: 'Events & Meetups', icon: Calendar, active: false },
        { name: 'Employer Demand', icon: TrendingUp, active: false },
      ],
    },
    {
      title: 'PROFILE',
      items: [
        { name: 'Skill Passport', icon: Award, active: false },
        { name: 'Settings', icon: Settings, active: false },
      ],
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-100 flex flex-col justify-between p-6 select-none h-full shadow-sm">
      
      <div className="space-y-8">
        {/* Brand Logo */}
        <div className="flex items-center space-x-1.5 select-none px-2">
          <span className="text-xl font-extrabold tracking-tight text-[#1e1b4b]">
            Skill<span className="text-primary">Bridge</span>
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1"></span>
        </div>

        {/* Menu Navigation sections */}
        <nav className="space-y-6">
          {navigation.map((section) => (
            <div key={section.title} className="space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400/80 px-2 block">
                {section.title}
              </span>
              <ul className="space-y-1">
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <button
                        className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                          item.active
                            ? 'bg-indigo-50/70 text-primary border border-indigo-100/50'
                            : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50 border border-transparent'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${item.active ? 'text-primary' : 'text-slate-400'}`} />
                        <span>{item.name}</span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      {/* User profile footer card */}
      <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100/30 flex items-center space-x-3 shadow-sm select-none">
        <div className="w-10 h-10 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-sm shadow border border-purple-400/25">
          {getInitials()}
        </div>
        <div className="flex-1 overflow-hidden">
          <h4 className="font-bold text-slate-700 text-xs tracking-tight truncate">
            {getUserName()}
          </h4>
          <span className="text-[10px] font-bold text-emerald-600 flex items-center space-x-1 mt-0.5">
            <Star className="w-3 h-3 text-emerald-500 fill-emerald-500" />
            <span>1,240 XP</span>
          </span>
        </div>
      </div>

    </aside>
  );
}
