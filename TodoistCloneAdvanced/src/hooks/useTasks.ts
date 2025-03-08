import { useState, useCallback, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import FirestoreService from '../services/FirestoreService';
import type { Task, TaskFilter, TaskSort } from '../types/Task';
import { useAuth } from '../contexts/AuthContext';

export const useTasks = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<TaskFilter | undefined>();
  const [sort, setSort] = useState<TaskSort | undefined>();

  const fetchTasks = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const fetchedTasks = await FirestoreService.getTasks();
      setTasks(fetchedTasks);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch tasks'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const addTask = useCallback(async (task: Omit<Task, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User must be logged in');
    try {
      const newTask = await FirestoreService.saveTask(task);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add task');
    }
  }, [user]);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>) => {
    try {
      await FirestoreService.updateTask(taskId, updates);
      setTasks(prev =>
        prev.map(task =>
          task.id === taskId ? { ...task, ...updates } : task
        )
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update task');
    }
  }, []);

  const deleteTask = useCallback(async (taskId: string) => {
    try {
      await FirestoreService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete task');
    }
  }, []);

  const toggleTaskCompletion = useCallback(async (taskId: string, completed: boolean) => {
    try {
      await updateTask(taskId, { completed });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to toggle task completion');
    }
  }, [updateTask]);

  const getTasksByProject = useCallback((projectId: string) => {
    return tasks.filter(task => task.projectId === projectId);
  }, [tasks]);

  const getTasksByPriority = useCallback((priority: Task['priority']) => {
    return tasks.filter(task => task.priority === priority);
  }, [tasks]);

  const getTasksByDueDate = useCallback((start: Date, end: Date) => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = task.dueDate.toDate();
      return dueDate >= start && dueDate <= end;
    });
  }, [tasks]);

  const getOverdueTasks = useCallback(() => {
    const now = new Date();
    return tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      return task.dueDate.toDate() < now;
    });
  }, [tasks]);

  const refreshTasks = useCallback(async () => {
    await fetchTasks();
  }, [fetchTasks]);

  return {
    tasks,
    loading,
    error,
    filter,
    sort,
    setFilter,
    setSort,
    addTask,
    updateTask,
    deleteTask,
    toggleTaskCompletion,
    getTasksByProject,
    getTasksByPriority,
    getTasksByDueDate,
    getOverdueTasks,
    refreshTasks,
  };
};

export default useTasks;
