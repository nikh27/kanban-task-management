import { useState, useCallback, useEffect } from 'react';
import { apiClient } from '../services/api';
import { Task, TaskStatus } from '../types/Task';

export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  console.log("taskssss",tasks)
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLabels, setSelectedLabels] = useState<string[]>([]);
  const [selectedAssignee, setSelectedAssignee] = useState<string>('');

  // Fetch tasks from API
  const fetchTasks = useCallback(async () => {
    try {
      console.log("i'm entering task")
      setIsLoading(true);
      setError(null);
      
      const params: any = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedAssignee) params.assignee = selectedAssignee;
      if (selectedLabels.length > 0) params.labels = selectedLabels.join(',');
      
      const response = await apiClient.getTasks(params);
      console.log('Tasks from backend:', response.data);

      if (Array.isArray(response.data)) {
        setTasks(response.data);
      } else {
        setTasks([]);
      }
    } catch (error: any) {
      setError(error.message || 'Failed to fetch tasks');
      console.error('Failed to fetch tasks:', error);
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, selectedAssignee, selectedLabels]);

  // Load tasks on mount and when filters change
  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'createdAt'>) => {
    try {
      setError(null);
      const response = await apiClient.createTask({
        title: taskData.title,
        description: taskData.description,
        status: taskData.status,
        assigneeId: taskData.assigneeId,
        due_date: taskData.due_date,
        labelIds: taskData.labels?.map(label => label.id) || []
      });
      
      // Refresh tasks to get updated list
      await fetchTasks();
      return response.data;
    } catch (error: any) {
      setError(error.message || 'Failed to create task');
      throw error;
    }
  }, [fetchTasks]);

  const updateTask = useCallback(async (id: string, updates: Partial<Task>) => {
    try {
      setError(null);
      const updateData: any = {
        title: updates.title,
        description: updates.description,
        status: updates.status,
        assigneeId: updates.assigneeId,
        due_date: updates.due_date,
      };
      
      if (updates.labels) {
        updateData.labelIds = updates.labels.map(label => label.id);
      }
      
      await apiClient.updateTask(id, updateData);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, ...updates } : task
      ));
    } catch (error: any) {
      setError(error.message || 'Failed to update task');
      throw error;
    }
  }, []);

  const deleteTask = useCallback(async (id: string) => {
    try {
      setError(null);
      await apiClient.deleteTask(id);
      
      // Remove from local state
      setTasks(prev => prev.filter(task => task.id !== id));
    } catch (error: any) {
      setError(error.message || 'Failed to delete task');
      throw error;
    }
  }, []);

  const moveTask = useCallback(async (id: string, newStatus: TaskStatus) => {
    try {
      setError(null);
      await apiClient.updateTaskStatus(id, newStatus);
      
      // Update local state
      setTasks(prev => prev.map(task => 
        task.id === id ? { ...task, status: newStatus } : task
      ));
    } catch (error: any) {
      setError(error.message || 'Failed to move task');
      throw error;
    }
  }, []);

  const addComment = useCallback(async (taskId: string, content: string, authorId: string, authorName: string) => {
    try {
      setError(null);
      await apiClient.addTaskComment(taskId, content);
      
      // Refresh task to get updated comments
      const response = await apiClient.getTask(taskId);
      const updatedTask = response.data;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error: any) {
      setError(error.message || 'Failed to add comment');
      throw error;
    }
  }, []);

  const addAttachment = useCallback(async (taskId: string, file: File, uploadedBy: string) => {
    try {
      setError(null);
      await apiClient.uploadTaskAttachment(taskId, file);
      
      // Refresh task to get updated attachments
      const response = await apiClient.getTask(taskId);
      const updatedTask = response.data;
      
      setTasks(prev => prev.map(task => 
        task.id === taskId ? updatedTask : task
      ));
    } catch (error: any) {
      setError(error.message || 'Failed to upload attachment');
      throw error;
    }
  }, []);

  const getFilteredTasks = useCallback((status: TaskStatus) => {
    return tasks.filter(task => task.status === status);
  }, [tasks]);

  const getTasksByStatus = useCallback((status: TaskStatus) => {
    return getFilteredTasks(status);
  }, [getFilteredTasks]);

  return {
    tasks,
    isLoading,
    error,
    searchTerm,
    selectedLabels,
    selectedAssignee,
    setSearchTerm,
    setSelectedLabels,
    setSelectedAssignee,
    addTask,
    updateTask,
    deleteTask,
    moveTask,
    addComment,
    addAttachment,
    getTasksByStatus,
    refreshTasks: fetchTasks
  };
};