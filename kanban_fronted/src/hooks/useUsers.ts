import { useState, useEffect, useCallback } from 'react';
import { apiClient } from '../services/api';
import { User } from '../types/User';

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getUsers();
      setUsers(response.data || []);
    } catch (error: any) {
      setError(error.message || 'Failed to fetch users');
      console.error('Failed to fetch users:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const getUserById = useCallback((id: string): User | undefined => {
    return users.find(user => user.id === id);
  }, [users]);

  const getUserByName = useCallback((name: string): User | undefined => {
    return users.find(user => user.username === name);
  }, [users]);

  const updateUser = useCallback(async (id: string, userData: Partial<User>) => {
    try {
      setError(null);
      const response = await apiClient.updateUser(id, userData);
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.id === id ? { ...user, ...response.data } : user
      ));
      
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to update user');
      throw error;
    }
  }, []);

  return {
    users,
    isLoading,
    error,
    getUserById,
    getUserByName,
    updateUser,
    refreshUsers: fetchUsers
  };
};