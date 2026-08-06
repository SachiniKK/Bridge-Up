import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Dashboard from '../components/dashboard/Dashboard';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = localStorage.getItem('bridgeup_user');
    if (!stored) {
      navigate('/login', { replace: true });
      return;
    }
    try {
      setUser(JSON.parse(stored));
    } catch {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('bridgeup_user');
    navigate('/signup', { replace: true });
  };

  if (!user) return null;

  return <Dashboard user={user} onLogout={handleLogout} />;
}
