import React from 'react';

export default function GreetingHeader({ name, graduationDate }) {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="mb-8">
      <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight sm:text-4xl">
        {getGreeting()}, <span className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{name || 'Student'}</span> 👋
      </h1>
      {graduationDate && (
        <p className="mt-2 text-sm text-slate-500 font-medium">
          Estimated Graduation: <span className="text-slate-700 font-semibold">{graduationDate}</span>
        </p>
      )}
    </div>
  );
}
