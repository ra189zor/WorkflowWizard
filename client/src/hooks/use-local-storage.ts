import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue] as const;
}

export interface RecentWorkflow {
  id: string;
  title: string;
  description: string;
  workflow: any;
  timestamp: string;
}

export function useRecentWorkflows() {
  const [recentWorkflows, setRecentWorkflows] = useLocalStorage<RecentWorkflow[]>('recentWorkflows', []);

  const addWorkflow = (title: string, description: string, workflow: any) => {
    const newWorkflow: RecentWorkflow = {
      id: `workflow_${Date.now()}`,
      title: title.slice(0, 50) + (title.length > 50 ? '...' : ''),
      description,
      workflow,
      timestamp: new Date().toISOString()
    };

    setRecentWorkflows(prev => {
      const updated = [newWorkflow, ...prev.filter(w => w.id !== newWorkflow.id)];
      return updated.slice(0, 5); // Keep only last 5
    });
  };

  const clearWorkflows = () => {
    setRecentWorkflows([]);
  };

  return {
    recentWorkflows,
    addWorkflow,
    clearWorkflows
  };
}