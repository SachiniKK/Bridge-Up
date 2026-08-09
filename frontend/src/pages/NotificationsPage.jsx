import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { api, getStudentId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Bell, Check, AlertCircle, Calendar, Sparkles, Loader2 } from 'lucide-react';

export default function NotificationsPage() {
  const { user, handleLogout } = useAuth();
  const studentId = getStudentId();

  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [triggering, setTriggering] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const data = await api.getNotifications(studentId);
      setNotifications(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkRead(id) {
    try {
      await api.markNotificationRead(studentId, id);
      setNotifications(prev =>
        prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleTriggerReminder() {
    setTriggering(true);
    setMessage('');
    try {
      const res = await api.triggerNotificationReminder(studentId);
      if (res.reminder) {
        setMessage('Daily task reminder triggered! Evaluation processed successfully.');
      } else {
        setMessage('Evaluation processed. No reminder generated (either you completed your tasks or study mode is active).');
      }
      await loadNotifications();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setTriggering(false);
    }
  }

  if (loading) {
    return (
      <AppLayout user={user} onLogout={handleLogout}>
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <header className="w-full bg-white border-b border-slate-100 py-6 px-8 sticky top-0 z-40 shadow-sm flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">Notifications</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Stay up to date with cohort activities, event registrations, and daily task recommendations.
          </p>
        </div>

        <button
          onClick={handleTriggerReminder}
          disabled={triggering}
          className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-dark transition-all flex items-center space-x-1.5 shrink-0 self-start sm:self-center"
        >
          <Bell className="w-4 h-4" />
          <span>{triggering ? 'Evaluating...' : 'Run Reminder Check'}</span>
        </button>
      </header>

      <main className="p-6 md:p-8 max-w-3xl w-full mx-auto space-y-6">
        {message && (
          <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold animate-fade-in">
            {message}
          </div>
        )}

        <div className="bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between items-center border-b border-slate-50 pb-3">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Inbox Alert</h2>
            <span className="text-xs font-bold text-slate-400">
              {notifications.filter(n => !n.isRead).length} unread
            </span>
          </div>

          {notifications.length === 0 ? (
            <div className="py-12 text-center text-slate-400 font-semibold space-y-2">
              <Bell className="w-8 h-8 text-slate-200 mx-auto" />
              <p className="text-xs">No notifications found.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map(notif => (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                    notif.isRead
                      ? 'bg-slate-50/50 border-slate-100'
                      : 'bg-indigo-50/20 border-indigo-100/50'
                  }`}
                >
                  <div className="flex items-start space-x-3.5">
                    <div className={`p-2 rounded-xl mt-0.5 ${
                      notif.type === 'daily_reminder' ? 'bg-amber-50 text-amber-500' :
                      notif.type === 'event_reminder' ? 'bg-emerald-50 text-emerald-500' :
                      'bg-indigo-50 text-primary'
                    }`}>
                      {notif.type === 'daily_reminder' ? <AlertCircle className="w-4 h-4" /> :
                       notif.type === 'event_reminder' ? <Calendar className="w-4 h-4" /> :
                       <Sparkles className="w-4 h-4" />}
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                        {notif.title}
                        {!notif.isRead && (
                          <span className="w-1.5 h-1.5 bg-primary rounded-full"></span>
                        )}
                      </h4>
                      <p className="text-[11px] text-slate-500 leading-relaxed">
                        {notif.body}
                      </p>
                      <span className="text-[9px] text-slate-400 font-semibold block pt-1">
                        {new Date(notif.createdAt).toLocaleDateString()} at {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => handleMarkRead(notif.id)}
                      className="p-1.5 bg-white border border-slate-100 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg transition-all"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </AppLayout>
  );
}
