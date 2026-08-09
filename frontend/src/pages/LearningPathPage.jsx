import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { api, getStudentId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { PlayCircle, Trophy, Users, Globe, ExternalLink, Loader2, Send } from 'lucide-react';

export default function LearningPathPage() {
  const { user, handleLogout } = useAuth();
  const studentId = getStudentId();
  const navigate = useNavigate();

  const [roadmap, setRoadmap] = useState(null);
  const [activeStep, setActiveStep] = useState(null);
  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  
  // Custom checklist completion states
  const [completedTasks, setCompletedTasks] = useState({});

  // Derive tasks checklist dynamically from weeksDetails of the active step
  const tasks = React.useMemo(() => {
    if (!activeStep || !activeStep.weeksDetails) return [];
    if (Array.isArray(activeStep.weeksDetails)) {
      return activeStep.weeksDetails.map((w, idx) => {
        const key = `${activeStep.id}-${idx}`;
        return {
          id: idx + 1,
          text: `${w.weeks}: ${w.content}`,
          xp: idx === 0 ? 20 : 40,
          done: !!completedTasks[key]
        };
      });
    }
    return [];
  }, [activeStep, completedTasks]);

  // Squad activity mock list
  const [squad, setSquad] = useState([
    { id: 1, user: 'Rifan', action: 'submitted his GET endpoint — 2 reviews needed', time: '12 min ago' },
    { id: 2, user: 'Thisari', action: 'commented: "the route naming helped me fix mine too 🙌"', time: '1 hr ago' }
  ]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    loadRoadmapData();
  }, []);

  async function loadRoadmapData() {
    try {
      const data = await api.getRoadmap(studentId);
      if (!data || !data.steps || data.steps.length === 0) {
        // Redirect to onboarding if no roadmap exists
        navigate('/roadmap-builder');
        return;
      }
      setRoadmap(data);
      
      // Find active step (or first step if none active)
      const current = data.steps.find(s => s.status === 'active') || data.steps[0];
      setActiveStep(current);

      if (current) {
        // Load live signals for active step
        const signalData = await api.getSkillSignals(studentId, current.skillName);
        setSignals(signalData);
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleTask(taskId) {
    const idx = taskId - 1;
    const key = `${activeStep.id}-${idx}`;
    const nextDone = !completedTasks[key];
    setCompletedTasks(prev => ({ ...prev, [key]: nextDone }));
    if (nextDone) {
      setMessage(`Task completed! +${idx === 0 ? 20 : 40} XP awarded locally.`);
    }
  }

  async function handleCompleteResource(resourceId) {
    try {
      const res = await api.completeResource(studentId, resourceId);
      setMessage(`Completed! +${res.resource?.xpReward || 50} XP awarded.`);
      await loadRoadmapData();
    } catch (err) {
      setMessage(err.message);
    }
  }

  function handlePostComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSquad(prev => [
      {
        id: Date.now(),
        user: user.firstName || 'You',
        action: `commented: "${newComment.trim()}"`,
        time: 'Just now'
      },
      ...prev
    ]);
    setNewComment('');
  }

  // Calculate task counts
  const tasksCompleted = tasks.filter(t => t.done).length;

  if (loading) {
    return (
      <AppLayout user={user} onLogout={handleLogout}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  if (!roadmap || !activeStep) {
    return (
      <AppLayout user={user} onLogout={handleLogout}>
        <div className="p-8 max-w-md mx-auto text-center space-y-4 py-20 animate-fade-in">
          <Trophy className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-black text-slate-850">No Active Learning Path</h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            You haven't generated your learning roadmap yet. Let's create one now based on your career goals!
          </p>
          <div className="pt-2">
            <button
              onClick={() => navigate('/roadmap-builder')}
              className="px-6 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all"
            >
              Build Your Roadmap
            </button>
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <header className="w-full bg-white border-b border-slate-100 py-6 px-8 sticky top-0 z-40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold text-primary bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            {activeStep.skillName} — Module {roadmap.steps.findIndex(s => s.id === activeStep.id) + 1} of {roadmap.steps.length}
          </span>
          <h1 className="text-2xl font-extrabold text-slate-800 mt-2">
            {activeStep.skillName === 'REST APIs' ? 'Building Your First API in Node.js' : `Mastering ${activeStep.skillName}`}
          </h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Built around what Sri Lankan tech companies like WSO2, IFS, and Dialog Axiata actually ask in entry-level interviews for {activeStep.skillName}.
          </p>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Area: Video player and checklist (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          {message && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold animate-fade-in">
              {message}
            </div>
          )}

          {/* Video Player */}
          <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
            <div className="aspect-video bg-[#312e81] relative flex items-center justify-center group select-none">
              {/* Play Overlay */}
              <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/30 transition-colors flex items-center justify-center cursor-pointer">
                <PlayCircle className="w-16 h-16 text-white/90 drop-shadow-md group-hover:scale-105 transition-transform" />
              </div>
              <span className="absolute bottom-4 right-4 bg-slate-900/80 text-white text-[10px] font-black px-2 py-0.5 rounded">
                {activeStep.resources && activeStep.resources[0] ? `${activeStep.resources[0].durationMins}:00` : '15:00'}
              </span>
              <span className="text-white/20 font-black text-6xl tracking-wider select-none">API</span>
            </div>
            
            <div className="p-5 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-slate-800 text-sm">
                  {activeStep.resources && activeStep.resources[0] ? activeStep.resources[0].title : `Intro: ${activeStep.skillName} Fundamentals`}
                </h3>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5">
                  {activeStep.resources && activeStep.resources[0] ? (activeStep.resources[0].justification || 'Required for tech candidates') : 'Core learning module'}
                </p>
              </div>
              {activeStep.resources && activeStep.resources[0] && (
                <button
                  onClick={() => handleCompleteResource(activeStep.resources[0].id)}
                  disabled={activeStep.resources[0].completed}
                  className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                    activeStep.resources[0].completed
                      ? 'bg-emerald-50 text-emerald-600 cursor-default'
                      : 'bg-primary text-white hover:bg-primary-dark'
                  }`}
                >
                  {activeStep.resources[0].completed ? '✓ Completed' : 'Complete +120 XP'}
                </button>
              )}
            </div>
          </div>

          {/* Tasks Checklist */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-slate-50 pb-3">
              <h3 className="font-extrabold text-slate-800 text-sm">
                This week's tasks
              </h3>
              <span className="text-xs font-bold text-slate-500 bg-slate-50 px-2.5 py-1 rounded-full border border-slate-100">
                {tasksCompleted} / {tasks.length} done
              </span>
            </div>

            <div className="space-y-2">
              {tasks.map(task => (
                <div
                  key={task.id}
                  onClick={() => handleToggleTask(task.id)}
                  className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer select-none ${
                    task.done
                      ? 'bg-emerald-50/50 border-emerald-100 text-slate-500'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                      task.done ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-slate-300'
                    }`}>
                      {task.done && <span className="text-[10px] font-black">✓</span>}
                    </div>
                    <span className={`text-xs font-bold ${task.done ? 'line-through' : 'text-slate-700'}`}>
                      {task.text}
                    </span>
                  </div>
                  <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                    task.done ? 'bg-emerald-100 text-emerald-700' : 'bg-indigo-50 text-primary'
                  }`}>
                    +{task.xp} XP
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-2 text-right">
              <button
                onClick={() => navigate('/verifications')}
                className="px-4 py-2 text-xs font-bold bg-primary text-white hover:bg-primary-dark rounded-xl transition-all"
              >
                Go to Peer Reviews Queue
              </button>
            </div>
          </div>
        </div>

        {/* Right Area: Progress, Why This Matters, Squad (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Progress Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-3">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-indigo-400">Module Progress</h3>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">This Module</span>
              <span className="text-xs font-extrabold text-primary">50%</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
              <div className="bg-primary h-full rounded-full transition-all duration-300" style={{ width: '50%' }}></div>
            </div>
          </div>

          {/* Why This Skill Matters Here */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-indigo-400 flex items-center space-x-1.5">
              <span>Why This Skill Matters Here</span>
            </h3>

            <div className="space-y-3.5">
              {signals.map((sig, idx) => (
                <div key={idx} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100/50 space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-800 flex items-center gap-1.5">
                      {sig.company} - {sig.location}
                      {sig.isLive && (
                        <span className="text-[8px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded">
                          Live signal
                        </span>
                      )}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 italic leading-relaxed">
                    {sig.quote}
                  </p>
                  <p className="text-[9px] font-bold text-indigo-500">{sig.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Squad Activity */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h3 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-indigo-400">Squad Activity</h3>

            <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
              {squad.map(act => (
                <div key={act.id} className="text-xs border-b border-slate-50 pb-2 last:border-0">
                  <p className="text-slate-600 leading-relaxed">
                    <span className="font-extrabold text-slate-800">{act.user}</span> {act.action}
                  </p>
                  <span className="text-[9px] text-slate-400 font-semibold">{act.time}</span>
                </div>
              ))}
            </div>

            <form onSubmit={handlePostComment} className="flex gap-2">
              <input
                type="text"
                placeholder="Reply to squad..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-100 outline-none focus:border-primary focus:ring-1 focus:ring-primary/10"
              />
              <button
                type="submit"
                className="p-2 bg-indigo-50 text-primary rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
