import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { api, getStudentId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { notifyXPUpdated } from '../hooks/useXP';
import {
  PlayCircle,
  PauseCircle,
  Trophy,
  Users,
  Globe,
  ExternalLink,
  Loader2,
  Send,
  Video,
  CheckCircle2,
  Sparkles,
  BookOpen
} from 'lucide-react';

const FALLBACK_VIDEOS = {
  'REST APIs': 'https://www.youtube.com/watch?v=iYM2zFP3Zn0',
  'Git & Version Control': 'https://www.youtube.com/watch?v=RGOj5yH7evk',
  'SQL / Databases': 'https://www.youtube.com/watch?v=HXV3zeQKqGY',
  'React.js': 'https://www.youtube.com/watch?v=x4rFhThSX04',
  'JavaScript': 'https://www.youtube.com/watch?v=lfmg-EJ8gm4',
  'Algorithms & Data Structures': 'https://www.youtube.com/watch?v=8hly31xKli0',
  'System Design & Testing': 'https://www.youtube.com/watch?v=i53Gi_K3o7I',
  'React.js & Frontend': 'https://www.youtube.com/watch?v=bMknfKXIFA8',
  'Node.js & Express APIs': 'https://www.youtube.com/watch?v=Oe421EPjeBE',
};

function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const regExp = /^.*(?:youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2] && match[2].length === 11)
    ? `https://www.youtube.com/embed/${match[2]}?autoplay=1&rel=0&enablejsapi=1`
    : null;
}

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

  // Video Player state
  const [selectedResourceIndex, setSelectedResourceIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Load saved task completion states from localStorage on mount/studentId change
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`bu_completed_tasks_${studentId}`);
      if (saved) {
        setCompletedTasks(JSON.parse(saved));
      }
    } catch (err) {
      console.error('Failed to load saved task completions', err);
    }
  }, [studentId]);

  // Helper to update state and persist to localStorage
  function updateCompletedTasks(updater) {
    setCompletedTasks(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      try {
        localStorage.setItem(`bu_completed_tasks_${studentId}`, JSON.stringify(next));
      } catch (err) {
        console.error('Failed to persist completed tasks', err);
      }
      return next;
    });
  }

  // Auto-tick tasks if any resource in activeStep is marked completed in DB
  useEffect(() => {
    if (activeStep && activeStep.resources) {
      const hasCompletedResource = activeStep.resources.some(r => r.completed);
      if (hasCompletedResource && activeStep.weeksDetails) {
        updateCompletedTasks(prev => {
          const next = { ...prev };
          activeStep.weeksDetails.forEach((_, idx) => {
            const key = `${activeStep.id}-${idx}`;
            next[key] = true;
          });
          return next;
        });
      }
    }
  }, [activeStep]);

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
        setRoadmap(null);
        setActiveStep(null);
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
      setRoadmap(null);
      setActiveStep(null);
    } finally {
      setLoading(false);
    }
  }

  async function handleSelectStep(step) {
    setActiveStep(step);
    setSelectedResourceIndex(0);
    setIsPlaying(false);
    try {
      const signalData = await api.getSkillSignals(studentId, step.skillName);
      setSignals(signalData);
    } catch (err) {
      console.error('Failed to load skill signals', err);
    }
  }

  async function handleToggleTask(taskId) {
    const idx = taskId - 1;
    const key = `${activeStep.id}-${idx}`;
    const nextDone = !completedTasks[key];
    updateCompletedTasks(prev => ({ ...prev, [key]: nextDone }));
    if (nextDone) {
      const xpReward = idx === 0 ? 20 : 40;
      setMessage(`Task completed! +${xpReward} XP awarded.`);
      try {
        await api.awardXP(studentId, xpReward, 'learning_path_task_completed', key);
        notifyXPUpdated();
      } catch (e) {
        console.error('Failed to award task XP on backend', e);
      }
    }
  }

  async function handleCompleteResource(resourceId) {
    try {
      const res = await api.completeResource(studentId, resourceId);

      // Auto tick off all tasks for the active step
      if (activeStep && activeStep.weeksDetails) {
        updateCompletedTasks(prev => {
          const next = { ...prev };
          activeStep.weeksDetails.forEach((_, idx) => {
            const key = `${activeStep.id}-${idx}`;
            next[key] = true;
          });
          return next;
        });
      }

      setMessage(`🎉 Video resource completed! Module tasks ticked off as completed (+${res.resource?.xpReward || 50} XP awarded).`);
      notifyXPUpdated();
      await loadRoadmapData();
    } catch (err) {
      setMessage(err.message);
    }
  }

  // Active Resource & Video calculations
  const currentResource = (activeStep?.resources && activeStep.resources[selectedResourceIndex]) || {
    title: `Intro: ${activeStep?.skillName || ''} Fundamentals`,
    type: 'youtube',
    url: FALLBACK_VIDEOS[activeStep?.skillName] || 'https://www.youtube.com/watch?v=iYM2zFP3Zn0',
    durationMins: 15,
    xpReward: 100,
    justification: 'Core learning module'
  };

  const videoUrl = currentResource.url || FALLBACK_VIDEOS[activeStep?.skillName] || 'https://www.youtube.com/watch?v=iYM2zFP3Zn0';
  const embedUrl = getYouTubeEmbedUrl(videoUrl);

  // Auto-complete resource & tick tasks when YouTube video finishes watching
  useEffect(() => {
    function handleMessage(event) {
      if (!event.data) return;
      try {
        let data = event.data;
        if (typeof data === 'string') {
          data = JSON.parse(data);
        }
        // YouTube iframe message event for playerState 0 (ENDED)
        if (data.event === 'infoDelivery' && data.info && data.info.playerState === 0) {
          if (currentResource && currentResource.id && !currentResource.completed) {
            handleCompleteResource(currentResource.id);
          }
        }
      } catch (err) {
        // Ignore non-json postMessages
      }
    }

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [currentResource, activeStep]);

  function handlePostComment(e) {
    e.preventDefault();
    if (!newComment.trim()) return;
    setSquad(prev => [
      {
        id: Date.now(),
        user: user?.firstName || 'You',
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
        <div className="p-8 max-w-lg mx-auto text-center space-y-5 py-24 animate-fade-in">
          <div className="w-16 h-16 bg-indigo-50 border border-indigo-100 rounded-3xl flex items-center justify-center mx-auto text-indigo-600">
            <BookOpen className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-extrabold text-slate-850">No Learning Path Generated Yet</h2>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              You haven't generated your learning roadmap yet. Create one now based on your career goals to unlock video lessons, checklist tasks, and XP rewards!
            </p>
          </div>
          <div className="pt-2">
            <button
              onClick={() => navigate('/roadmap-builder')}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white text-xs font-bold rounded-2xl shadow-md shadow-primary/25 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer"
            >
              Create My Learning Roadmap →
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

      <main className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6">
        {/* Module Step Navigation Tabs */}
        {roadmap.steps && roadmap.steps.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-slate-100">
            {roadmap.steps.map((step, idx) => {
              const isCurrent = step.id === activeStep.id;
              return (
                <button
                  key={step.id}
                  onClick={() => handleSelectStep(step)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-primary text-white shadow-md shadow-primary/20 scale-[1.02]'
                      : step.status === 'completed'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100/70'
                      : 'bg-white text-slate-600 border border-slate-100 hover:bg-slate-50'
                  }`}
                >
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                    isCurrent ? 'bg-white/20 text-white' : step.status === 'completed' ? 'bg-emerald-200 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {step.status === 'completed' ? '✓' : idx + 1}
                  </span>
                  <span>{step.skillName}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Area: Video player, resource list, and checklist (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {message && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold animate-fade-in flex items-center justify-between">
                <span>{message}</span>
                <button onClick={() => setMessage('')} className="text-indigo-400 hover:text-indigo-600 text-xs font-bold">×</button>
              </div>
            )}

            {/* Video Player Card */}
            <div className="bg-white rounded-[32px] border border-slate-100 overflow-hidden shadow-sm">
              <div className="aspect-video bg-gradient-to-br from-indigo-950 via-slate-900 to-indigo-900 relative flex items-center justify-center group overflow-hidden">
                {isPlaying ? (
                  embedUrl ? (
                    <iframe
                      src={embedUrl}
                      title={currentResource.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                    />
                  ) : (
                    /* External resource launcher view */
                    <div className="p-8 text-center space-y-4 max-w-md animate-fade-in z-10">
                      <div className="w-14 h-14 bg-indigo-500/20 text-indigo-300 rounded-2xl flex items-center justify-center mx-auto border border-indigo-400/30">
                        <BookOpen className="w-8 h-8" />
                      </div>
                      <div className="space-y-1">
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                          {currentResource.type || 'Course'}
                        </span>
                        <h4 className="text-white font-bold text-base mt-2">{currentResource.title}</h4>
                        <p className="text-slate-300 text-xs font-medium leading-relaxed">
                          This resource is hosted on an external platform. Click below to launch in a new tab.
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-3 pt-2">
                        <a
                          href={videoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-5 py-2.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center gap-2 shadow-lg shadow-primary/30"
                        >
                          <span>Open Resource</span>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setIsPlaying(false)}
                          className="px-4 py-2.5 bg-slate-800 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all"
                        >
                          Back to Preview
                        </button>
                      </div>
                    </div>
                  )
                ) : (
                  /* Static / Thumbnail view with Play button */
                  <div
                    onClick={() => setIsPlaying(true)}
                    className="w-full h-full flex flex-col items-center justify-center cursor-pointer group relative p-6 text-center"
                  >
                    <div className="absolute inset-0 bg-slate-950/20 group-hover:bg-slate-950/40 transition-colors" />
                    
                    {/* Background Title Decoration */}
                    <span className="text-white/10 font-black text-6xl md:text-8xl tracking-widest select-none uppercase absolute">
                      {activeStep.skillName.split(' ')[0]}
                    </span>

                    <div className="relative z-10 flex flex-col items-center space-y-3">
                      <div className="w-20 h-20 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center group-hover:scale-110 group-hover:bg-primary transition-all duration-300 shadow-xl">
                        <PlayCircle className="w-12 h-12 text-white ml-0.5" />
                      </div>
                      <span className="text-white font-extrabold text-xs tracking-wider uppercase bg-white/10 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/10 shadow-sm">
                        Click to Play Video Tutorial
                      </span>
                    </div>

                    <div className="absolute bottom-4 right-4 z-10 flex items-center gap-2">
                      <span className="bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/10">
                        {currentResource.durationMins || 15}:00 mins
                      </span>
                      <span className="bg-indigo-600/90 text-white text-[10px] font-black px-2 py-1 rounded-lg uppercase tracking-wider">
                        {currentResource.type || 'Video'}
                      </span>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Video Footer Info Bar */}
              <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-t border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black text-primary bg-indigo-50 px-2 py-0.5 rounded-md uppercase tracking-wider">
                      {currentResource.type || 'Module'}
                    </span>
                    <h3 className="font-extrabold text-slate-800 text-sm">
                      {currentResource.title}
                    </h3>
                  </div>
                  <p className="text-[11px] font-semibold text-slate-400">
                    {currentResource.justification || 'Required core training for entry-level tech roles'}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {isPlaying && embedUrl && (
                    <button
                      onClick={() => setIsPlaying(false)}
                      className="px-3.5 py-2 text-xs font-bold bg-slate-100 text-slate-700 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5"
                    >
                      <PauseCircle className="w-3.5 h-3.5" />
                      <span>Stop</span>
                    </button>
                  )}

                  {currentResource.id && (
                    <button
                      onClick={() => handleCompleteResource(currentResource.id)}
                      disabled={currentResource.completed}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
                        currentResource.completed
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-100 cursor-default'
                          : 'bg-primary text-white hover:bg-primary-dark shadow-sm'
                      }`}
                    >
                      {currentResource.completed ? '✓ Completed' : `Complete +${currentResource.xpReward || 100} XP`}
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Resources List for active step */}
            {activeStep.resources && activeStep.resources.length > 0 && (
              <div className="bg-white rounded-3xl p-5 border border-slate-100 shadow-sm space-y-3">
                <h4 className="font-extrabold text-slate-800 text-xs uppercase tracking-wider text-indigo-500 flex items-center gap-2">
                  <Video className="w-4 h-4 text-primary" />
                  <span>Learning Resources &amp; Videos ({activeStep.resources.length})</span>
                </h4>
                <div className="space-y-2">
                  {activeStep.resources.map((res, index) => {
                    const isSelected = index === selectedResourceIndex;
                    const resEmbedUrl = getYouTubeEmbedUrl(res.url);
                    return (
                      <div
                        key={res.id || index}
                        onClick={() => {
                          setSelectedResourceIndex(index);
                          setIsPlaying(true);
                        }}
                        className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50/60 border-primary/40 ring-1 ring-primary/20'
                            : 'bg-slate-50/40 border-slate-100 hover:border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center space-x-3 min-w-0 flex-1 pr-3">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                            res.type === 'youtube' ? 'bg-red-50 text-red-600' : 'bg-indigo-50 text-primary'
                          }`}>
                            {resEmbedUrl ? <PlayCircle className="w-5 h-5" /> : <ExternalLink className="w-4 h-4" />}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                                res.type === 'youtube' ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'
                              }`}>
                                {res.type || 'Video'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-semibold">{res.durationMins} mins</span>
                            </div>
                            <p className="text-xs font-extrabold text-slate-800 truncate mt-0.5">{res.title}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCompleteResource(res.id);
                            }}
                            disabled={res.completed}
                            className={`px-3 py-1.5 text-[11px] font-bold rounded-xl transition-all ${
                              res.completed
                                ? 'bg-emerald-50 text-emerald-600 cursor-default border border-emerald-100'
                                : 'bg-primary text-white hover:bg-primary-dark shadow-sm'
                            }`}
                          >
                            {res.completed ? '✓ Done' : `+${res.xpReward || 50} XP`}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

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
        </div>
      </main>
    </AppLayout>
  );
}

