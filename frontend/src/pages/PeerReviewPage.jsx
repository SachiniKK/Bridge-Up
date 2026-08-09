import React, { useState, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { api, getStudentId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { Check, X, ShieldAlert, Award, FileText, Link as LinkIcon, Loader2 } from 'lucide-react';

export default function PeerReviewPage() {
  const { user, handleLogout } = useAuth();
  const studentId = getStudentId();

  const [myClaims, setMyClaims] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [message, setMessage] = useState('');

  // Submit Claim Form state
  const [claimSkill, setClaimSkill] = useState('REST APIs');
  const [claimText, setClaimText] = useState('');
  const [claimLink, setClaimLink] = useState('');

  // Peer review comments state
  const [reviewComments, setReviewComments] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const my = await api.getStudentVerifications(studentId);
      setMyClaims(my);

      const pending = await api.getPendingVerifications(studentId);
      setPendingReviews(pending);
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmitClaim(e) {
    e.preventDefault();
    if (!claimText.trim() && !claimLink.trim()) {
      alert('Please provide either description text or a link as evidence.');
      return;
    }
    setSubmittingClaim(true);
    setMessage('');
    try {
      await api.submitVerification(studentId, {
        skillName: claimSkill,
        responseText: claimText,
        responseLink: claimLink
      });
      setMessage('Verification claim submitted successfully! Added to peer queue.');
      setClaimText('');
      setClaimLink('');
      await loadData();
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSubmittingClaim(false);
    }
  }

  async function handleReview(verificationId, approved) {
    try {
      const comment = reviewComments[verificationId] || '';
      await api.reviewVerification(studentId, verificationId, approved, comment);
      setMessage(approved ? 'Approved peer skill verification claim.' : 'Rejected peer skill verification claim.');
      
      // Clear comment field
      setReviewComments(prev => {
        const copy = { ...prev };
        delete copy[verificationId];
        return copy;
      });

      await loadData();
    } catch (err) {
      setMessage(err.message);
    }
  }

  function handleCommentChange(verificationId, value) {
    setReviewComments(prev => ({ ...prev, [verificationId]: value }));
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
      <header className="w-full bg-white border-b border-slate-100 py-6 px-8 sticky top-0 z-40 shadow-sm">
        <span className="text-[10px] font-extrabold text-primary bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
          ★ DEMOCRATIC VERIFICATION
        </span>
        <h1 className="text-2xl font-extrabold text-slate-800 mt-2">Peer Reviews</h1>
        <p className="text-slate-400 text-xs font-semibold mt-1">
          Unlocking skills requires consensus. Submit evidence of your work, and evaluate other students' code.
        </p>
      </header>

      <main className="p-6 md:p-8 max-w-7xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Submit Claim and My Claims (7 cols) */}
        <div className="lg:col-span-7 space-y-8">
          
          {message && (
            <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold animate-fade-in">
              {message}
            </div>
          )}

          {/* Claim Submission Form */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Submit Skill Claim</h2>
            
            <form onSubmit={handleSubmitClaim} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Select Skill</label>
                <select
                  value={claimSkill}
                  onChange={(e) => setClaimSkill(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-100 outline-none bg-slate-50 focus:bg-white"
                >
                  <option value="REST APIs">REST APIs</option>
                  <option value="Git & Version Control">Git & Version Control</option>
                  <option value="SQL / Databases">SQL / Databases</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">Evidence Description</label>
                <textarea
                  placeholder="Explain how you implemented this skill. E.g. 'I created an Express app containing standard HTTP routes, with JWT validation for auth routes...'"
                  value={claimText}
                  onChange={(e) => setClaimText(e.target.value)}
                  rows="3"
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-100 outline-none focus:border-primary"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase">GitHub / Code URL Link</label>
                <input
                  type="url"
                  placeholder="https://github.com/username/project"
                  value={claimLink}
                  onChange={(e) => setClaimLink(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs font-semibold rounded-xl border border-slate-100 outline-none focus:border-primary"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={submittingClaim}
                  className="w-full py-3 bg-primary text-white font-extrabold text-xs rounded-xl hover:bg-primary-dark transition-all"
                >
                  {submittingClaim ? 'Submitting claim...' : 'Submit Claim to Peer Network'}
                </button>
              </div>
            </form>
          </div>

          {/* My Claims List */}
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">My Claims Status</h2>

            {myClaims.length === 0 ? (
              <p className="text-xs text-slate-400 font-semibold py-4 text-center">
                You have not submitted any skill verifications yet.
              </p>
            ) : (
              <div className="space-y-3">
                {myClaims.map(c => (
                  <div key={c.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col justify-between space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-slate-850">{c.skillName}</span>
                      <span className={`text-[9px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                        c.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                        c.status === 'rejected' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {c.status}
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                      "{c.responseText || 'No description provided'}"
                    </p>

                    {c.responseLink && (
                      <a href={c.responseLink} target="_blank" rel="noreferrer" className="text-[10px] text-primary font-bold flex items-center gap-1 hover:underline">
                        <LinkIcon className="w-3 h-3" />
                        <span>View Evidence URL</span>
                      </a>
                    )}

                    {c.reviews && c.reviews.length > 0 && (
                      <div className="pt-2 border-t border-slate-200/50 mt-1 space-y-1">
                        <h4 className="text-[9px] font-extrabold text-slate-400 uppercase tracking-wider">Peer Feedback:</h4>
                        {c.reviews.map((r, rIdx) => (
                          <div key={rIdx} className="text-[10px] text-slate-500 flex items-start gap-1">
                            <span className="font-extrabold">{r.reviewer.name}:</span>
                            <span>{r.approved ? 'Approve' : 'Reject'} {r.comment ? `- "${r.comment}"` : ''}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Peer Reviews Queue (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm space-y-4">
            <h2 className="text-sm font-extrabold text-slate-800 uppercase tracking-wider">Reviews Queue</h2>
            <p className="text-[11px] text-slate-400 leading-relaxed font-semibold">
              Review code and claims submitted by students in your cohort. Double check links before voting.
            </p>

            {pendingReviews.length === 0 ? (
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
                <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs text-slate-400 font-semibold">
                  Queue is clean! No pending reviews at the moment.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingReviews.map(pr => (
                  <div key={pr.id} className="border border-slate-100 rounded-2xl p-4 space-y-3 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-800">{pr.student.name}</h4>
                        <p className="text-[9px] font-bold text-slate-450">Claiming: {pr.skillName}</p>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 leading-relaxed italic">
                      "{pr.responseText || 'No description provided'}"
                    </p>

                    {pr.responseLink && (
                      <a
                        href={pr.responseLink}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] text-primary font-bold inline-flex items-center gap-1 hover:underline bg-white border border-slate-100 px-2.5 py-1.5 rounded-xl shadow-sm"
                      >
                        <LinkIcon className="w-3 h-3" />
                        <span>Inspect Submission Link</span>
                      </a>
                    )}

                    <div className="pt-2 border-t border-slate-200/40 space-y-2">
                      <input
                        type="text"
                        placeholder="Add optional review comment..."
                        value={reviewComments[pr.id] || ''}
                        onChange={(e) => handleCommentChange(pr.id, e.target.value)}
                        className="w-full px-3 py-1.5 text-[10px] rounded-lg border border-slate-100 outline-none focus:border-primary bg-white"
                      />

                      <div className="flex gap-2">
                        <button
                          onClick={() => handleReview(pr.id, true)}
                          className="flex-1 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-lg text-[10px] font-black flex items-center justify-center space-x-1"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => handleReview(pr.id, false)}
                          className="flex-1 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded-lg text-[10px] font-black flex items-center justify-center space-x-1"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </AppLayout>
  );
}
