import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { api, getStudentId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { notifyXPUpdated } from '../hooks/useXP';
import { Trophy, Clock, Loader2, Send, CheckCircle2 } from 'lucide-react';

export default function ChallengesPage() {
  const { user, handleLogout } = useAuth();
  const studentId = getStudentId();
  const [challenge, setChallenge] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [responseText, setResponseText] = useState('');
  const [responseLink, setResponseLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadChallenge();
  }, []);

  async function loadChallenge() {
    try {
      const data = await api.getCurrentChallenge(studentId);
      setChallenge(data.challenge);
      setSubmission(data.submission);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!responseText.trim() && !responseLink.trim()) {
      setMessage('Please provide a text response or a link.');
      return;
    }
    setSubmitting(true);
    setMessage('');
    try {
      const result = await api.submitChallenge(
        studentId, challenge.id, responseText, responseLink
      );
      if (result.alreadySubmitted) {
        setMessage('You have already submitted for this challenge.');
      } else if (result.xpAwarded) {
        setMessage(`Submission accepted! +${challenge.xpReward} XP awarded.`);
        notifyXPUpdated();
      } else {
        setMessage('Submission recorded.');
      }
      setSubmission(result.submission);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!user) return null;

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <header className="w-full bg-white border-b border-slate-100 py-4 px-8 sticky top-0 z-40 shadow-sm">
        <h1 className="text-xl font-extrabold text-slate-800">Weekly Challenge</h1>
        <p className="text-slate-400 text-xs font-semibold mt-0.5">
          Complete this week's skill challenge to earn XP
        </p>
      </header>

      <main className="p-6 md:p-8 max-w-2xl w-full mx-auto">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 animate-spin text-primary" />
          </div>
        ) : !challenge ? (
          <div className="text-center py-20 text-slate-400 text-sm font-semibold">
            No active challenge this week. Check back soon!
          </div>
        ) : (
          <div className="space-y-6">
            {message && (
              <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-semibold">
                {message}
              </div>
            )}

            <div className="bg-white rounded-3xl p-6 border border-amber-200 shadow-md space-y-4">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-amber-500 text-white">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-500 block">
                    This Week's Challenge
                  </span>
                  <h2 className="font-extrabold text-slate-800">{challenge.title}</h2>
                </div>
              </div>

              <p className="text-sm text-slate-600 leading-relaxed">{challenge.description}</p>

              <div className="flex flex-wrap gap-3">
                <span className="text-[10px] font-bold text-indigo-500 bg-indigo-50 px-3 py-1 rounded-full">
                  {challenge.skillTag}
                </span>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full flex items-center space-x-1">
                  <Trophy className="w-3 h-3" />
                  <span>{challenge.xpReward} XP</span>
                </span>
                <span className="text-[10px] font-bold text-slate-500 bg-slate-50 px-3 py-1 rounded-full flex items-center space-x-1">
                  <Clock className="w-3 h-3" />
                  <span>Deadline: {new Date(challenge.deadline).toLocaleDateString()}</span>
                </span>
              </div>
            </div>

            {submission ? (
              <div className="bg-emerald-50 rounded-2xl p-5 border border-emerald-100 flex items-start space-x-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                <div>
                  <h3 className="font-extrabold text-emerald-700 text-sm">Already Submitted</h3>
                  <p className="text-xs text-emerald-600 mt-1">
                    You submitted on {new Date(submission.submittedAt).toLocaleDateString()}.
                    {submission.responseLink && (
                      <> Link: <a href={submission.responseLink} className="underline" target="_blank" rel="noreferrer">{submission.responseLink}</a></>
                    )}
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm space-y-4">
                <h3 className="font-extrabold text-slate-700 text-sm">Submit Your Work</h3>
                <textarea
                  placeholder="Describe your solution or paste your work..."
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none resize-none"
                />
                <input
                  type="url"
                  placeholder="Link to your project (GitHub, hosted page, etc.)"
                  value={responseLink}
                  onChange={(e) => setResponseLink(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-primary/10 focus:border-primary outline-none"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 bg-primary text-white rounded-xl text-xs font-bold hover:bg-primary-dark transition-all flex items-center space-x-1"
                >
                  {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Submit Challenge</span>
                </button>
              </form>
            )}
          </div>
        )}
      </main>
    </AppLayout>
  );
}
