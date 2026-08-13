import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import DashboardSidebar from '../dashboard/DashboardSidebar';

export default function AppLayout({ user, onLogout, children }) {
  const navigate = useNavigate();
  const location = useLocation();

  const handleNavigate = (path) => navigate(path);

  return (
    <div className="flex h-screen bg-[#f1f5f9]/50 overflow-hidden font-sans">
      <DashboardSidebar
        user={user}
        currentPath={location.pathname}
        onNavigate={handleNavigate}
      />
      <div className="flex-1 flex flex-col overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
