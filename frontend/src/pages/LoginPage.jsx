import React from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/auth/Login';
import { saveAuthSession } from '../lib/api';

export default function LoginPage() {
  const navigate = useNavigate();

  const handleLoginSuccess = ({ user, token, studentId }) => {
    saveAuthSession({ user, token, studentId });
    if (user.role === 'employer') {
      navigate('/employer');
    } else if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/50 flex flex-col font-sans">
      {/* Brand Header */}
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
          onSignUpClick={() => navigate('/signup')}
          onLoginSuccess={handleLoginSuccess}
        />
      </main>
    </div>
  );
}
