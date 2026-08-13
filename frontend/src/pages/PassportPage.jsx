import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { api, getStudentId } from '../lib/api';
import { useAuth } from '../hooks/useAuth';
import { ShieldAlert, CheckCircle, Globe, Share2, Printer, Loader2, BookOpen, ExternalLink } from 'lucide-react';

export default function PassportPage() {
  const { user, handleLogout } = useAuth();
  const { token } = useParams();
  const navigate = useNavigate();
  const studentId = getStudentId();

  const [passport, setPassport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sharing, setSharing] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadPassport();
  }, [token]);

  async function loadPassport() {
    try {
      if (token) {
        const data = await api.getSharedPassport(token);
        setPassport(data);
      } else {
        if (!studentId) {
          navigate('/login');
          return;
        }
        const data = await api.getPassport(studentId);
        setPassport(data);
      }
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleVisibility() {
    if (!passport || token) return;
    setSharing(true);
    try {
      const nextPublic = !passport.passport.isPublic;
      await api.updatePassportSharing(studentId, nextPublic);
      setPassport(prev => ({
        ...prev,
        passport: { ...prev.passport, isPublic: nextPublic }
      }));
      setMessage(nextPublic ? 'Passport is now PUBLIC. You can share your link!' : 'Passport is now PRIVATE.');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setSharing(false);
    }
  }

  function handlePrint() {
    window.print();
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!passport) {
    return (
      <AppLayout user={user} onLogout={handleLogout}>
        <div className="p-8 max-w-md mx-auto text-center space-y-4 py-20">
          <ShieldAlert className="w-12 h-12 text-slate-400 mx-auto" />
          <h2 className="text-lg font-black text-slate-850">Passport Not Available</h2>
          <p className="text-xs text-slate-500 font-semibold leading-relaxed">
            {message || "We couldn't load your skill passport. Please make sure you have generated a learning roadmap first."}
          </p>
        </div>
      </AppLayout>
    );
  }

  const shareUrl = passport?.passport ? `${window.location.origin}/passport/share/${passport.passport.shareToken}` : '';

  const passportContent = passport && (
    <div className="bg-white rounded-[36px] p-8 border-2 border-slate-100 shadow-lg relative overflow-hidden print:border-0 print:shadow-none">
      {/* Header design */}
      <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6">
        <div>
          <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
            DEMOCRATIC SKILLS PORTFOLIO
          </span>
          <h2 className="text-3xl font-black text-slate-800 tracking-tight mt-1">
            {passport.student.name}
          </h2>
          <p className="text-xs font-bold text-slate-400 mt-1">
            Level {passport.student.level} Student · verified on BridgeUp Skill Network
          </p>
        </div>
        
        <div className="text-right">
          <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">
            ✓ Verified Account
          </span>
        </div>
      </div>

      {/* Grid fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8">
        
        {/* Left: Verified Skills list */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <CheckCircle className="w-4 h-4 text-emerald-500" />
            <span>Verified Skills ({passport.verifiedSkills.length})</span>
          </h3>

          {passport.verifiedSkills.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
              <ShieldAlert className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-xs text-slate-400 font-semibold">
                No verified skills yet.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {passport.verifiedSkills.map(sk => (
                <div key={sk.skillName} className="bg-emerald-50/20 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-slate-800">{sk.skillName}</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">Verified on BridgeUp Skill Network</p>
                  </div>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-lg">
                    100% Verified
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: In Progress Skills list */}
        <div className="space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
            <span>In Progress / Unverified ({passport.inProgressSkills.length})</span>
          </h3>

          {passport.inProgressSkills.length === 0 ? (
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 text-center">
              <p className="text-xs text-slate-400 font-semibold">
                No skills in progress.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {passport.inProgressSkills.map(sk => (
                <div key={sk.skillName} className="bg-slate-50/50 border border-slate-100 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-extrabold text-slate-700">{sk.skillName}</h4>
                    <span className="text-[9px] font-bold text-slate-400">In Progress</span>
                  </div>
                  
                  <div className="flex space-x-2">
                    <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md ${
                      sk.isQuizPassed ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                    }`}>
                      Quiz: {sk.isQuizPassed ? 'Passed' : 'Pending'}
                    </span>
                    <span className={`text-[8px] font-extrabold px-2 py-0.5 rounded-md ${
                      sk.isPeerApproved ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'
                    }`}>
                      Peer Review: {sk.isPeerApproved ? 'Approved' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Completed Courses */}
      {passport.completedCourses && passport.completedCourses.length > 0 && (
        <div className="mt-8 space-y-4">
          <h3 className="font-extrabold text-xs text-slate-400 uppercase tracking-wider flex items-center space-x-1.5">
            <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
            <span>Completed Courses &amp; Resources ({passport.completedCourses.length})</span>
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {passport.completedCourses.map(course => {
              const typeColors = {
                youtube: 'bg-red-50 text-red-600',
                coursera: 'bg-blue-50 text-blue-600',
                edx: 'bg-purple-50 text-purple-700',
                ibm: 'bg-blue-50 text-blue-800',
              };
              const typeLabel = {
                youtube: 'YouTube',
                coursera: 'Coursera',
                edx: 'edX',
              };
              const colorClass = typeColors[course.type] || 'bg-slate-50 text-slate-600';
              const label = typeLabel[course.type] || course.type;

              return (
                <a
                  key={course.id}
                  href={course.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-start gap-3 bg-slate-50/60 border border-slate-100 rounded-2xl p-4 hover:border-indigo-200 hover:bg-indigo-50/30 transition-all"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-slate-700 leading-snug group-hover:text-indigo-700 transition-colors line-clamp-2">
                        {course.title}
                      </p>
                      <ExternalLink className="w-3 h-3 text-slate-300 group-hover:text-indigo-400 flex-shrink-0 mt-0.5 transition-colors" />
                    </div>
                    <div className="flex items-center gap-2 mt-1.5">
                      <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-md ${colorClass}`}>
                        {label}
                      </span>
                      <span className="text-[9px] text-slate-400 font-semibold">
                        {course.skillName}
                      </span>
                      <span className="text-[9px] text-slate-300 font-medium ml-auto">
                        {new Date(course.completedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer watermark */}
      <div className="border-t border-slate-100 mt-8 pt-6 flex justify-between items-center text-[10px] text-slate-400 font-semibold">
        <span>Powered by BridgeUp.lk</span>
        <span>Verification Key: {passport.passport.id.substring(0, 18)}</span>
      </div>
    </div>
  );

  // If token is present, render public layout
  if (token) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 md:p-12 font-sans flex items-center justify-center">
        <div className="max-w-4xl w-full space-y-6">
          <div className="flex justify-between items-center px-4">
            <h1 className="text-lg font-black text-slate-800">BridgeUp Verified Talent Network</h1>
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-600 flex items-center space-x-1 hover:bg-slate-50"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Passport</span>
            </button>
          </div>
          {passportContent}
        </div>
      </div>
    );
  }

  return (
    <AppLayout user={user} onLogout={handleLogout}>
      <header className="w-full bg-white border-b border-slate-100 py-6 px-8 sticky top-0 z-40 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
        <div>
          <span className="text-[10px] font-extrabold text-primary bg-indigo-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
            ★ VERIFIED PORTFOLIO
          </span>
          <h1 className="text-2xl font-extrabold text-slate-800 mt-2">Skill Passport</h1>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Display your certified capabilities validated by automated testing and peer reviews. Share with local recruiters.
          </p>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={handlePrint}
            className="px-4 py-2 border border-slate-200 text-slate-600 rounded-xl text-xs font-bold hover:bg-slate-50 transition-all flex items-center space-x-1.5"
          >
            <Printer className="w-4 h-4" />
            <span>Print / PDF</span>
          </button>
        </div>
      </header>

      <main className="p-6 md:p-8 max-w-5xl w-full mx-auto space-y-8">
        {message && (
          <div className="p-3 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-bold animate-fade-in print:hidden">
            {message}
          </div>
        )}

        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4 print:hidden">
          <div className="space-y-1">
            <h3 className="font-extrabold text-slate-800 text-sm flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Public Sharing settings</span>
            </h3>
            <p className="text-[11px] text-slate-400 font-semibold leading-relaxed">
              When public, recruiters can view your verified Skill Passport page via a direct URL link.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {passport.passport.isPublic && (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 text-xs font-mono text-slate-600">
                <span className="truncate max-w-xs">{shareUrl}</span>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(shareUrl);
                    setMessage('Share link copied to clipboard!');
                  }}
                  className="p-1 hover:bg-slate-200 rounded text-slate-500"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            <button
              onClick={handleToggleVisibility}
              disabled={sharing}
              className={`px-4 py-2.5 text-xs font-bold rounded-xl transition-all ${
                passport.passport.isPublic
                  ? 'bg-rose-50 text-rose-600 border border-rose-100'
                  : 'bg-primary text-white hover:bg-primary-dark'
              }`}
            >
              {sharing ? 'Processing...' : passport.passport.isPublic ? 'Make Private' : 'Make Passport Public'}
            </button>
          </div>
        </div>

        {passportContent}
      </main>
    </AppLayout>
  );
}
