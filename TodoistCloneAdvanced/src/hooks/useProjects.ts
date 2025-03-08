import { useState, useCallback, useEffect } from 'react';
import FirestoreService from '../services/FirestoreService';
import type { Project, NewProject, ProjectFilter, ProjectSort } from '../types/Project';
import { useAuth } from '../contexts/AuthContext';

export const useProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filter, setFilter] = useState<ProjectFilter | undefined>();
  const [sort, setSort] = useState<ProjectSort | undefined>();

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);
      const fetchedProjects = await FirestoreService.getProjects();
      setProjects(fetchedProjects);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch projects'));
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const addProject = useCallback(async (project: NewProject) => {
    if (!user) throw new Error('User must be logged in');
    try {
      const newProject = await FirestoreService.saveProject(project);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add project');
    }
  }, [user]);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>) => {
    try {
      await FirestoreService.updateProject(projectId, updates);
      setProjects(prev =>
        prev.map(project =>
          project.id === projectId ? { ...project, ...updates } : project
        )
      );
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update project');
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await FirestoreService.deleteProject(projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete project');
    }
  }, []);

  const toggleFavorite = useCallback(async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    try {
      await updateProject(projectId, { isFavorite: !project.isFavorite });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to toggle favorite status');
    }
  }, [projects, updateProject]);

  const toggleArchived = useCallback(async (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    try {
      await updateProject(projectId, { isArchived: !project.isArchived });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to toggle archive status');
    }
  }, [projects, updateProject]);

  const reorderProjects = useCallback(async (projectId: string, newOrder: number) => {
    try {
      await updateProject(projectId, { order: newOrder });
      // Update all affected projects' orders
      const updatedProjects = [...projects].sort((a, b) => a.order - b.order);
      const updates = updatedProjects.map((project, index) => {
        if (project.id === projectId) {
          return { ...project, order: newOrder };
        }
        if (
          (newOrder > project.order && project.order > updatedProjects.find(p => p.id === projectId)?.order!) ||
          (newOrder < project.order && project.order < updatedProjects.find(p => p.id === projectId)?.order!)
        ) {
          return { ...project, order: project.order + (newOrder > project.order ? -1 : 1) };
        }
        return project;
      });
      setProjects(updates);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to reorder projects');
    }
  }, [projects, updateProject]);

  const getProjectById = useCallback((projectId: string) => {
    return projects.find(project => project.id === projectId);
  }, [projects]);

  const getFavoriteProjects = useCallback(() => {
    return projects.filter(project => project.isFavorite && !project.isArchived);
  }, [projects]);

  const getArchivedProjects = useCallback(() => {
    return projects.filter(project => project.isArchived);
  }, [projects]);

  const getActiveProjects = useCallback(() => {
    return projects.filter(project => !project.isArchived);
  }, [projects]);

  const refreshProjects = useCallback(async () => {
    await fetchProjects();
  }, [fetchProjects]);

  return {
    projects,
    loading,
    error,
    filter,
    sort,
    setFilter,
    setSort,
    addProject,
    updateProject,
    deleteProject,
    toggleFavorite,
    toggleArchived,
    reorderProjects,
    getProjectById,
    getFavoriteProjects,
    getArchivedProjects,
    getActiveProjects,
    refreshProjects,
  };
};

export default useProjects;
