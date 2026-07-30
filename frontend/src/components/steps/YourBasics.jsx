import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Timer, ArrowRight } from 'lucide-react';

const lkCities = [
  'Colombo', 'Gampaha', 'Kandy', 'Jaffna', 'Galle', 
  'Negombo', 'Kurunegala', 'Kalutara', 'Batticaloa', 
  'Trincomalee', 'Anuradhapura', 'Ratnapura', 'Matara'
];

export default function YourBasics({ formData, onChange, onNext }) {
  const [showPassword, setShowPassword] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0); // 0 to 4
  const [isValid, setIsValid] = useState(false);

  // Password strength checker
  const checkPasswordStrength = (pwd) => {
    if (!pwd) return 0;
    let strength = 0;
    if (pwd.length >= 8) strength += 1;
    if (/[A-Z]/.test(pwd)) strength += 1;
    if (/[0-9]/.test(pwd)) strength += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1;
    return strength;
  };

  useEffect(() => {
    setPasswordStrength(checkPasswordStrength(formData.password));
  }, [formData.password]);

  // Form validation
  useEffect(() => {
    const { firstName, lastName, email, password, age, city } = formData;
    const isEmailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    const isAgeValid = age && parseInt(age, 10) >= 16 && parseInt(age, 10) <= 90;
    const isPasswordValid = password && password.length >= 8;
    const isCityValid = city && lkCities.includes(city);

    setIsValid(
      firstName.trim().length > 0 &&
      lastName.trim().length > 0 &&
      isEmailValid &&
      isPasswordValid &&
      isAgeValid &&
      isCityValid
    );
  }, [formData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange({ [name]: value });
  };

  return (
    <div className="space-y-6">
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
        {/* First & Last Name */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              placeholder="e.g. Kavindu"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              placeholder="e.g. Perera"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
            />
          </div>
        </div>

        {/* University Email */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            University Email
          </label>
          <input
            type="email"
            name="email"
            placeholder="you@university.lk"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
          />
          <p className="text-[10px] text-slate-400 font-semibold flex items-center space-x-1.5 pt-0.5">
            <span>🎓</span>
            <span>Use your university email for verified student status</span>
          </p>
        </div>

        {/* Password */}
        <div className="space-y-1.5 relative">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              name="password"
              placeholder="Minimum 8 characters"
              value={formData.password}
              onChange={handleChange}
              className="w-full px-4 py-3 pr-10 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
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
          <p className="text-[10px] text-slate-400 font-semibold pt-0.5">
            Add uppercase, numbers & symbols to strengthen
          </p>
        </div>

        {/* Age & City */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Age
            </label>
            <input
              type="number"
              name="age"
              placeholder="e.g. 22"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm font-medium"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              City / Location
            </label>
            <select
              name="city"
              value={formData.city}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/10 transition-all outline-none text-sm font-medium text-slate-700 cursor-pointer"
            >
              <option value="">Select your city</option>
              {lkCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
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
          onClick={onNext}
          disabled={!isValid}
          className={`flex items-center space-x-2 px-8 py-3 rounded-2xl font-bold text-sm shadow-md transition-all active:scale-[0.98] ${
            !isValid
              ? 'bg-slate-100 text-slate-400 cursor-not-allowed shadow-none'
              : 'bg-primary hover:bg-primary-dark text-white shadow-primary/25 hover:shadow-lg hover:shadow-primary/30'
          }`}
        >
          <span>Continue</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
