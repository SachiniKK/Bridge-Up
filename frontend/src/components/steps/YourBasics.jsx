import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Timer, ArrowRight, Check, X, AlertCircle } from 'lucide-react';

const lkCities = [
  'Colombo', 'Gampaha', 'Kandy', 'Jaffna', 'Galle', 
  'Negombo', 'Kurunegala', 'Kalutara', 'Batticaloa', 
  'Trincomalee', 'Anuradhapura', 'Ratnapura', 'Matara'
];

export default function YourBasics({ formData, onChange, onNext }) {
  const [showPassword, setShowPassword] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [errors, setErrors] = useState({});

  const { firstName, lastName, email, password, age, city } = formData;

  // Real-time password criteria checklist
  const passwordCriteria = [
    { id: 'length', label: 'At least 8 characters', met: password.length >= 8 },
    { id: 'upper', label: 'One uppercase letter (A-Z)', met: /[A-Z]/.test(password) },
    { id: 'number', label: 'One number (0-9)', met: /[0-9]/.test(password) },
    { id: 'special', label: 'One special character (!@#$...)', met: /[^A-Za-z0-9]/.test(password) }
  ];

  // Dynamic Password strength score (0 to 4)
  const passwordStrength = passwordCriteria.filter(c => c.met).length;

  // Run validation checks
  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) {
      newErrors.firstName = 'First name is required.';
    }

    if (!lastName.trim()) {
      newErrors.lastName = 'Last name is required.';
    }

    if (!email.trim()) {
      newErrors.email = 'University email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    } else if (!email.toLowerCase().endsWith('.lk')) {
      newErrors.email = 'Please use a Sri Lankan university email ending in .lk.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    } else {
      const unmet = passwordCriteria.filter(c => !c.met);
      if (unmet.length > 0) {
        newErrors.password = `Password is too weak. Missing: ${unmet.map(c => c.label.toLowerCase()).join(', ')}.`;
      }
    }

    if (!age) {
      newErrors.age = 'Age is required.';
    } else {
      const parsedAge = parseInt(age, 10);
      if (isNaN(parsedAge) || parsedAge < 16 || parsedAge > 90) {
        newErrors.age = 'Age must be between 16 and 90.';
      }
    }

    if (!city) {
      newErrors.city = 'Please select your city / location.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Revalidate form on data changes if errors are already showing
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
    <form onSubmit={handleContinue} className="space-y-6">
      {/* Title & Subtitle */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#1e1b4b] leading-tight mb-2">
          Let's start with <br />
          the basics
        </h1>
        <p className="text-slate-500 text-sm leading-relaxed">
          This helps us personalise your skill roadmap from day one.
        </p>
      </div>

      {/* Form Fields */}
      <div className="space-y-4">
        
        {/* First & Last Name Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="e.g. Kavindu"
              value={firstName}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 transition-all outline-none text-sm font-medium ${
                showErrors && errors.firstName
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:border-primary focus:ring-primary/10'
              }`}
            />
            {showErrors && errors.firstName && (
              <p className="text-xs font-semibold text-rose-500 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.firstName}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="e.g. Perera"
              value={lastName}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 transition-all outline-none text-sm font-medium ${
                showErrors && errors.lastName
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:border-primary focus:ring-primary/10'
              }`}
            />
            {showErrors && errors.lastName && (
              <p className="text-xs font-semibold text-rose-500 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.lastName}</span>
              </p>
            )}
          </div>
        </div>

        {/* University Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            University Email
          </label>
          <input
            type="text"
            name="email"
            placeholder="you@university.lk"
            value={email}
            onChange={handleChange}
            className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 transition-all outline-none text-sm font-medium ${
              showErrors && errors.email
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-primary focus:ring-primary/10'
            }`}
          />
          {showErrors && errors.email ? (
            <p className="text-xs font-semibold text-rose-500 flex items-center space-x-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.email}</span>
            </p>
          ) : (
            <p className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1.5 pt-0.5">
              <span>🎓</span>
              <span>Use your university email for verified student status</span>
            </p>
          )}
        </div>

        {/* Password field with Checklist */}
        <div className="space-y-1.5 relative">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={handleChange}
              className={`w-full px-4 py-3 pr-10 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 transition-all outline-none text-sm font-medium ${
                showErrors && errors.password
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:border-primary focus:ring-primary/10'
              }`}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Password strength segment bars */}
          <div className="grid grid-cols-4 gap-1.5 pt-1">
            {[1, 2, 3, 4].map((seg) => (
              <div 
                key={seg} 
                className={`h-1 rounded-full transition-all duration-300 ${
                  seg <= passwordStrength
                    ? passwordStrength === 4
                      ? 'bg-emerald-500'
                      : passwordStrength === 3
                      ? 'bg-teal-500'
                      : passwordStrength === 2
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                    : 'bg-slate-200'
                }`}
              />
            ))}
          </div>

          {/* Real-time Checklist Criteria */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100/80 space-y-2 mt-2 select-none">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-1">
              Strong Password Requirements:
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {passwordCriteria.map((c) => (
                <div key={c.id} className="flex items-center space-x-2 text-xs">
                  {c.met ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500 stroke-[3px]" />
                  ) : (
                    <X className="w-3.5 h-3.5 text-slate-300 stroke-[3px]" />
                  )}
                  <span className={c.met ? 'text-slate-600 font-semibold' : 'text-slate-400 font-medium'}>
                    {c.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {showErrors && errors.password && (
            <p className="text-xs font-semibold text-rose-500 flex items-center space-x-1 pt-1">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.password}</span>
            </p>
          )}
        </div>

        {/* Age & City Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Age
            </label>
            <input
              type="number"
              name="age"
              placeholder="e.g. 22"
              value={age}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 transition-all outline-none text-sm font-medium ${
                showErrors && errors.age
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:border-primary focus:ring-primary/10'
              }`}
            />
            {showErrors && errors.age && (
              <p className="text-xs font-semibold text-rose-500 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.age}</span>
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              City / Location
            </label>
            <select
              name="city"
              value={city}
              onChange={handleChange}
              className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 transition-all outline-none text-sm font-medium text-slate-700 cursor-pointer ${
                showErrors && errors.city
                  ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                  : 'border-slate-200 focus:border-primary focus:ring-primary/10'
              }`}
            >
              <option value="">Select your city</option>
              {lkCities.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            {showErrors && errors.city && (
              <p className="text-xs font-semibold text-rose-500 flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>{errors.city}</span>
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Footer Controls */}
      <div className="pt-6 border-t border-slate-100 flex items-center justify-between">
        <span className="text-xs font-medium text-slate-400 flex items-center space-x-1.5">
          <Timer className="w-4 h-4 text-slate-300" />
          <span>Takes about 3 minutes total</span>
        </span>
        
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
