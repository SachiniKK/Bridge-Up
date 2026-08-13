import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { api, getStudentId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { notifyXPUpdated } from '../hooks/useXP';
import { Users, Globe, UserPlus, UserMinus, Loader2 } from 'lucide-react';

export default function CommunitiesPage() {
  const { user, handleLogout } = useAuth();
  const navigate = useNavigate();
  const studentId = getStudentId();
  const [communities, setCommunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadCommunities();
  }, []);

  async function loadCommunities() {
    try {
      const data = await api.listCommunities(studentId);
      setCommunities(data);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleJoin(communityId) {
    setActionLoading(communityId);
    setMessage('');
    try {
      const result = await api.joinCommunity(studentId, communityId);
      if (result.alreadyMember) {
        setMessage('You are already a member of this community.');
      } else if (result.xpAwarded) {
        setMessage(`Joined! +${10} XP awarded.`);
        notifyXPUpdated();
      } else {
        setMessage('Joined community successfully!');
      }
      await loadCommunities();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  async function handleLeave(communityId) {
    setActionLoading(communityId);
    setMessage('');
    try {
      await api.leaveCommunity(studentId, communityId);
      setMessage('Left community successfully.');
      await loadCommunities();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setActionLoading(null);
    }
  }

  if (!user) return null;

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <header className="w-full bg-white border-b border-slate-100 py-4 px-8 sticky top-0 z-40 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-800">Communities</h1>
        <p className="text-slate-400 text-xs font-semibold mt-0.5">
          Join skill-based communities to connect with peers
        </p>
      </header>

      <main className="p-6 md:p-8 max-w-4xl w-full mx-auto space-y-4">
        {message && (
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
            {message}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-4">
            {communities.map((c) => (
              <div
                key={c.id}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm flex items-start justify-between gap-4"
              >
                <div className="flex items-start space-x-4 flex-1 min-w-0">
                  <div className="p-2.5 rounded-xl bg-indigo-50 text-primary shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-extrabold text-slate-800 text-sm">{c.name}</h3>
                    <p className="text-xs text-slate-400 mt-1">{c.description}</p>
                    <div className="flex items-center space-x-3 mt-2">
                      <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full">
                        {c.skillTag}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 flex items-center space-x-1">
                        <Users className="w-3 h-3" />
                        <span>{c.memberCount} members</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2 shrink-0">
                  {c.isMember ? (
                    <>
                      <button
                        onClick={() => navigate(`/communities/${c.id}`)}
                        className="px-4 py-2 text-xs font-bold text-primary bg-indigo-50 hover:bg-indigo-100 rounded-xl transition-all"
                      >
                        View Feed
                      </button>
                      <button
                        onClick={() => handleLeave(c.id)}
                        disabled={actionLoading === c.id}
                        className="px-4 py-2 text-xs font-bold text-rose-500 bg-rose-50 hover:bg-rose-100 rounded-xl transition-all flex items-center space-x-1"
                      >
                        {actionLoading === c.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <UserMinus className="w-3 h-3" />
                        )}
                        <span>Leave</span>
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleJoin(c.id)}
                      disabled={actionLoading === c.id}
                      className="px-4 py-2 text-xs font-bold text-white bg-primary hover:bg-primary-dark rounded-xl transition-all flex items-center space-x-1"
                    >
                      {actionLoading === c.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <UserPlus className="w-3 h-3" />
                      )}
                      <span>Join</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </AppLayout>
  );
}
