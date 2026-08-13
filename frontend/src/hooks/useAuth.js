import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { clearAuthSession } from '../lib/api';

export function useAuth() {
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
    clearAuthSession();
    navigate('/signup', { replace: true });
  };

  const updateAuthUser = (updatedUser) => {
    localStorage.setItem('bridgeup_user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return { user, handleLogout, updateAuthUser };
}
