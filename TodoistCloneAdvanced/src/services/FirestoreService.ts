import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from '../config/firebase';
import type { Task, NewTask } from '../types/Task';
import type { Project, NewProject } from '../types/Project';

class FirestoreService {
  // Tasks
  async getTasks(): Promise<Task[]> {
    if (!auth.currentUser) throw new Error('User must be logged in');
    
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
  }

  async getTask(taskId: string): Promise<Task | null> {
    if (!auth.currentUser) throw new Error('User must be logged in');
    
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (!taskDoc.exists()) return null;
    return { id: taskDoc.id, ...taskDoc.data() } as Task;
  }

  async saveTask(task: NewTask): Promise<Task> {
    if (!auth.currentUser) throw new Error('User must be logged in');
    
    const tasksRef = collection(db, 'tasks');
    const now = Timestamp.now();
    
    const newTask = {
      ...task,
      userId: auth.currentUser.uid,
      completed: false,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(tasksRef, newTask);
    return { id: docRef.id, ...newTask } as Task;
  }

  async updateTask(taskId: string, updates: Partial<Task>): Promise<void> {
    if (!auth.currentUser) throw new Error('User must be logged in');
    
    const taskRef = doc(db, 'tasks', taskId);
    await updateDoc(taskRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteTask(taskId: string): Promise<void> {
    if (!auth.currentUser) throw new Error('User must be logged in');
    
    const taskRef = doc(db, 'tasks', taskId);
    await deleteDoc(taskRef);
  }

  // Projects
  async getProjects(): Promise<Project[]> {
    if (!auth.currentUser) throw new Error('User must be logged in');
    
    const projectsRef = collection(db, 'projects');
    const q = query(
      projectsRef,
      where('userId', '==', auth.currentUser.uid),
      orderBy('order', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Project[];
  }

  async getProject(projectId: string): Promise<Project | null> {
    if (!auth.currentUser) throw new Error('User must be logged in');
    
    const projectRef = doc(db, 'projects', projectId);
    const projectDoc = await getDoc(projectRef);
    
    if (!projectDoc.exists()) return null;
    return { id: projectDoc.id, ...projectDoc.data() } as Project;
  }

  async saveProject(project: NewProject): Promise<Project> {
    if (!auth.currentUser) throw new Error('User must be logged in');
    
    const projectsRef = collection(db, 'projects');
    const now = Timestamp.now();
    
    const newProject = {
      ...project,
      userId: auth.currentUser.uid,
      isFavorite: false,
      isArchived: false,
      createdAt: now,
      updatedAt: now,
    };

    const docRef = await addDoc(projectsRef, newProject);
    return { id: docRef.id, ...newProject } as Project;
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<void> {
    if (!auth.currentUser) throw new Error('User must be logged in');
    
    const projectRef = doc(db, 'projects', projectId);
    await updateDoc(projectRef, {
      ...updates,
      updatedAt: Timestamp.now(),
    });
  }

  async deleteProject(projectId: string): Promise<void> {
    if (!auth.currentUser) throw new Error('User must be logged in');
    
    // First, delete all tasks associated with this project
    const tasksRef = collection(db, 'tasks');
    const q = query(tasksRef, where('projectId', '==', projectId));
    const querySnapshot = await getDocs(q);
    
    const batch = writeBatch(db);
    querySnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    // Then delete the project
    const projectRef = doc(db, 'projects', projectId);
    batch.delete(projectRef);
    
    await batch.commit();
  }

  // Utility methods
  async getTasksByProject(projectId: string): Promise<Task[]> {
    if (!auth.currentUser) throw new Error('User must be logged in');
    
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', auth.currentUser.uid),
      where('projectId', '==', projectId),
      orderBy('createdAt', 'desc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
  }

  async getOverdueTasks(): Promise<Task[]> {
    if (!auth.currentUser) throw new Error('User must be logged in');
    
    const tasksRef = collection(db, 'tasks');
    const now = Timestamp.now();
    
    const q = query(
      tasksRef,
      where('userId', '==', auth.currentUser.uid),
      where('completed', '==', false),
      where('dueDate', '<', now),
      orderBy('dueDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
  }

  async getTasksDueToday(): Promise<Task[]> {
    if (!auth.currentUser) throw new Error('User must be logged in');
    
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    
    const tasksRef = collection(db, 'tasks');
    const q = query(
      tasksRef,
      where('userId', '==', auth.currentUser.uid),
      where('completed', '==', false),
      where('dueDate', '>=', Timestamp.fromDate(start)),
      where('dueDate', '<=', Timestamp.fromDate(end)),
      orderBy('dueDate', 'asc')
    );

    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Task[];
  }
}

export default new FirestoreService();
