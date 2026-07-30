import React, { useState } from 'react';
import SignupSidebar from './components/common/SignupSidebar';
import YourBasics from './components/steps/YourBasics';
import AcademicInfo from './components/steps/AcademicInfo';

function App() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    age: '',
    city: '',
    university: '',
    degree: '',
    currentYear: '',
    aboutMe: '',
    selectedRoles: [],
  });

  const handleUpdateFormData = (fields) => {
    setFormData((prev) => ({
      ...prev,
      ...fields,
    }));
  };

  const handleNextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const handlePrevStep = () => {
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const steps = [
    { id: 1, label: 'Your basics' },
    { id: 2, label: 'Academic info' },
    { id: 3, label: 'Career goals' }
  ];

  return (
    <div className="min-h-screen bg-slate-100/50 flex items-center justify-center p-4 md:p-6 font-sans">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-50/80 backdrop-blur-md rounded-[36px] p-3 shadow-xl border border-white/60 items-slate-stretch min-h-[700px]">
        
        {/* Left Column: Indigo Info Sidebar */}
        <div className="lg:col-span-4 flex">
          <SignupSidebar />
        </div>

        {/* Right Column: Signup Multi-Step Form */}
        <div className="lg:col-span-8 bg-slate-50/30 rounded-3xl p-6 md:p-10 flex flex-col justify-between">
          
          {/* Top Navbar Options */}
          <div className="flex items-center justify-between mb-8">
            <button className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors select-none">
              ← Back to home
            </button>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-slate-500">Already have an account?</span>
              <button className="px-3.5 py-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-all rounded-full hover:bg-primary/5 active:scale-95">
                Log in →
              </button>
            </div>
          </div>

          {/* Stepper Progress Bar */}
          <div className="w-full grid grid-cols-3 gap-4 mb-10">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              return (
                <div key={step.id} className="space-y-2 select-none">
                  {/* Step Underline */}
                  <div 
                    className={`h-1.5 rounded-full transition-all duration-500 ${
                      isActive || isCompleted 
                        ? 'bg-gradient-to-r from-primary to-indigo-400' 
                        : 'bg-slate-200'
                    }`}
                  />
                  {/* Step Title Label */}
                  <div className="flex items-center space-x-2 px-1">
                    <span 
                      className={`text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-bold ${
                        isActive || isCompleted 
                          ? 'bg-primary text-white' 
                          : 'bg-slate-200 text-slate-400'
                      }`}
                    >
                      {step.id}
                    </span>
                    <span 
                      className={`text-[10px] md:text-xs font-bold tracking-tight ${
                        isActive || isCompleted ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Active Step Forms */}
          <div className="flex-1 flex flex-col justify-center">
            {currentStep === 1 && (
              <YourBasics 
                formData={formData}
                onChange={handleUpdateFormData}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 2 && (
              <AcademicInfo 
                formData={formData}
                onChange={handleUpdateFormData}
                onBack={handlePrevStep}
                onNext={handleNextStep}
              />
            )}

            {currentStep === 3 && (
              <div className="text-center p-8 bg-white rounded-2xl shadow-md border border-slate-100 animate-fade-in">
                <h2 className="text-2xl font-bold mb-4">Career Goals Selection</h2>
                <p className="text-slate-500 mb-6">Coming in Part 4</p>
                <div className="flex gap-4 justify-center">
                  <button 
                    onClick={handlePrevStep}
                    className="px-6 py-2.5 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold transition-all"
                  >
                    Back
                  </button>
                  <button 
                    onClick={() => alert(JSON.stringify(formData, null, 2))}
                    className="px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white rounded-xl font-bold transition-all"
                  >
                    Create my profile 🎉
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;