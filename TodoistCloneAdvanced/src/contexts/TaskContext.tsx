import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { Timestamp } from 'firebase/firestore';
import FirestoreService from '../services/FirestoreService';
import { useAuth } from './AuthContext';
import type { Task, NewTask, TaskFilter, TaskSort } from '../types/Task';

interface TaskContextType {
  tasks: Task[];
  loading: boolean;
  error: Error | null;
  filter: TaskFilter | undefined;
  sort: TaskSort | undefined;
  setFilter: (filter: TaskFilter | undefined) => void;
  setSort: (sort: TaskSort | undefined) => void;
  addTask: (task: NewTask) => Promise<Task>;
  updateTask: (taskId: string, updates: Partial<Task>) => Promise<void>;
  deleteTask: (taskId: string) => Promise<void>;
  toggleTaskCompletion: (taskId: string, completed: boolean) => Promise<void>;
  getTasksByProject: (projectId: string) => Task[];
  getTasksByPriority: (priority: Task['priority']) => Task[];
  getTasksByDueDate: (start: Date, end: Date) => Task[];
  getOverdueTasks: () => Task[];
  refreshTasks: () => Promise<void>;
}

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const addTask = useCallback(async (task: NewTask): Promise<Task> => {
    try {
      const newTask = await FirestoreService.saveTask(task);
      setTasks(prev => [...prev, newTask]);
      return newTask;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add task');
    }
  }, []);

  const updateTask = useCallback(async (taskId: string, updates: Partial<Task>): Promise<void> => {
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

  const deleteTask = useCallback(async (taskId: string): Promise<void> => {
    try {
      await FirestoreService.deleteTask(taskId);
      setTasks(prev => prev.filter(task => task.id !== taskId));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete task');
    }
  }, []);

  const toggleTaskCompletion = useCallback(async (taskId: string, completed: boolean): Promise<void> => {
    try {
      await updateTask(taskId, { completed });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to toggle task completion');
    }
  }, [updateTask]);

  const getTasksByProject = useCallback((projectId: string): Task[] => {
    return tasks.filter(task => task.projectId === projectId);
  }, [tasks]);

  const getTasksByPriority = useCallback((priority: Task['priority']): Task[] => {
    return tasks.filter(task => task.priority === priority);
  }, [tasks]);

  const getTasksByDueDate = useCallback((start: Date, end: Date): Task[] => {
    return tasks.filter(task => {
      if (!task.dueDate) return false;
      const dueDate = task.dueDate.toDate();
      return dueDate >= start && dueDate <= end;
    });
  }, [tasks]);

  const getOverdueTasks = useCallback((): Task[] => {
    const now = new Date();
    return tasks.filter(task => {
      if (!task.dueDate || task.completed) return false;
      return task.dueDate.toDate() < now;
    });
  }, [tasks]);

  const refreshTasks = useCallback(async (): Promise<void> => {
    await fetchTasks();
  }, [fetchTasks]);

  const value: TaskContextType = {
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

  return (
    <TaskContext.Provider value={value}>
      {children}
    </TaskContext.Provider>
  );
};

export const useTodoTasks = (): TaskContextType => {
  const context = useContext(TaskContext);
  if (context === undefined) {
    throw new Error('useTodoTasks must be used within a TaskProvider');
  }
  return context;
};

export default TaskContext;
