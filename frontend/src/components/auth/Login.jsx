import React, { useState } from 'react';
import { api } from '../../lib/api';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';

export default function Login({ onSignUpClick, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showErrors, setShowErrors] = useState(false);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validateForm = () => {
    const newErrors = {};
    if (!email.trim()) {
      newErrors.email = 'Email is required.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      newErrors.password = 'Password is required.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowErrors(true);
    setServerError('');

    const isValid = validateForm();
    if (!isValid) return;

    setIsLoading(true);
    try {
      const data = await api.login(email, password);
      onLoginSuccess({ user: data.user, token: data.token, studentId: data.studentId });
    } catch (err) {
      setServerError(err.message || 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[440px] bg-white rounded-[32px] p-8 md:p-10 shadow-xl border border-slate-100/80 animate-fade-in relative overflow-hidden">
      
      {/* Loader overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-semibold text-slate-500">Signing in...</span>
        </div>
      )}

      {/* Brand logo */}
      <div className="flex items-center justify-center space-x-1.5 mb-6 select-none">
        <span className="text-2xl font-extrabold tracking-tight text-[#1e1b4b]">
          Skill<span className="text-primary">Bridge</span>
        </span>
        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 mt-1.5"></span>
      </div>

      {/* Header title */}
      <div className="space-y-1 mb-8">
        <h2 className="text-center text-3xl font-extrabold tracking-tight text-[#1e1b4b]">
          Welcome <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-primary font-bold">back.</span>
        </h2>
        <p className="text-center text-slate-400 text-xs font-semibold">
          Continue building your skill profile.
        </p>
      </div>

      {/* Server Error Alert */}
      {serverError && (
        <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-100 flex items-start space-x-2.5">
          <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
          <span className="text-xs font-semibold text-rose-600 leading-normal">{serverError}</span>
        </div>
      )}

      {/* Form Fields */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        {/* Email field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Email
          </label>
          <input
            type="text"
            placeholder="you@university.lk"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 focus:bg-white focus:ring-2 transition-all outline-none text-sm font-medium ${
              showErrors && errors.email
                ? 'border-rose-400 focus:border-rose-500 focus:ring-rose-500/10'
                : 'border-slate-200 focus:border-primary focus:ring-primary/10'
            }`}
          />
          {showErrors && errors.email && (
            <p className="text-xs font-semibold text-rose-500 flex items-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.email}</span>
            </p>
          )}
        </div>

        {/* Password field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Password
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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
          {showErrors && errors.password && (
            <p className="text-xs font-semibold text-rose-500 flex items-center space-x-1.5 pt-0.5">
              <AlertCircle className="w-3.5 h-3.5" />
              <span>{errors.password}</span>
            </p>
          )}

          {/* Forgot Password */}
          <div className="flex justify-end pt-1">
            <button
              type="button"
              className="text-xs font-semibold text-primary hover:underline"
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Submit button */}
        <button
          type="submit"
          className="w-full flex items-center justify-center space-x-2 py-3.5 bg-primary hover:bg-primary-dark text-white rounded-2xl font-bold text-sm shadow-md shadow-primary/25 hover:shadow-lg transition-all active:scale-[0.98] mt-2 cursor-pointer"
        >
          <span>Log in</span>
          <ArrowRight className="w-4 h-4" />
        </button>

      </form>

      {/* Or Divider */}
      <div className="flex items-center my-6 select-none">
        <div className="flex-1 h-px bg-slate-100"></div>
        <span className="px-4 text-[10px] font-extrabold text-slate-300 uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-slate-100"></div>
      </div>

      {/* Sign up Footer */}
      <div className="text-center">
        <span className="text-xs font-medium text-slate-400">Don't have an account? </span>
        <button
          onClick={onSignUpClick}
          className="text-xs font-bold text-primary hover:underline hover:text-primary-dark transition-colors cursor-pointer"
        >
          Sign up free →
        </button>
      </div>

    </div>
  );
}
