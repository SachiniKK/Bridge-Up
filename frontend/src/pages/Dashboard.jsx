import React from 'react';
import Dashboard from '../components/dashboard/Dashboard';
import { useAuth } from '../hooks/useAuth';

export default function DashboardPage() {
  const { user, handleLogout } = useAuth();
  if (!user) return null;
  return <Dashboard user={user} onLogout={handleLogout} />;
}
