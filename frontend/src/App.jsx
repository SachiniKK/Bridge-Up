import React, { useState } from 'react';
import Header from './components/common/Header';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [skillRatings, setSkillRatings] = useState({});

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const handleReset = () => {
    setCurrentStep(1);
    setSelectedRoles([]);
    setSkillRatings({});
  };

  return (
    <div className="min-h-screen flex flex-col pb-16">
      <Header currentStep={currentStep} onBackToRoadmap={handleReset} />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center">
        {currentStep === 1 && (
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Step 1: Role Selection</h2>
            <p className="text-slate-500 mb-6">Coming in Part 2</p>
            <button 
              onClick={handleNextStep}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
            >
              Continue
            </button>
          </div>
        )}

        {currentStep === 2 && (
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Step 2: Skill Check</h2>
            <p className="text-slate-500 mb-6">Coming in Part 3</p>
            <div className="flex gap-4 justify-center">
              <button 
                onClick={handlePrevStep}
                className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-bold transition-all"
              >
                Back
              </button>
              <button 
                onClick={handleNextStep}
                className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
              >
                Generate my roadmap
              </button>
            </div>
          </div>
        )}

        {currentStep === 3 && (
          <div className="text-center p-8 bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full animate-fade-in">
            <h2 className="text-2xl font-bold mb-4">Step 3: Roadmap</h2>
            <p className="text-slate-500 mb-6">Coming in Part 4</p>
            <button 
              onClick={handleReset}
              className="px-6 py-3 bg-primary hover:bg-primary-dark text-white rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
            >
              Restart
            </button>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;