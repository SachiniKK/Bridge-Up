import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { api, getStudentId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Calendar, MapPin, Globe, Monitor, Loader2, ArrowLeft, X } from 'lucide-react';

const MODE_ICONS = { online: Monitor, physical: MapPin, hybrid: Globe };

export default function MyEventsPage() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const studentId = getStudentId();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadEvents();
  }, []);

  async function loadEvents() {
    try {
      const data = await api.getRegisteredEvents(studentId);
      setEvents(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleUnregister(eventId) {
    try {
      await api.unregisterFromEvent(studentId, eventId);
      setMessage('Registration cancelled.');
      await loadEvents();
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (!user) return null;

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <header className="w-full bg-white border-b border-slate-100 py-4 px-8 sticky top-0 z-40 shadow-sm">
        <button
          onClick={() => navigate('/events')}
          className="flex items-center space-x-1 text-xs font-bold text-slate-400 hover:text-primary mb-2"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Events</span>
        </button>
        <h1 className="text-xl font-extrabold text-slate-800">My Registered Events</h1>
        <p className="text-slate-400 text-xs font-semibold mt-0.5">
          Track your upcoming commitments
        </p>
      </header>

      <main className="p-6 md:p-8 max-w-3xl w-full mx-auto space-y-4">
        {message && (
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm font-semibold">
            You haven't registered for any events yet.
          </div>
        ) : (
          events.map((evt) => {
            const ModeIcon = MODE_ICONS[evt.mode] || Globe;
            return (
              <div
                key={evt.id}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                  <div className="px-3 py-2 rounded-xl bg-indigo-50 text-indigo-700 flex flex-col items-center font-bold text-center shrink-0 w-14">
                    <span className="text-sm">{new Date(evt.eventDate).getDate()}</span>
                    <span className="text-[9px] uppercase">
                      {new Date(evt.eventDate).toLocaleString('default', { month: 'short' })}
                    </span>
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-800 text-sm">{evt.title}</h3>
                    <div className="flex flex-wrap items-center gap-2 mt-1.5">
                      <span className="text-[10px] font-bold text-slate-500 flex items-center space-x-1">
                        <ModeIcon className="w-3 h-3" />
                        <span className="capitalize">{evt.mode}</span>
                      </span>
                      {evt.location && (
                        <span className="text-[10px] font-semibold text-slate-400 flex items-center space-x-1">
                          <MapPin className="w-3 h-3" />
                          <span>{evt.location}</span>
                        </span>
                      )}
                      {evt.link && (
                        <a
                          href={evt.link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-[10px] font-bold text-primary underline"
                        >
                          Join link
                        </a>
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                      Registered on {new Date(evt.registeredAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => handleUnregister(evt.id)}
                  className="px-3 py-2 text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all flex items-center space-x-1 shrink-0"
                >
                  <X className="w-3 h-3" />
                  <span>Cancel</span>
                </button>
              </div>
            );
          })
        )}
      </main>
    </AppLayout>
  );
}
