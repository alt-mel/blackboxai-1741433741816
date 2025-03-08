import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import FirestoreService from '../services/FirestoreService';
import { useAuth } from './AuthContext';
import type { Project, NewProject, ProjectFilter, ProjectSort } from '../types/Project';

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: Error | null;
  filter: ProjectFilter | undefined;
  sort: ProjectSort | undefined;
  setFilter: (filter: ProjectFilter | undefined) => void;
  setSort: (sort: ProjectSort | undefined) => void;
  addProject: (project: NewProject) => Promise<Project>;
  updateProject: (projectId: string, updates: Partial<Project>) => Promise<void>;
  deleteProject: (projectId: string) => Promise<void>;
  toggleFavorite: (projectId: string) => Promise<void>;
  toggleArchived: (projectId: string) => Promise<void>;
  reorderProjects: (projectId: string, newOrder: number) => Promise<void>;
  getProjectById: (projectId: string) => Project | undefined;
  getFavoriteProjects: () => Project[];
  getArchivedProjects: () => Project[];
  getActiveProjects: () => Project[];
  refreshProjects: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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

  const addProject = useCallback(async (project: NewProject): Promise<Project> => {
    try {
      const newProject = await FirestoreService.saveProject(project);
      setProjects(prev => [...prev, newProject]);
      return newProject;
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to add project');
    }
  }, []);

  const updateProject = useCallback(async (projectId: string, updates: Partial<Project>): Promise<void> => {
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

  const deleteProject = useCallback(async (projectId: string): Promise<void> => {
    try {
      await FirestoreService.deleteProject(projectId);
      setProjects(prev => prev.filter(project => project.id !== projectId));
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to delete project');
    }
  }, []);

  const toggleFavorite = useCallback(async (projectId: string): Promise<void> => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    try {
      await updateProject(projectId, { isFavorite: !project.isFavorite });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to toggle favorite status');
    }
  }, [projects, updateProject]);

  const toggleArchived = useCallback(async (projectId: string): Promise<void> => {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    try {
      await updateProject(projectId, { isArchived: !project.isArchived });
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to toggle archive status');
    }
  }, [projects, updateProject]);

  const reorderProjects = useCallback(async (projectId: string, newOrder: number): Promise<void> => {
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

  const getProjectById = useCallback((projectId: string): Project | undefined => {
    return projects.find(project => project.id === projectId);
  }, [projects]);

  const getFavoriteProjects = useCallback((): Project[] => {
    return projects.filter(project => project.isFavorite && !project.isArchived);
  }, [projects]);

  const getArchivedProjects = useCallback((): Project[] => {
    return projects.filter(project => project.isArchived);
  }, [projects]);

  const getActiveProjects = useCallback((): Project[] => {
    return projects.filter(project => !project.isArchived);
  }, [projects]);

  const refreshProjects = useCallback(async (): Promise<void> => {
    await fetchProjects();
  }, [fetchProjects]);

  const value: ProjectContextType = {
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

  return (
    <ProjectContext.Provider value={value}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useTodoProjects = (): ProjectContextType => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useTodoProjects must be used within a ProjectProvider');
  }
  return context;
};

export default ProjectContext;
