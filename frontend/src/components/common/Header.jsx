import React from 'react';
import { Check } from 'lucide-react';

export default function Header({ currentStep, onBackToRoadmap }) {
  const steps = [
    { id: 1, label: 'Career goals' },
    { id: 2, label: 'Skill check' },
    { id: 3, label: 'Your roadmap' }
  ];

  // Render Step 3 (Roadmap) Header
  if (currentStep === 3) {
    return (
      <header className="w-full max-w-7xl mx-auto px-6 py-4 flex items-center justify-between border-b border-slate-100 bg-white/50 backdrop-blur-sm sticky top-0 z-50 rounded-b-2xl shadow-sm mb-6">
        <div className="flex items-center space-x-2 select-none">
          <span className="text-2xl font-extrabold tracking-tight text-[#1e1b4b] font-sans">
            Skill<span className="text-primary">Bridge</span>
          </span>
          <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1.5 animate-pulse"></span>
        </div>

        <div className="flex items-center space-x-4">
          <button
            onClick={onBackToRoadmap}
            className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
          >
            <span className="mr-1">←</span> Back to roadmap
          </button>
          <button className="px-4 py-2 text-sm font-semibold text-primary border border-primary/20 rounded-full hover:bg-primary/5 transition-all shadow-sm active:scale-95">
            Share roadmap
          </button>
        </div>
      </header>
    );
  }

  // Render Step 1 & 2 Header with Stepper
  return (
    <header className="w-full max-w-3xl mx-auto px-6 pt-8 pb-4 flex flex-col items-center">
      {/* Brand Logo */}
      <div className="flex items-center space-x-1.5 mb-8 select-none">
        <span className="text-3xl font-extrabold tracking-tight text-[#1e1b4b] font-sans">
          Skill<span className="text-primary">Bridge</span>
        </span>
        <span className="w-3 h-3 rounded-full bg-cyan-400 mt-2"></span>
      </div>

      {/* Stepper Progress Bar */}
      <div className="w-full max-w-md flex items-center justify-between relative mb-6">
        {/* Connection Lines */}
        <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-slate-200 -translate-y-1/2 z-0"></div>
        <div
          className="absolute top-1/2 left-0 h-0.5 bg-primary -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
          style={{
            width: currentStep === 2 ? '50%' : currentStep > 2 ? '100%' : '0%',
          }}
        ></div>

        {/* Step Nodes */}
        {steps.map((step) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <div key={step.id} className="flex flex-col items-center z-10 relative">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm shadow transition-all duration-500 ${
                  isCompleted
                    ? 'bg-primary text-white scale-110'
                    : isActive
                    ? 'bg-primary text-white ring-4 ring-primary/20 scale-110'
                    : 'bg-white text-slate-400 border border-slate-200'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-4 h-4 stroke-[3px]" />
                ) : (
                  step.id
                )}
              </div>
              <span
                className={`text-xs font-semibold mt-2.5 transition-colors duration-300 ${
                  isActive || isCompleted ? 'text-primary' : 'text-slate-400'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
    </header>
  );
}
