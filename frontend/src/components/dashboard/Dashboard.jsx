import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import CalendarWidget from './CalendarWidget';
import TodaysTasksCard from './TodaysTasksCard';
import { useXP, notifyXPUpdated } from '../../hooks/useXP';
import { api, getStudentId } from '../../lib/api';
import { 
  Bell, 
  Star, 
  AlertTriangle, 
  CheckSquare, 
  Inbox, 
  BookOpen, 
  Globe, 
  Trophy,
  Calendar,
  Users
} from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
  const { xpData } = useXP();
  const navigate = useNavigate();
  const studentId = getStudentId();

  const [roadmap, setRoadmap] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [myCommunities, setMyCommunities] = useState([]);
  const [events, setEvents] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const getFirstName = () => {
    if (user && user.firstName) return user.firstName;
    try {
      const stored = JSON.parse(localStorage.getItem('bridgeup_user') || '{}');
      if (stored.firstName) return stored.firstName;
    } catch (e) {}
    return 'Student';
  };

  const getGraduationText = () => {
    const year = user?.currentYear || 'Year 3';
    if (year === 'Year 4' || year === 'Graduated') {
      return '3 months from graduation — here\'s where you stand today.';
    }
    return `${year} student — here's where you stand today.`;
  };

  useEffect(() => {
    if (!studentId) return;

    // Load Roadmap
    api.getRoadmap(studentId)
      .then(data => {
        if (data && data.steps) setRoadmap(data);
      })
      .catch(() => {});

    // Load Today's Tasks
    api.getTodaysTasks(studentId)
      .then(data => {
        if (Array.isArray(data)) setTasks(data);
      })
      .catch(() => {})
      .finally(() => setLoadingTasks(false));

    // Load Joined Communities
    api.getMyCommunities(studentId)
      .then(data => {
        if (Array.isArray(data)) setMyCommunities(data);
      })
      .catch(() => {});

    // Load Events
    api.listEvents(studentId)
      .then(data => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch(() => {});
  }, [studentId]);

  async function handleCompleteTask(taskId) {
    try {
      const res = await api.completeTask(studentId, taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' } : t));
      notifyXPUpdated();
    } catch (err) {
      console.error('Failed to complete task', err);
    }
  }

  async function handleSkipTask(taskId) {
    try {
      await api.skipTask(studentId, taskId);
      setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'skipped' } : t));
    } catch (err) {
      console.error('Failed to skip task', err);
    }
  }

  const userInitials = () => {
    const name = getFirstName();
    return name[0]?.toUpperCase() || 'S';
  };

  return (
    <div className="flex h-screen bg-[#f1f5f9]/50 overflow-hidden font-sans select-none">
      {/* Left Sidebar Menu */}
      <DashboardSidebar user={user} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        
        {/* Top Header Bar */}
        <header className="w-full bg-white border-b border-slate-100 py-4 px-8 flex items-center justify-between sticky top-0 z-40 shadow-sm select-none">
          {/* Greeting */}
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-slate-800 flex items-center space-x-2">
              <span>Good evening, {getFirstName()}</span>
              <span className="animate-pulse">👋</span>
            </h1>
            <p className="text-slate-400 text-[10px] md:text-xs font-semibold mt-0.5">
              {getGraduationText()}
            </p>
          </div>

          {/* Right Header Badges */}
          <div className="flex items-center space-x-4">
            {/* XP Counter Badge */}
            <div className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-200/50 flex items-center space-x-1.5 shadow-sm">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>{xpData.currentXP.toLocaleString()} XP</span>
            </div>

            {/* Notification Bell */}
            <button 
              onClick={() => navigate('/notifications')}
              className="p-2.5 rounded-full border border-slate-100 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 relative transition-all shadow-sm active:scale-95"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>

            {/* Logout Option */}
            <button 
              onClick={onLogout}
              className="px-3 py-1.5 text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 rounded-lg"
            >
              Log out
            </button>
          </div>
        </header>

        {/* Dashboard Content Grid */}
        <main className="p-6 md:p-8 space-y-6 max-w-7xl w-full mx-auto">
          
          {/* Alert Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/50 text-amber-800 flex items-center space-x-3.5 shadow-sm">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">
              Don't forget to complete today's tasks before midnight to preserve your streak!
            </span>
          </div>

          {/* Main Grid: Center Cards & Right Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Center Widgets Column (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Today's Daily Tasks Widget */}
              <TodaysTasksCard
                tasks={tasks}
                onCompleteTask={handleCompleteTask}
                onSkipTask={handleSkipTask}
              />

              {/* Peer Requests Widget */}
              <div className="bg-white rounded-3xl p-6 border border-rose-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-rose-500 text-white">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400 block">
                        Peer Reviews
                      </span>
                      <h3 className="font-extrabold text-slate-700 text-sm">
                        Verification Queue
                      </h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/verifications')}
                    className="text-xs font-bold text-primary hover:underline"
                  >
                    View Queue →
                  </button>
                </div>
                <div className="p-4 bg-rose-50/30 rounded-2xl border border-rose-100/50 flex items-center justify-between">
                  <p className="text-xs font-semibold text-rose-700">
                    Help fellow students get their project skills verified and earn XP!
                  </p>
                  <button
                    onClick={() => navigate('/verifications')}
                    className="px-3.5 py-1.5 bg-rose-500 text-white text-xs font-bold rounded-xl hover:bg-rose-600 transition-all shrink-0"
                  >
                    Review Skills
                  </button>
                </div>
              </div>

              {/* Active Learning Widget */}
              <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-emerald-500 text-white">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 block">
                        Active Learning
                      </span>
                      <h3 className="font-extrabold text-slate-700 text-sm">
                        Your Personalized Roadmap
                      </h3>
                    </div>
                  </div>
                  <button 
                    onClick={() => navigate('/learning-path')}
                    className="text-xs font-bold text-[#4f46e5] hover:text-indigo-700 transition-colors"
                  >
                    Manage →
                  </button>
                </div>
                
                {roadmap ? (
                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-extrabold text-slate-800">
                        {roadmap.targetRole} Roadmap
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                        Active Skill: {roadmap.steps.find(s => s.status === 'active')?.skillName || 'All modules active'}
                      </p>
                    </div>
                    <button
                      onClick={() => navigate('/learning-path')}
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all"
                    >
                      Resume Path
                    </button>
                  </div>
                ) : (
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center py-6 select-none flex flex-col items-center gap-2">
                    <p className="text-xs font-semibold text-slate-400">
                      You have not generated your learning roadmap yet.
                    </p>
                    <button
                      onClick={() => navigate('/roadmap-builder')}
                      className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all"
                    >
                      Create Roadmap
                    </button>
                  </div>
                )}
              </div>

            </div>

            {/* Right Sidebar Column (lg:col-span-4) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* Calendar & Upcoming Events Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-6">
                {/* Embedded CalendarWidget */}
                <CalendarWidget roadmap={roadmap} />

                {/* Upcoming Events Section */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 block">
                      Upcoming Events
                    </span>
                    <button onClick={() => navigate('/events')} className="text-[10px] font-bold text-primary hover:underline">
                      Explore All
                    </button>
                  </div>
                  
                  {events && events.length > 0 ? (
                    <div className="space-y-3">
                      {events.slice(0, 3).map((evt) => {
                        const evtDate = new Date(evt.eventDate);
                        const dayStr = evtDate.getDate();
                        const monthStr = evtDate.toLocaleString('default', { month: 'short' });
                        return (
                          <div key={evt.id} className="flex items-start space-x-3.5 p-2 bg-slate-50/50 rounded-2xl border border-slate-100/60">
                            <div className="px-2.5 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 flex flex-col items-center justify-center font-bold text-center shrink-0 w-12">
                              <span className="text-xs">{dayStr}</span>
                              <span className="text-[8px] uppercase">{monthStr}</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs text-slate-800 truncate">
                                {evt.title}
                              </h4>
                              <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                                {evt.mode} {evt.location ? `· ${evt.location}` : ''}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-3 bg-slate-50 rounded-2xl text-center">
                      <p className="text-xs text-slate-400 font-semibold">No upcoming events right now.</p>
                    </div>
                  )}
                </div>
              </div>

              {/* My Communities Active Groups Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block">
                      My Communities
                    </span>
                    <h3 className="font-extrabold text-slate-700 text-sm">
                      Active Groups ({myCommunities.length})
                    </h3>
                  </div>
                  <button onClick={() => navigate('/communities')} className="px-3 py-1 text-[10px] font-bold text-primary bg-indigo-50 hover:bg-indigo-100 rounded-full transition-all">
                    Explore →
                  </button>
                </div>

                {myCommunities.length > 0 ? (
                  <div className="space-y-2">
                    {myCommunities.slice(0, 3).map(comm => (
                      <div
                        key={comm.id}
                        onClick={() => navigate(`/communities/${comm.id}`)}
                        className="p-3 bg-slate-50 hover:bg-indigo-50/50 rounded-2xl border border-slate-100 cursor-pointer transition-all flex items-center justify-between"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div className="p-2 bg-indigo-500 text-white rounded-xl text-xs">
                            <Users className="w-3.5 h-3.5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="text-xs font-extrabold text-slate-800 truncate">{comm.name}</h4>
                            <span className="text-[9px] font-bold text-slate-400">{comm.memberCount} members</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100/50 flex items-start space-x-3 select-none">
                    <div className="p-2 rounded-xl bg-primary text-white shrink-0">
                      <Globe className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-indigo-700 leading-snug">
                        You haven't joined any communities yet.
                      </p>
                      <button
                        onClick={() => navigate('/communities')}
                        className="text-[10px] font-bold text-primary hover:underline mt-1 block"
                      >
                        Browse Student Communities →
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* XP Leaderboard Card */}
              <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100 space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 block">
                    This Week
                  </span>
                  <h3 className="font-extrabold text-slate-700 text-sm">
                    Your XP Progress
                  </h3>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-indigo-50/60 to-purple-50/60 border border-indigo-100">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-extrabold text-xs shadow-md shadow-primary/20">
                        {userInitials()}
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-800 text-xs">
                          {getFirstName()} <span className="text-indigo-600 font-semibold">(Level {xpData.level})</span>
                        </h4>
                        <p className="text-[11px] text-emerald-600 font-extrabold mt-0.5">
                          {xpData.currentXP.toLocaleString()} XP
                        </p>
                      </div>
                    </div>
                    <Trophy className="w-5 h-5 text-amber-400 drop-shadow-sm" />
                  </div>
                </div>
              </div>

            </div>

          </div>

        </main>
      </div>

    </div>
  );
}

