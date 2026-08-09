import React from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardSidebar from './DashboardSidebar';
import CalendarWidget from './CalendarWidget';
import { 
  Bell, 
  Star, 
  AlertTriangle, 
  CheckSquare, 
  Inbox, 
  BookOpen, 
  Globe, 
  Trophy 
} from 'lucide-react';

export default function Dashboard({ user, onLogout }) {
  const getFirstName = () => {
    if (!user) return 'Kavindu';
    return user.firstName || 'Kavindu';
  };

  const getGraduationText = () => {
    if (!user) return '3 months from graduation — here\'s where you stand today.';
    const year = user.currentYear || 'Year 3';
    if (year === 'Year 4' || year === 'Graduated') {
      return '3 months from graduation — here\'s where you stand today.';
    }
    return `${year} student — here's where you stand today.`;
  };

  const upcomingEvents = [
    {
      day: '29',
      month: 'Mar',
      title: 'Backend Community Check-in',
      details: '18 members · 6:00 PM',
      colorClass: 'bg-indigo-50 text-indigo-700'
    },
    {
      day: 'Apr 5',
      month: '',
      title: 'Sysco Labs Industry Visit',
      details: 'Register by Apr 1',
      colorClass: 'bg-cyan-50 text-cyan-700'
    }
  ];

  const [roadmap, setRoadmap] = React.useState(null);
  const navigate = useNavigate();

  React.useEffect(() => {
    const studentId = localStorage.getItem('bridgeup_student_id');
    const token = localStorage.getItem('bridgeup_token');
    if (studentId && token) {
      fetch(`http://localhost:5000/api/students/${studentId}/roadmap`, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
      .then(res => res.json())
      .then(data => {
        if (data && data.steps) {
          setRoadmap(data);
        }
      })
      .catch(() => {});
    }
  }, []);

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
              <span>1,240 XP</span>
            </div>

            {/* Notification Bell */}
            <button 
              onClick={() => navigate('/notifications')}
              className="p-2.5 rounded-full border border-slate-100 bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 relative transition-all shadow-sm active:scale-95"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white"></span>
            </button>

            {/* Logout Option (Convenience) */}
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
          
          {/* Yellow Warning Alert Banner */}
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200/50 text-amber-800 flex items-center space-x-3.5 shadow-sm">
            <div className="p-2 rounded-xl bg-amber-500 text-white">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <span className="text-xs font-bold">
              Don't forget to complete today's tasks before midnight!
            </span>
          </div>

          {/* Main Grid: Center Cards & Right Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Center Widgets Column (lg:col-span-8) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Today's Tasks Widget */}
              <div className="bg-white rounded-3xl p-6 border border-amber-300 shadow-md space-y-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-xl bg-emerald-500 text-white">
                    <CheckSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 block">
                      Today's Tasks
                    </span>
                    <h3 className="font-extrabold text-slate-700 text-sm">
                      Complete to keep your XP
                    </h3>
                  </div>
                </div>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-center py-6 select-none">
                  <p className="text-xs font-semibold text-slate-400">
                    No tasks yet. Start a course to view tasks.
                  </p>
                </div>
              </div>

              {/* Peer Requests Widget */}
              <div className="bg-white rounded-3xl p-6 border border-rose-300 shadow-md space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-rose-500 text-white">
                      <Inbox className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] font-extrabold uppercase tracking-widest text-rose-400 block">
                        Peer Requests
                      </span>
                      <h3 className="font-extrabold text-slate-700 text-sm">
                        Feedback Request
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
                <div className="p-4 bg-rose-50/20 rounded-2xl border border-rose-100/50 text-center py-6 select-none">
                  <p className="text-xs font-semibold text-rose-450">
                    Review and verify your peer claimed skills.
                  </p>
                </div>
              </div>

              {/* Active Learning Widget */}
              <div className="bg-white rounded-3xl p-6 border border-emerald-300 shadow-md space-y-4">
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
                        Your Courses This Week
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
                        Active Skill: {roadmap.steps.find(s => s.status === 'active')?.skillName || 'All completed!'}
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
              <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 space-y-6">
                {/* Embedded CalendarWidget */}
                <CalendarWidget />

                {/* Upcoming Events Section */}
                <div className="space-y-4 pt-6 border-t border-slate-100">
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-500 block">
                    Upcoming Events
                  </span>
                  
                  <div className="space-y-3">
                    {upcomingEvents.map((evt, idx) => (
                      <div key={idx} className="flex items-start space-x-3.5 p-1">
                        {/* Event Date Block */}
                        <div className={`px-3 py-2 rounded-xl flex flex-col items-center justify-center font-bold text-center shrink-0 w-14 ${evt.colorClass}`}>
                          <span className="text-sm tracking-tight">{evt.day}</span>
                          {evt.month && <span className="text-[9px] uppercase mt-0.5">{evt.month}</span>}
                        </div>
                        {/* Event Details */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-xs text-slate-700 tracking-tight leading-snug truncate">
                            {evt.title}
                          </h4>
                          <p className="text-[10px] text-slate-400 font-semibold leading-normal mt-0.5">
                            {evt.details}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* My Communities Active Groups Card */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-indigo-400 block">
                      My Communities
                    </span>
                    <h3 className="font-extrabold text-slate-700 text-sm">
                      Active Groups
                    </h3>
                  </div>
                  <button className="px-3.5 py-1 text-[10px] font-bold text-primary bg-indigo-50 hover:bg-indigo-100 rounded-full transition-all">
                    All →
                  </button>
                </div>
                <div className="p-4 bg-rose-50/10 rounded-2xl border border-rose-100/30 flex items-start space-x-3 select-none">
                  <div className="p-2 rounded-xl bg-rose-500 text-white shrink-0">
                    <Globe className="w-4 h-4" />
                  </div>
                  <p className="text-[11px] font-bold text-rose-500/80 leading-normal pt-1">
                    You are not in any communities yet. Please join to see your communities.
                  </p>
                </div>
              </div>

              {/* XP Leaderboard Card */}
              <div className="bg-white rounded-3xl p-6 shadow-md border border-slate-100 space-y-4">
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 block">
                    This Week
                  </span>
                  <h3 className="font-extrabold text-slate-700 text-sm">
                    XP Leaderboard
                  </h3>
                </div>

                <div className="space-y-1">
                  <span className="text-[9px] font-extrabold uppercase tracking-widest text-slate-400 block px-1">
                    Community Name
                  </span>
                  {/* Leaderboard Table rows */}
                  <div className="flex items-center justify-between p-3 rounded-2xl bg-indigo-50/20 border border-indigo-100/40">
                    <div className="flex items-center space-x-3.5">
                      <span className="text-slate-400 font-bold text-xs">-</span>
                      <div className="w-8 h-8 rounded-full bg-purple-500 text-white flex items-center justify-center font-bold text-xs border border-purple-400/20">
                        YN
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold text-slate-700 text-xs">
                          You <span className="text-slate-400 font-medium">· You</span>
                        </h4>
                        <p className="text-[10px] text-indigo-500 font-bold mt-0.5">
                          + 0 XP
                        </p>
                      </div>
                    </div>
                    {/* Trophy icon */}
                    <Trophy className="w-4 h-4 text-amber-400" />
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
