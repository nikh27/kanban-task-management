import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import { TaskLabel } from '../types/Task';

export const useLabels = () => {
  const [labels, setLabels] = useState<TaskLabel[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchLabels = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getLabels();
      setLabels(response.data || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch labels');
      console.error('Failed to fetch labels:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLabels();
  }, [fetchLabels]);

  const createLabel = useCallback(async (name: string, color: string) => {
    try {
      setError(null);
      const response = await apiClient.createLabel({ name, color });
      
      // Add to local state
      setLabels(prev => [...prev, response.data]);
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to create label');
      throw error;
    }
  }, []);

  const updateLabel = useCallback(async (id: string, name: string, color: string) => {
    try {
      setError(null);
      const response = await apiClient.updateLabel(id, { name, color });
      
      // Update local state
      setLabels(prev => prev.map(label => 
        label.id === id ? { ...label, ...response.data } : label
      ));
      
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to update label');
      throw error;
    }
  }, []);

  const deleteLabel = useCallback(async (id: string) => {
    try {
      setError(null);
      await apiClient.deleteLabel(id);
      
      // Remove from local state
      setLabels(prev => prev.filter(label => label.id !== id));
    } catch (error: any) {
      setError(error.message || 'Failed to delete label');
      throw error;
    }
  }, []);

  return {
    labels,
    isLoading,
    error,
    createLabel,
    updateLabel,
    deleteLabel,
    refreshLabels: fetchLabels
  };
};