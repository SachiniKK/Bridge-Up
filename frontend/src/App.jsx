import React, { useState } from 'react';
import SignupSidebar from './components/common/SignupSidebar';
import YourBasics from './components/steps/YourBasics';
import AcademicInfo from './components/steps/AcademicInfo';
import CareerGoals from './components/steps/CareerGoals';
import Login from './components/auth/Login';
import Dashboard from './components/dashboard/Dashboard';

function App() {
  const [view, setView] = useState('signup'); // 'signup' | 'login' | 'dashboard'
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  
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

  const handleReset = () => {
    setCurrentStep(1);
    setRegisteredUser(null);
    setView('signup');
    setFormData({
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
  };

  const handleRegisterSubmit = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      setRegisteredUser(data.user);
      setView('dashboard');
    } catch (error) {
      alert(error.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const steps = [
    { id: 1, label: 'Your basics' },
    { id: 2, label: 'Academic info' },
    { id: 3, label: 'Career goals' }
  ];

  // Render Login view
  if (view === 'login') {
    return (
      <div className="min-h-screen bg-slate-100/50 flex flex-col font-sans">
        {/* Login Page Header */}
        <header className="w-full bg-white border-b border-slate-100 py-4 px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
          <div className="flex items-center space-x-1.5 select-none">
            <span className="text-xl font-extrabold tracking-tight text-[#1e1b4b]">
              Skill<span className="text-primary">Bridge</span>
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1"></span>
          </div>
        </header>

        {/* Login Form Container */}
        <main className="flex-1 flex items-center justify-center p-4 py-12">
          <Login 
            onSignUpClick={() => setView('signup')} 
            onLoginSuccess={(user) => {
              setRegisteredUser(user);
              setView('dashboard');
            }}
          />
        </main>
      </div>
    );
  }

  // Render Dashboard view
  if (view === 'dashboard' && registeredUser) {
    return (
      <Dashboard 
        user={registeredUser} 
        onLogout={handleReset} 
      />
    );
  }

  // Render Signup flow view
  return (
    <div className="min-h-screen bg-slate-100/50 flex items-center justify-center p-4 md:p-6 font-sans">
      <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-4 bg-slate-50/80 backdrop-blur-md rounded-[36px] p-3 shadow-xl border border-white/60 items-slate-stretch min-h-[700px]">
        
        {/* Left Column: Indigo Info Sidebar */}
        <div className="lg:col-span-4 flex">
          <SignupSidebar />
        </div>

        {/* Right Column: Signup Multi-Step Form */}
        <div className="lg:col-span-8 bg-slate-50/30 rounded-3xl p-6 md:p-10 flex flex-col justify-between relative overflow-hidden">
          
          {/* Loader Overlay */}
          {isLoading && (
            <div className="absolute inset-0 bg-slate-50/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              <span className="text-sm font-semibold text-slate-600">Creating your profile...</span>
            </div>
          )}

          {/* Top Navbar Options */}
          <div className="flex items-center justify-between mb-8">
            <button className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors select-none">
              ← Back to home
            </button>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-slate-500">Already have an account?</span>
              <button 
                onClick={() => setView('login')}
                className="px-3.5 py-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-all rounded-full hover:bg-primary/5 active:scale-95 cursor-pointer"
              >
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
              <CareerGoals 
                selectedRoles={formData.selectedRoles}
                onChange={(roles) => handleUpdateFormData({ selectedRoles: roles })}
                onBack={handlePrevStep}
                onCreate={handleRegisterSubmit}
              />
            )}
          </div>

        </div>
      </div>
    </div>
  );
}

export default App;