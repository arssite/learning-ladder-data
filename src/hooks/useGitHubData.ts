import { useState, useEffect, useCallback, useRef } from 'react';
import { githubService, LearningDay } from '../services/githubService';

export const useGitHubData = () => {
  const [data, setData] = useState<LearningDay[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSync, setLastSync] = useState<Date | null>(null);
  const [autoSync, setAutoSync] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

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
    localStorage.setItem('lastSyncTime', new Date().toISOString());
  };

  // Check for remote updates
  const checkForUpdates = useCallback(async () => {
    if (!autoSync) return;

    try {
      const result = await githubService.checkForUpdates();
      if (result.hasUpdates && result.data) {
        console.log('🔄 Remote data updated, syncing...');
        setData(result.data);
        saveToLocalStorage(result.data);
        setLastSync(new Date());
        
        // Show a brief notification that data was updated
        setError('Data updated from remote source');
        setTimeout(() => setError(null), 3000);
      }
    } catch (err) {
      console.error('Error checking for updates:', err);
    }
  }, [autoSync]);

  // Initial load
  useEffect(() => {
    const loadData = async () => {
      try {
        // Try to load from GitHub first
        const githubData = await githubService.loadData();
        if (githubData.length > 0) {
          setData(githubData);
          saveToLocalStorage(githubData);
          setLastSync(new Date());
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

  // Set up auto-sync interval
  useEffect(() => {
    if (autoSync && !loading) {
      // Check for updates every 30 seconds
      intervalRef.current = setInterval(checkForUpdates, 30000);
      
      // Also check when the tab becomes visible again
      const handleVisibilityChange = () => {
        if (!document.hidden) {
          checkForUpdates();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [autoSync, loading, checkForUpdates]);

  // Save data with validation
  const saveData = async (newData: LearningDay[]) => {
    setSyncing(true);
    setError(null);

    try {
      // Validate data structure before saving
      const validation = await githubService.validateDataStructure(newData);
      if (!validation.isValid) {
        throw new Error(`Data validation failed: ${validation.errors.join(', ')}`);
      }

      // Save to GitHub
      const success = await githubService.saveData(newData);
      if (success) {
        // Update local state and storage
        setData(newData);
        saveToLocalStorage(newData);
        setLastSync(new Date());
        console.log('✅ Data saved successfully to GitHub');
      } else {
        throw new Error('Failed to save to GitHub');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync with GitHub';
      setError(errorMessage);
      console.error('❌ Save error:', errorMessage);
      
      // Still update local storage if validation passed
      if (!errorMessage.includes('validation failed')) {
        setData(newData);
        saveToLocalStorage(newData);
      }
    } finally {
      setSyncing(false);
    }
  };

  // Manual refresh function
  const refreshData = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const githubData = await githubService.loadData();
      setData(githubData);
      saveToLocalStorage(githubData);
      setLastSync(new Date());
      console.log('🔄 Data refreshed from GitHub');
    } catch (err) {
      setError('Failed to refresh data');
      console.error('❌ Refresh error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Toggle auto-sync
  const toggleAutoSync = useCallback(() => {
    setAutoSync(prev => !prev);
  }, []);

  // Force sync check
  const forceSyncCheck = useCallback(async () => {
    await checkForUpdates();
  }, [checkForUpdates]);

  return {
    data,
    loading,
    syncing,
    error,
    lastSync,
    autoSync,
    saveData,
    refreshData,
    toggleAutoSync,
    forceSyncCheck,
  };
};
