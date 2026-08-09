import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { api } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Plus, Trash, Calendar, Building, ShieldAlert, Sparkles, LogOut, Loader2 } from 'lucide-react';

export default function EmployerDashboard() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();

  const [signals, setSignals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState('');

  // Skill Signal form state
  const [jobRole, setJobRole] = useState('Backend Developer');
  const [industry, setIndustry] = useState('SaaS / Technology');
  const [skills, setSkills] = useState([
    { skillName: 'REST APIs', proficiency: 'intermediate' }
  ]);

  // Event form state
  const [eventTitle, setEventTitle] = useState('');
  const [eventDesc, setEventDesc] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [eventLocation, setEventLocation] = useState('');
  const [eventMode, setEventMode] = useState('physical');
  const [eventLink, setEventLink] = useState('');
  const [eventSkills, setEventSkills] = useState('REST APIs, SQL / Databases');

  useEffect(() => {
    if (user && user.role !== 'employer') {
      navigate('/dashboard/profile');
      return;
    }
    loadSignals();
  }, [user]);

  async function loadSignals() {
    try {
      const data = await api.listEmployerSignals();
      setSignals(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleAddSkillField() {
    setSkills(prev => [...prev, { skillName: 'Git & Version Control', proficiency: 'intermediate' }]);
  }

  function handleRemoveSkillField(idx) {
    setSkills(prev => prev.filter((_, i) => i !== idx));
  }

  function handleSkillChange(idx, field, val) {
    setSkills(prev => prev.map((s, i) => i === idx ? { ...s, [field]: val } : s));
  }

  async function handleSubmitSignal(e) {
    e.preventDefault();
    if (skills.length === 0) {
      alert('Please add at least one skill requirement.');
      return;
    }
    setMessage('');
    setSuccess('');
    try {
      await api.createEmployerSignal({
        jobRole,
        industry,
        skills
      });
      setSuccess('Skill signals updated successfully! Old entries overwritten.');
      await loadSignals();
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleSubmitEvent(e) {
    e.preventDefault();
    if (!eventTitle || !eventDesc || !eventDate || !eventLocation) {
      alert('Please fill all event details.');
      return;
    }
    setMessage('');
    setSuccess('');
    try {
      const skillsArray = eventSkills.split(',').map(s => s.trim()).filter(Boolean);
      await api.createEvent({
        title: eventTitle,
        description: eventDesc,
        eventDate: new Date(eventDate),
        location: eventLocation,
        mode: eventMode,
        link: eventLink || null,
        skills: skillsArray
      });
      setSuccess('Recruitment event scheduled successfully! 🎉');
      setEventTitle('');
      setEventDesc('');
      setEventDate('');
      setEventLocation('');
      setEventLink('');
    } catch (err) {
      setMessage(err.message);
    }
  }

  async function handleDeleteSignal(id) {
    if (!window.confirm('Delete this signal requirement?')) return;
    try {
      await api.deleteEmployerSignal(id);
      setSuccess('Signal requirement deleted.');
      await loadSignals();
    } catch (err) {
      setMessage(err.message);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-100 py-6 px-8 flex justify-between items-center shadow-sm">
        <div>
          <span className="text-[10px] font-black text-primary bg-indigo-50 px-2 py-0.5 rounded uppercase">
            ★ EMPLOYER CONSOLE
          </span>
          <h1 className="text-xl font-black text-slate-800 mt-1">
            {user?.companyName || 'Employer Dashboard'}
          </h1>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center space-x-1.5 px-3 py-1.5 border border-slate-100 hover:bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-all"
        >
          <LogOut className="w-4 h-4" />
          <span>Sign Out</span>
        </button>
      </header>

      <main className="flex-1 p-6 md:p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Form: Submit Skill Requirements (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs font-bold animate-fade-in">
              {success}
            </div>
          )}
          {message && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-100 text-rose-700 text-xs font-bold animate-fade-in">
              {message}
            </div>
          )}

          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-800">Submit Skill Signals</h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Post what skills you currently look for in junior hires. Multiple updates overwrite rather than duplicating.
              </p>
            </div>

            <form onSubmit={handleSubmitSignal} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Target Job Role</label>
                  <select
                    value={jobRole}
                    onChange={(e) => setJobRole(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-100 outline-none bg-slate-50 focus:bg-white"
                  >
                    <option value="Backend Developer">Backend Developer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Data Analyst">Data Analyst</option>
                    <option value="UX / UI Designer">UX / UI Designer</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Industry</label>
                  <input
                    type="text"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-100 outline-none focus:border-primary"
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">Required Skills & Proficiency</h3>
                  <button
                    type="button"
                    onClick={handleAddSkillField}
                    className="text-[10px] font-bold text-primary flex items-center space-x-0.5 hover:underline"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Skill Requirement</span>
                  </button>
                </div>

                {skills.map((s, idx) => (
                  <div key={idx} className="flex gap-3 items-center">
                    <input
                      type="text"
                      placeholder="Skill name (e.g. REST APIs)"
                      value={s.skillName}
                      onChange={(e) => handleSkillChange(idx, 'skillName', e.target.value)}
                      className="flex-1 px-3 py-2 text-xs rounded-xl border border-slate-100 outline-none bg-slate-50 focus:bg-white"
                    />

                    <select
                      value={s.proficiency}
                      onChange={(e) => handleSkillChange(idx, 'proficiency', e.target.value)}
                      className="px-3 py-2 text-xs rounded-xl border border-slate-100 outline-none bg-white"
                    >
                      <option value="basic">Basic / Heard of it</option>
                      <option value="intermediate">Intermediate / Used it</option>
                      <option value="advanced">Advanced / Comfortable</option>
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveSkillField(idx)}
                      className="text-slate-450 hover:text-rose-500 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-primary text-white font-extrabold text-xs rounded-xl hover:bg-primary-dark transition-all select-none"
              >
                Broadcast Skill Signal
              </button>
            </form>
          </div>

          {/* Active Broadcasts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wider">Active Broadcasts</h2>

            {signals.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold text-center py-4">
                No active signals.
              </p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {signals.map(sig => (
                  <div key={sig.id} className="border border-slate-100 rounded-2xl p-4 flex flex-col justify-between space-y-3 bg-slate-50/50">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-xs font-black text-slate-850">{sig.jobRole}</h4>
                        <p className="text-[10px] text-slate-450">{sig.industry}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSignal(sig.id)}
                        className="text-slate-450 hover:text-rose-500 p-1"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <div className="flex flex-wrap gap-1.5">
                      {sig.skills.map(sk => (
                        <span key={sk.id} className="text-[9px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded">
                          {sk.skillName} ({sk.proficiency})
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Form: Schedule Recruitment Event (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-6">
            <div>
              <h2 className="text-base font-black text-slate-800">Schedule Recruitment Event</h2>
              <p className="text-[11px] text-slate-400 font-semibold mt-1">
                Promote workshops, technical tests, or info sessions to qualified cohort students.
              </p>
            </div>

            <form onSubmit={handleSubmitEvent} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Event Title</label>
                <input
                  type="text"
                  placeholder="e.g. WSO2 Cloud API Developer Hackathon"
                  value={eventTitle}
                  onChange={(e) => setEventTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-100 outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Description</label>
                <textarea
                  placeholder="Provide info, criteria, and target cohort details..."
                  value={eventDesc}
                  onChange={(e) => setEventDesc(e.target.value)}
                  rows="3"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-100 outline-none focus:border-primary"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Event Date</label>
                  <input
                    type="datetime-local"
                    value={eventDate}
                    onChange={(e) => setEventDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-100 outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase">Mode</label>
                  <select
                    value={eventMode}
                    onChange={(e) => setEventMode(e.target.value)}
                    className="w-full px-3 py-2 text-xs font-semibold rounded-xl border border-slate-100 bg-white outline-none focus:border-primary"
                  >
                    <option value="physical">Physical</option>
                    <option value="online">Online</option>
                    <option value="hybrid">Hybrid</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Location / Link</label>
                <input
                  type="text"
                  placeholder="e.g. WSO2 Head Office, Colombo 3 / Zoom"
                  value={eventLocation}
                  onChange={(e) => setEventLocation(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-100 outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Target Skills (comma separated)</label>
                <input
                  type="text"
                  value={eventSkills}
                  onChange={(e) => setEventSkills(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-100 outline-none focus:border-primary"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-slate-850 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition-all"
              >
                Publish Recruitment Event
              </button>
            </form>
          </div>
        </div>

      </main>
    </div>
  );
}
