import React, { useState, useEffect } from 'react';
import { ArrowLeft, Sparkles, Loader2 } from 'lucide-react';
import { api } from '../../lib/api';

const roleCategories = [
  {
    title: '💻 Tech Roles',
    key: 'tech',
    roles: [
      'Software Developer',
      'Backend Developer',
      'Frontend Developer',
      'Full Stack Developer',
      'Data Analyst',
      'ML / AI Engineer',
      'DevOps / Cloud',
      'QA Engineer',
      'UI/UX Designer',
    ],
  },
  {
    title: '📊 Business Roles',
    key: 'business',
    roles: [
      'Business Analyst',
      'Marketing Executive',
      'Digital Marketing',
      'Product Manager',
      'HR / People Ops',
    ],
  },
  {
    title: '✍️ Content & Other',
    key: 'content',
    roles: [
      'Content Writer',
      'UX Writer',
      'Journalist / Editor',
      'Research / Policy',
      '🤷‍♂️ Not sure yet',
    ],
  },
];

export default function CareerGoals({ selectedRoles, aboutMe, onChange, onBack, onCreate }) {
  const [isValid, setIsValid] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);

  useEffect(() => {
    setIsValid(selectedRoles.length > 0);
  }, [selectedRoles]);

  const handleToggleRole = (role) => {
    if (selectedRoles.includes(role)) {
      onChange(selectedRoles.filter((r) => r !== role));
    } else {
      onChange([...selectedRoles, role]);
    }
  };

  const handleFetchAISuggestions = async () => {
    if (!aboutMe || !aboutMe.trim()) return;
    setLoadingSuggestions(true);
    try {
      const data = await api.suggestRoles(aboutMe);
      const suggestedRolesList = data.suggestions || [];
      setSuggestions(suggestedRolesList);

      // Auto-select the top suggested role
      if (suggestedRolesList.length > 0) {
        const topRole = suggestedRolesList[0].role;
        if (!selectedRoles.includes(topRole)) {
          onChange([...selectedRoles, topRole]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch AI suggestions:', err);
    } finally {
      setLoadingSuggestions(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-lg animate-fade-in space-y-6">
      
      {/* Step Badge */}
      <div>
        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-100/50">
          Step 3 · Career Goals
        </span>
      </div>

      {/* Title & Subtitle */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#1e1b4b] leading-tight mb-2">
          What roles interest you?
        </h2>
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
          Pick all that apply. We'll map exactly which skills Sri Lankan employers ask for in these roles — not a global job board.
        </p>
      </div>

      {/* AI Suggestions Section */}
      {aboutMe && aboutMe.trim() ? (
        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-4 border border-indigo-100/50 space-y-3">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-5 h-5 text-indigo-600 animate-pulse" />
              <span className="text-xs font-extrabold text-indigo-950 uppercase tracking-wider">
                AI Role Recommendations
              </span>
            </div>
            <button
              type="button"
              onClick={handleFetchAISuggestions}
              disabled={loadingSuggestions}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[10px] rounded-lg shadow-sm transition-all flex items-center space-x-1 cursor-pointer disabled:opacity-50"
            >
              {loadingSuggestions ? (
                <>
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Analyzing bio...</span>
                </>
              ) : (
                <>
                  <span>Suggest Roles</span>
                </>
              )}
            </button>
          </div>

          {suggestions.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                Based on your biography, spaCy NLP matched these top roles. Click to select/deselect them:
              </p>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s) => {
                  const isSelected = selectedRoles.includes(s.role);
                  return (
                    <button
                      key={s.role}
                      type="button"
                      onClick={() => handleToggleRole(s.role)}
                      className={`px-3 py-1.5 rounded-full text-xs font-bold border transition-all flex items-center space-x-1 select-none active:scale-[0.98] cursor-pointer ${
                        isSelected
                          ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                          : 'bg-white border-indigo-100 text-indigo-700 hover:bg-indigo-50/50'
                      }`}
                    >
                      <span>{s.role}</span>
                      <span className="text-[9px] px-1 bg-indigo-100 text-indigo-800 rounded font-black">
                        {s.score} match
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-[10px] text-slate-500 leading-relaxed">
              We found a biography in the previous step. Click the button above to let spaCy scan your interests and suggest matching roles!
            </p>
          )}
        </div>
      ) : (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 text-[10px] text-slate-400 leading-relaxed">
          💡 Want AI suggestions? Go back to the **Academic info** step and fill out the **About Me** biography field with your interests (e.g., "I love design and Figma" or "I like coding databases").
        </div>
      )}

      {/* Categorized Roles Pills Grid */}
      <div className="space-y-6">
        {roleCategories.map((category) => (
          <div key={category.key} className="space-y-3">
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block">
              {category.title}
            </span>
            <div className="flex flex-wrap gap-2.5">
              {category.roles.map((role) => {
                const isSelected = selectedRoles.includes(role);
                const isAISuggested = suggestions.some((s) => s.role === role);
                
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleToggleRole(role)}
                    className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold border select-none transition-all active:scale-[0.97] cursor-pointer flex items-center space-x-1.5 ${
                      isSelected
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <span>{role}</span>
                    {isAISuggested && (
                      <span className={`px-1 text-[8px] font-black uppercase rounded ${
                        isSelected ? 'bg-indigo-700 text-white' : 'bg-indigo-100 text-indigo-800'
                      }`}>
                        AI Match
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Controls */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          onClick={onCreate}
          disabled={!isValid}
          className={`flex items-center space-x-2 px-8 py-3 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98] ${
            !isValid
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-gradient-to-r from-emerald-400 to-teal-500 hover:from-emerald-500 hover:to-teal-600 text-white shadow-emerald-500/20 hover:shadow-lg hover:shadow-emerald-500/30'
          }`}
        >
          <span>Create my profile 🎉</span>
        </button>
      </div>

    </div>
  );
}

