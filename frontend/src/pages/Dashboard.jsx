import React, { useState, useEffect } from 'react';
import GreetingHeader from '../components/dashboard/GreetingHeader';
import TodaysTasksCard from '../components/dashboard/TodaysTasksCard';
import XPDashboard from '../components/dashboard/XPDashboard';

const BACKEND_URL = 'http://localhost:5000/api';
// Stub default student ID.
// TODO: Replace with authenticated student context/session ID when login is implemented.
const STUDENT_ID = 'test-student-id';

export default function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [xpData, setXpData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tasksRes, xpRes] = await Promise.all([
        fetch(`${BACKEND_URL}/students/${STUDENT_ID}/tasks/today`),
        fetch(`${BACKEND_URL}/students/${STUDENT_ID}/xp`)
      ]);

      if (!tasksRes.ok || !xpRes.ok) {
        throw new Error('Failed to retrieve dashboard records.');
      }

      const tasksData = await tasksRes.json();
      const xpProfile = await xpRes.json();

      setTasks(tasksData);
      setXpData(xpProfile);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteTask = async (taskId) => {
    // Optimistic UI updates
    const previousTasks = [...tasks];
    const previousXp = { ...xpData };

    const taskToComplete = tasks.find(t => t.id === taskId);
    if (!taskToComplete) return;

    // Update locally
    setTasks(prev =>
      prev.map(t =>
        t.id === taskId ? { ...t, status: 'completed', completedAt: new Date().toISOString() } : t
      )
    );
    if (xpData) {
      const newXP = xpData.currentXP + taskToComplete.xpValue;
      // Fetch level info dynamically from server, but update XP immediately
      setXpData(prev => ({
        ...prev,
        currentXP: newXP
      }));
    }

    try {
      const res = await fetch(`${BACKEND_URL}/students/${STUDENT_ID}/tasks/${taskId}/complete`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('API Error completing task');
      
      // Update with server state to ensure correctness of levels/streaks
      const data = await res.json();
      
      // Refresh XP summary to fetch correct new levels/streaks/limits
      const xpProfileRes = await fetch(`${BACKEND_URL}/students/${STUDENT_ID}/xp`);
      if (xpProfileRes.ok) {
        const xpProfile = await xpProfileRes.json();
        setXpData(xpProfile);
      }
    } catch (err) {
      console.error(err);
      // Rollback
      setTasks(previousTasks);
      setXpData(previousXp);
    }
  };

  const handleSkipTask = async (taskId) => {
    const previousTasks = [...tasks];

    // Optimistic update
    setTasks(prev =>
      prev.map(t => (t.id === taskId ? { ...t, status: 'skipped' } : t))
    );

    try {
      const res = await fetch(`${BACKEND_URL}/students/${STUDENT_ID}/tasks/${taskId}/skip`, {
        method: 'POST'
      });
      if (!res.ok) throw new Error('API Error skipping task');
    } catch (err) {
      console.error(err);
      // Rollback
      setTasks(previousTasks);
    }
  };

  const handleToggleStudyMode = async () => {
    if (!xpData) return;
    const isEnabling = !xpData.studyModeActive;
    
    // Optimistic update
    setXpData(prev => ({
      ...prev,
      studyModeActive: isEnabling
    }));

    try {
      const endpoint = isEnabling ? 'enable' : 'disable';
      const res = await fetch(`${BACKEND_URL}/students/${STUDENT_ID}/study-mode/${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: isEnabling ? JSON.stringify({ days: 7 }) : null
      });

      if (!res.ok) throw new Error('Failed to update study mode');
      
      // Refresh from server
      const xpProfileRes = await fetch(`${BACKEND_URL}/students/${STUDENT_ID}/xp`);
      if (xpProfileRes.ok) {
        const xpProfile = await xpProfileRes.json();
        setXpData(xpProfile);
      }
    } catch (err) {
      console.error(err);
      // Rollback
      setXpData(prev => ({
        ...prev,
        studyModeActive: !isEnabling
      }));
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 animate-pulse space-y-6">
        <div className="h-10 bg-slate-100 rounded-lg w-1/3" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-96 bg-slate-100 rounded-2xl" />
          <div className="h-96 bg-slate-100 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-8 text-center">
        <div className="bg-red-50 text-red-700 p-6 rounded-2xl border border-red-100 max-w-lg mx-auto">
          <h3 className="font-bold text-lg mb-2">Error Connecting to Backend</h3>
          <p className="text-sm mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700 cursor-pointer"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <GreetingHeader name={xpData?.name} graduationDate="May 2027" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Daily Tasks Card */}
        <div className="lg:col-span-2">
          <TodaysTasksCard
            tasks={tasks}
            onCompleteTask={handleCompleteTask}
            onSkipTask={handleSkipTask}
          />
        </div>

        {/* XP Status Panels */}
        <div>
          <XPDashboard
            xpData={xpData}
            onToggleStudyMode={handleToggleStudyMode}
          />
        </div>
      </div>
    </div>
  );
}
