import { useState, useEffect } from 'react';
import { githubService, LearningDay } from '../services/githubService';

export const useGitHubData = () => {
  const [data, setData] = useState<LearningDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load data from localStorage
  const loadFromLocalStorage = () => {
    const stored = localStorage.getItem('learningData');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  };

  // Save data to localStorage
  const saveToLocalStorage = (data: LearningDay[]) => {
    localStorage.setItem('learningData', JSON.stringify(data));
  };

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from GitHub first
        const githubData = await githubService.loadData();
        if (githubData.length > 0) {
          setData(githubData);
          saveToLocalStorage(githubData);
        } else {
          // Fall back to localStorage if GitHub fails
          const localData = loadFromLocalStorage();
          setData(localData);
        }
      } catch (err) {
        setError('Failed to load data');
        const localData = loadFromLocalStorage();
        setData(localData);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Save data
  const saveData = async (newData: LearningDay[]) => {
    setSyncing(true);
    setError(null);

    try {
      // Save to GitHub
      const success = await githubService.saveData(newData);
      if (success) {
        // Update local state and storage
        setData(newData);
        saveToLocalStorage(newData);
      } else {
        throw new Error('Failed to save to GitHub');
      }
    } catch (err) {
      setError('Failed to sync with GitHub');
      // Still update local storage
      setData(newData);
      saveToLocalStorage(newData);
    } finally {
      setSyncing(false);
    }
  };

  return {
    data,
    loading,
    syncing,
    error,
    saveData,
  };
};
