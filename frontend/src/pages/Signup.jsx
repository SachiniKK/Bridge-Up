import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api, saveAuthSession } from '../lib/api';
import SignupSidebar from '../components/common/SignupSidebar';
import YourBasics from '../components/steps/YourBasics';
import AcademicInfo from '../components/steps/AcademicInfo';
import CareerGoals from '../components/steps/CareerGoals';
import { CheckCircle2, User, Mail, GraduationCap, Compass } from 'lucide-react';

export default function Signup() {
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [registeredUser, setRegisteredUser] = useState(null);
  const [authToken, setAuthToken] = useState(null);
  const [studentId, setStudentId] = useState(null);

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
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const handleNextStep = () => setCurrentStep((prev) => prev + 1);
  const handlePrevStep = () => setCurrentStep((prev) => Math.max(1, prev - 1));

  const handleRegisterSubmit = async () => {
    setIsLoading(true);
    try {
      const data = await api.register(formData);

      setRegisteredUser(data.user);
      setAuthToken(data.token);
      setStudentId(data.studentId);
      setCurrentStep(4);
    } catch (error) {
      alert(error.message || 'An error occurred during registration.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartLearning = () => {
    saveAuthSession({ user: registeredUser, token: authToken, studentId });
    navigate('/roadmap-builder');
  };

  const handleGoToDashboard = () => {
    saveAuthSession({ user: registeredUser, token: authToken, studentId });
    navigate('/dashboard');
  };

  const steps = [
    { id: 1, label: 'Your basics' },
    { id: 2, label: 'Academic info' },
    { id: 3, label: 'Career goals' },
  ];

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

          {/* Top Navbar Options (Hidden in success step) */}
          {currentStep <= 3 && (
            <div className="flex items-center justify-between mb-8">
              <button className="text-xs font-semibold text-slate-400 hover:text-slate-700 transition-colors select-none">
                ← Back to home
              </button>
              <div className="flex items-center space-x-1">
                <span className="text-xs font-medium text-slate-500">Already have an account?</span>
                <button
                  onClick={() => navigate('/login')}
                  className="px-3.5 py-1.5 text-xs font-bold text-primary hover:text-primary-dark transition-all rounded-full hover:bg-primary/5 active:scale-95 cursor-pointer"
                >
                  Log in →
                </button>
              </div>
            </div>
          )}

          {/* Stepper Progress Bar (Hidden in success step) */}
          {currentStep <= 3 && (
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
          )}

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
                aboutMe={formData.aboutMe}
                onChange={(roles) => handleUpdateFormData({ selectedRoles: roles })}
                onBack={handlePrevStep}
                onCreate={handleRegisterSubmit}
              />
            )}

            {/* Success Step Card */}
            {currentStep === 4 && registeredUser && (
              <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-xl animate-fade-in space-y-6 text-center max-w-xl mx-auto">
                <div className="flex justify-center">
                  <CheckCircle2 className="w-16 h-16 text-emerald-500 fill-emerald-50 animate-bounce" />
                </div>

                <div className="space-y-2">
                  <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                    Welcome, {registeredUser.firstName}! 🎉
                  </h1>
                  <p className="text-slate-500 text-sm leading-relaxed">
                    Your student profile has been created successfully. We've customized your learning roadmap based on local employer signals.
                  </p>
                </div>

                {/* Profile Recap Summary */}
                <div className="bg-slate-50 rounded-2xl p-5 text-left border border-slate-100 space-y-3.5">
                  <div className="flex items-center space-x-3 text-slate-600">
                    <User className="w-4.5 h-4.5 text-slate-400" />
                    <span className="text-xs font-semibold">
                      {registeredUser.firstName} {registeredUser.lastName} ({registeredUser.age} years old)
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Mail className="w-4.5 h-4.5 text-slate-400" />
                    <span className="text-xs font-semibold">{registeredUser.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-600">
                    <GraduationCap className="w-4.5 h-4.5 text-slate-400" />
                    <span className="text-xs font-semibold">
                      {registeredUser.degree} at {registeredUser.university}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3 text-slate-600">
                    <Compass className="w-4.5 h-4.5 text-slate-400" />
                    <div className="flex flex-wrap gap-1.5">
                      {registeredUser.selectedRoles.map((role) => (
                        <span
                          key={role}
                          className="px-2 py-0.5 rounded-md bg-white border border-slate-200 text-[10px] font-bold text-slate-600"
                        >
                          {role}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={handleStartLearning}
                    className="flex-1 w-full py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-sm shadow-md shadow-primary/25 hover:shadow-lg transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-2"
                  >
                    <span>Build My Roadmap 🚀</span>
                  </button>

                  <button
                    onClick={handleGoToDashboard}
                    className="flex-1 w-full py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-sm transition-all active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1"
                  >
                    <span>Skip to Dashboard</span>
                    <span>→</span>
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
