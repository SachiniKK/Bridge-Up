import { useState, useEffect, useCallback } from 'react';
import { api, getStudentId } from '../lib/api';

export function useXP() {
  const studentId = getStudentId();
  const [xpData, setXpData] = useState({
    currentXP: 0,
    level: 1,
    levelName: 'Beginner',
    progressPercent: 0,
    nextThreshold: 100,
    streakCount: 0,
    studyModeActive: false,
  });
  const [loading, setLoading] = useState(true);

  const fetchXP = useCallback(async () => {
    try {
      if (!studentId) return;
      const data = await api.getXP(studentId);
      if (data && typeof data.currentXP === 'number') {
        setXpData(data);
      }
    } catch (err) {
      console.error('Failed to fetch XP data:', err);
    } finally {
      setLoading(false);
    }
  }, [studentId]);

  useEffect(() => {
    fetchXP();

    const handleXPUpdated = () => fetchXP();
    window.addEventListener('xp_updated', handleXPUpdated);
    return () => window.removeEventListener('xp_updated', handleXPUpdated);
  }, [fetchXP]);

  const notifyXPUpdated = () => {
    window.dispatchEvent(new CustomEvent('xp_updated'));
  };

  return { xpData, fetchXP, notifyXPUpdated, loading };
}

export function notifyXPUpdated() {
  window.dispatchEvent(new CustomEvent('xp_updated'));
}
