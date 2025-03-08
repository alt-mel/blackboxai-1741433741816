import { Timestamp } from 'firebase/firestore';

export interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  priority: TaskPriority;
  dueDate?: Timestamp;
  projectId?: string;
  labels: string[];
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export const TASK_PRIORITIES = {
  URGENT: 1,
  HIGH: 2,
  MEDIUM: 3,
  LOW: 4,
} as const;

export type TaskPriority = typeof TASK_PRIORITIES[keyof typeof TASK_PRIORITIES];

export interface TaskFilter {
  completed?: boolean;
  priority?: TaskPriority;
  projectId?: string;
  dueDateRange?: {
    start: Date;
    end: Date;
  };
  labels?: string[];
}

export interface TaskSort {
  field: keyof Task;
  direction: 'asc' | 'desc';
}

export type NewTask = Omit<Task, 'id' | 'userId' | 'completed' | 'createdAt' | 'updatedAt'> & {
  completed?: boolean;
};

export const getPriorityColor = (priority: TaskPriority): string => {
  switch (priority) {
    case TASK_PRIORITIES.URGENT:
      return '#ff0000';
    case TASK_PRIORITIES.HIGH:
      return '#ff9900';
    case TASK_PRIORITIES.MEDIUM:
      return '#ffcc00';
    case TASK_PRIORITIES.LOW:
      return '#808080';
    default:
      return '#808080';
  }
};

export const getPriorityLabel = (priority: TaskPriority): string => {
  switch (priority) {
    case TASK_PRIORITIES.URGENT:
      return 'Urgent';
    case TASK_PRIORITIES.HIGH:
      return 'High';
    case TASK_PRIORITIES.MEDIUM:
      return 'Medium';
    case TASK_PRIORITIES.LOW:
      return 'Low';
    default:
      return 'Low';
  }
};

export const getPriorityIcon = (priority: TaskPriority): string => {
  switch (priority) {
    case TASK_PRIORITIES.URGENT:
      return 'flag';
    case TASK_PRIORITIES.HIGH:
      return 'flag-outline';
    case TASK_PRIORITIES.MEDIUM:
      return 'flag-variant-outline';
    case TASK_PRIORITIES.LOW:
      return 'flag-variant';
    default:
      return 'flag-variant';
  }
};
