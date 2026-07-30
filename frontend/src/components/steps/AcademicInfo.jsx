import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, AlertCircle } from 'lucide-react';

const lkUniversities = [
  'University of Colombo',
  'University of Moratuwa',
  'University of Kelaniya',
  'University of Sri Jayewardenepura',
  'University of Peradeniya',
  'University of Ruhuna',
  'University of Jaffna',
  'SLIIT (Sri Lanka Institute of Information Technology)',
  'IIT (Informatics Institute of Technology)',
  'NIBM (National Institute of Business Management)',
  'APIIT (Asia Pacific Institute of Information Technology)',
  'NSBM Green University'
];

const academicYears = ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Graduated'];

export default function AcademicInfo({ formData, onChange, onBack, onNext }) {
  const [showErrors, setShowErrors] = useState(false);
  const [errors, setErrors] = useState({});

  const { university, degree, currentYear, aboutMe } = formData;

  const validateForm = () => {
    const newErrors = {};

    if (!university) {
      newErrors.university = 'Please select your university.';
    } else if (!lkUniversities.includes(university)) {
      newErrors.university = 'Invalid university selection.';
    }

    if (!degree.trim()) {
      newErrors.degree = 'Degree / Faculty is required.';
    }

    if (!currentYear) {
      newErrors.currentYear = 'Please select your current year.';
    } else if (!academicYears.includes(currentYear)) {
      newErrors.currentYear = 'Invalid academic year selection.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  useEffect(() => {
    if (showErrors) {
      validateForm();
    }
  }, [formData, showErrors]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  const handleContinue = (e) => {
    e.preventDefault();
    setShowErrors(true);
    const isValid = validateForm();
    if (isValid) {
      onNext();
    }
  };

  return (
    <form onSubmit={handleContinue} className="bg-white rounded-3xl p-6 md:p-8 border border-slate-100 shadow-lg animate-fade-in space-y-6">
      
      {/* Step Badge */}
      <div>
        <span className="px-3.5 py-1.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100/50">
          Step 2 · Academic Info
        </span>
      </div>

      {/* Title & Subtitle */}
      <div>
        <h2 className="text-2xl font-extrabold tracking-tight text-[#1e1b4b] leading-tight mb-2">
          Your academic background
        </h2>
        <p className="text-slate-500 text-xs md:text-sm leading-relaxed">
          We map your degree to what local employers expect from your field and year.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        
        {/* University Dropdown */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            University
          </label>
          <select
            name="university"
            value={university}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 transition-all outline-none text-sm font-medium text-slate-700 cursor-pointer ${
              showErrors && errors.university
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-primary focus:ring-primary/10'
            }`}
          >
            <option value="">Select your university</option>
            {lkUniversities.map((uni) => (
              <option key={uni} value={uni}>
                {uni}
              </option>
            ))}
          </select>
          {showErrors && errors.university && (
            <p className="text-xs font-semibold text-rose-500 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.university}</span>
            </p>
          )}
        </div>

        {/* Degree & Current Year */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* Degree Text Field */}
          <div className="md:col-span-2 space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Degree / Faculty
            </label>
            <input
              type="text"
              name="degree"
              placeholder="e.g. BSc Computer Science"
              value={degree}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 transition-all outline-none text-sm font-medium ${
                showErrors && errors.degree
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:border-primary focus:ring-primary/10'
              }`}
            />
            {showErrors && errors.degree && (
              <p className="text-xs font-semibold text-rose-500 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.degree}</span>
              </p>
            )}
          </div>

          {/* Current Year Dropdown */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Current Year
            </label>
            <select
              name="currentYear"
              value={currentYear}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 transition-all outline-none text-sm font-medium text-slate-700 cursor-pointer ${
                showErrors && errors.currentYear
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:border-primary focus:ring-primary/10'
              }`}
            >
              <option value="">Select year</option>
              {academicYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>
            {showErrors && errors.currentYear && (
              <p className="text-xs font-semibold text-rose-500 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.currentYear}</span>
              </p>
            )}
          </div>

        </div>

        {/* About Me Textarea */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              About Me <span className="text-slate-400 font-medium lowercase">(optional)</span>
            </label>
            <span className="text-[10px] text-slate-400 font-medium">helps mentors understand you</span>
          </div>
          <textarea
            name="aboutMe"
            rows={4}
            placeholder="e.g. I'm a Year 3 CS student interested in backend development. I've done a bit of Python but I've never built a full project outside of coursework..."
            value={aboutMe}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm font-medium resize-none leading-relaxed"
          />
        </div>

      </div>

      {/* Footer Controls */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center space-x-2 px-6 py-2.5 rounded-xl font-bold text-sm text-slate-500 hover:text-slate-800 border border-slate-200 hover:bg-slate-50 transition-all active:scale-[0.98]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>

        <button
          type="submit"
          className="flex items-center space-x-2 px-8 py-3 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98] bg-primary hover:bg-primary-dark text-white shadow-primary/25 hover:shadow-lg hover:shadow-primary/30"
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

    </form>
  );
}
