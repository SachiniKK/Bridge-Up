import React from 'react';
import { Flame, ShieldAlert, Award } from 'lucide-react';

export default function XPDashboard({ xpData, onToggleStudyMode }) {
  if (!xpData) return null;

  const {
    currentXP,
    level,
    levelName,
    progressPercent,
    nextThreshold,
    streakCount,
    studyModeActive
  } = xpData;

  return (
    <div className="space-y-6">
      {/* XP & Level Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col justify-between relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Level {level}</p>
            <h3 className="text-xl font-bold text-slate-900">{levelName}</h3>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Award className="w-6 h-6" />
          </div>
        </div>

        <div className="mb-4">
          <div className="flex items-baseline gap-1">
            <span className="text-4xl font-extrabold text-slate-900 tracking-tight">
              {currentXP.toLocaleString()}
            </span>
            <span className="text-sm font-semibold text-slate-500">XP</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div>
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-1.5">
            <span>Progress to Next Level</span>
            <span>{nextThreshold ? `${currentXP}/${nextThreshold} XP` : 'Max Level'}</span>
          </div>
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              style={{ width: `${progressPercent}%` }}
              className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
            />
          </div>
        </div>
      </div>

      {/* Streak and Study Mode Status Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl flex items-center justify-center ${
              streakCount > 0 ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-400'
            }`}>
              <Flame className="w-6 h-6 fill-current" />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Daily Streak</p>
              <h4 className="text-lg font-bold text-slate-900">
                {streakCount} {streakCount === 1 ? 'Day' : 'Days'}
              </h4>
            </div>
          </div>
        </div>

        {/* Study Mode Action */}
        <div className="pt-4 border-t border-slate-100 flex flex-col gap-3">
          <div className="flex items-start gap-2.5">
            <ShieldAlert className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
              studyModeActive ? 'text-green-600' : 'text-slate-400'
            }`} />
            <div>
              <h5 className="text-sm font-semibold text-slate-900">Study Mode (Streak Protection)</h5>
              <p className="text-xs text-slate-500 leading-normal">
                Streak is protected from missed-day penalties when active.
              </p>
            </div>
          </div>

          <button
            onClick={onToggleStudyMode}
            className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              studyModeActive
                ? 'bg-green-50 text-green-700 hover:bg-green-100 border border-green-200'
                : 'bg-slate-950 text-white hover:bg-slate-900'
            }`}
          >
            {studyModeActive ? 'Disable Study Mode' : 'Enable Study Mode'}
          </button>
        </div>
      </div>
    </div>
  );
}
