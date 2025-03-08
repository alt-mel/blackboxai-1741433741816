import { Timestamp } from 'firebase/firestore';

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  order: number;
  isFavorite: boolean;
  isArchived: boolean;
  userId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface NewProject {
  name: string;
  description?: string;
  color: string;
  order?: number;
}

export interface ProjectFilter {
  isFavorite?: boolean;
  isArchived?: boolean;
}

export interface ProjectSort {
  field: keyof Project;
  direction: 'asc' | 'desc';
}

export const PROJECT_COLORS = {
  RED: '#ff4d4d',
  ORANGE: '#ff9933',
  YELLOW: '#ffcc00',
  GREEN: '#33cc33',
  BLUE: '#3399ff',
  PURPLE: '#9966ff',
  PINK: '#ff66cc',
  GRAY: '#808080',
} as const;

export type ProjectColor = typeof PROJECT_COLORS[keyof typeof PROJECT_COLORS];

export const getDefaultProjectColor = (): ProjectColor => PROJECT_COLORS.GRAY;

export const getRandomProjectColor = (): ProjectColor => {
  const colors = Object.values(PROJECT_COLORS);
  return colors[Math.floor(Math.random() * colors.length)];
};

export const isValidProjectColor = (color: string): color is ProjectColor => {
  return Object.values(PROJECT_COLORS).includes(color as ProjectColor);
};
