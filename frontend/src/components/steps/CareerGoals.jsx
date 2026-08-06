import React, { useState, useEffect } from 'react';
import { ArrowLeft } from 'lucide-react';

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

export default function CareerGoals({ selectedRoles, onChange, onBack, onCreate }) {
  const [isValid, setIsValid] = useState(false);

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
                
                return (
                  <button
                    key={role}
                    type="button"
                    onClick={() => handleToggleRole(role)}
                    className={`px-4 py-2 rounded-full text-xs md:text-sm font-semibold border select-none transition-all active:scale-[0.97] cursor-pointer ${
                      isSelected
                        ? 'bg-primary border-primary text-white shadow-md shadow-primary/20'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    {role}
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
