import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { Shield, Users, Calendar, Award, LogOut, Activity, Loader2 } from 'lucide-react';

export default function AdminDashboard() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    studentsCount: 242,
    employersCount: 18,
    eventsCount: 9,
    verificationsCount: 47
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard/profile');
      return;
    }
    // Simulate API delay
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-[#1e1b4b] py-6 px-8 flex justify-between items-center text-white shadow-md">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-indigo-500 rounded-xl">
            <Shield className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="text-[9px] font-black text-indigo-300 uppercase tracking-wider bg-indigo-950 px-2 py-0.5 rounded">
              ★ SYSTEM ADMIN
            </span>
            <h1 className="text-xl font-black mt-0.5">BridgeUp Admin Console</h1>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1.5 px-3 py-1.5 border border-indigo-400/30 hover:bg-indigo-900 text-slate-200 rounded-xl text-xs font-bold transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-6xl w-full mx-auto space-y-8">
        
        {/* Metric cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { label: 'Active Students', val: stats.studentsCount, icon: Users, color: 'bg-indigo-50 text-primary' },
            { label: 'Registered Employers', val: stats.employersCount, icon: Activity, color: 'bg-emerald-50 text-emerald-600' },
            { label: 'Total Events Scheduled', val: stats.eventsCount, icon: Calendar, color: 'bg-amber-50 text-amber-500' },
            { label: 'Verified Peer Claims', val: stats.verificationsCount, icon: Award, color: 'bg-indigo-50 text-primary' }
          ].map(m => {
            const Icon = m.icon;
            return (
              <div key={m.label} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{m.label}</span>
                  <h3 className="text-3xl font-black text-slate-800 mt-1">{m.val}</h3>
                </div>
                <div className={`p-3.5 rounded-2xl ${m.color}`}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            );
          })}
        </div>

        {/* Console layout */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Action links */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">System Activities</h3>
            
            <div className="border border-slate-100 rounded-2xl overflow-hidden divide-y divide-slate-100 text-xs">
              <div className="p-4 flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-slate-800">Sysco LABS</span>
                  <span className="text-slate-400"> updated their skill requirement signal</span>
                </div>
                <span className="text-[10px] text-slate-400">2 min ago</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-slate-800">Tharusha</span>
                  <span className="text-slate-400"> passed REST APIs assessment quiz</span>
                </div>
                <span className="text-[10px] text-slate-400">15 min ago</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                <div>
                  <span className="font-extrabold text-slate-800">WSO2</span>
                  <span className="text-slate-400"> registered a new physical recruitment event</span>
                </div>
                <span className="text-[10px] text-slate-400">1 hr ago</span>
              </div>
            </div>
          </div>

          {/* Quick Config */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider">Quick Config</h3>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              Admin options to mock cron schedules or trigger batch cleanups.
            </p>

            <div className="space-y-3 pt-2">
              <button
                onClick={() => alert('Mock evaluated student streaks!')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Mock Run Streaks Evaluator
              </button>
              <button
                onClick={() => alert('Triggered mock notification alert evaluation')}
                className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all"
              >
                Mock Daily Reminders Evaluation
              </button>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
}
