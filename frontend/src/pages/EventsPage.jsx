import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { api, getStudentId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import {
  Calendar, MapPin, Globe, Monitor, Loader2, UserPlus, Filter, CheckCircle2
} from 'lucide-react';

const MODE_ICONS = { online: Monitor, physical: MapPin, hybrid: Globe };

export default function EventsPage() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const studentId = getStudentId();
  const [events, setEvents] = useState([]);
  const [skills, setSkills] = useState([]);
  const [selectedSkill, setSelectedSkill] = useState('');
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadSkills();
    loadEvents();
  }, []);

  async function loadSkills() {
    try {
      const data = await api.getEventSkills(studentId);
      setSkills(data);
    } catch { /* non-critical */ }
  }

  async function loadEvents(skill) {
    setLoading(true);
    try {
      const data = await api.listEvents(studentId, skill || null);
      setEvents(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleSkillFilter(skill) {
    setSelectedSkill(skill);
    loadEvents(skill);
  }

  async function handleRegister(eventId) {
    setRegistering(eventId);
    setMessage('');
    try {
      const result = await api.registerForEvent(studentId, eventId);
      if (result.alreadyRegistered) {
        setMessage('You are already registered for this event.');
      } else {
        setMessage('Registered successfully!');
      }
      await loadEvents(selectedSkill);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setRegistering(null);
    }
  }

  if (!user) return null;

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <header className="w-full bg-white border-b border-slate-100 py-4 px-8 sticky top-0 z-40 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-slate-800">Events & Meetups</h1>
            <p className="text-slate-400 text-xs font-semibold mt-0.5">
              Discover workshops, info sessions, and hiring drives
            </p>
          </div>
          <button
            onClick={() => navigate('/events/registered')}
            className="px-4 py-2 text-xs font-bold text-primary bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
          >
            My Events
          </button>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-4xl w-full mx-auto space-y-4">
        {message && (
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            {message}
          </div>
        )}

        {skills.length > 0 && (
          <div className="flex items-center space-x-2 flex-wrap gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <button
              onClick={() => handleSkillFilter('')}
              className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-all ${
                !selectedSkill ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              All Skills
            </button>
            {skills.map((s) => (
              <button
                key={s}
                onClick={() => handleSkillFilter(s)}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-full transition-all ${
                  selectedSkill === s ? 'bg-primary text-white' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm font-semibold">
            No upcoming events{selectedSkill ? ` for ${selectedSkill}` : ''}.
          </div>
        ) : (
          <div className="space-y-4">
            {events.map((evt) => {
              const ModeIcon = MODE_ICONS[evt.mode] || Globe;
              return (
                <div
                  key={evt.id}
                  className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start space-x-4 flex-1 min-w-0">
                      <div className="px-3 py-2 rounded-xl bg-emerald-50 text-emerald-700 flex flex-col items-center font-bold text-center shrink-0 w-14">
                        <span className="text-sm">{new Date(evt.eventDate).getDate()}</span>
                        <span className="text-[9px] uppercase">
                          {new Date(evt.eventDate).toLocaleString('default', { month: 'short' })}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-extrabold text-slate-800 text-sm">{evt.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{evt.description}</p>
                        <div className="flex flex-wrap items-center gap-2 mt-2">
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
                          {evt.hostEmployer && (
                            <span className="text-[10px] font-bold text-indigo-500">
                              by {evt.hostEmployer.name}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {evt.skills.map((s) => (
                            <span key={s} className="text-[9px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                              {s}
                            </span>
                          ))}
                        </div>
                        {evt.capacity && (
                          <p className="text-[10px] text-slate-400 mt-1.5 font-semibold">
                            {evt.registrationCount}/{evt.capacity} registered
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => handleRegister(evt.id)}
                      disabled={registering === evt.id || evt.isRegistered || evt.isFull}
                      className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center space-x-1 shrink-0 ${
                        evt.isRegistered
                          ? 'text-emerald-600 bg-emerald-50 cursor-default'
                          : evt.isFull
                            ? 'text-slate-400 bg-slate-100 cursor-not-allowed'
                            : 'text-white bg-primary hover:bg-primary-dark'
                      }`}
                    >
                      {registering === evt.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : evt.isRegistered ? (
                        <CheckCircle2 className="w-3 h-3" />
                      ) : (
                        <UserPlus className="w-3 h-3" />
                      )}
                      <span>{evt.isRegistered ? 'Registered' : evt.isFull ? 'Full' : 'Register'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </AppLayout>
  );
}
