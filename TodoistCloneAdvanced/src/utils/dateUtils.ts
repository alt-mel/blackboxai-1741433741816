import { Timestamp } from 'firebase/firestore';

export const isToday = (date: Date): boolean => {
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
};

export const isTomorrow = (date: Date): boolean => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return (
    date.getDate() === tomorrow.getDate() &&
    date.getMonth() === tomorrow.getMonth() &&
    date.getFullYear() === tomorrow.getFullYear()
  );
};

export const isThisWeek = (date: Date): boolean => {
  const today = new Date();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - today.getDay());
  weekStart.setHours(0, 0, 0, 0);

  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);

  return date >= weekStart && date <= weekEnd;
};

export const isOverdue = (date: Date): boolean => {
  const now = new Date();
  return date < now;
};

export const formatDate = (date: Date | Timestamp | null | undefined): string => {
  if (!date) return '';

  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  const now = new Date();

  if (isToday(dateObj)) {
    return `Today at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  if (isTomorrow(dateObj)) {
    return `Tomorrow at ${dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  }

  if (isThisWeek(dateObj)) {
    return dateObj.toLocaleDateString([], {
      weekday: 'long',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (dateObj.getFullYear() === now.getFullYear()) {
    return dateObj.toLocaleDateString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  return dateObj.toLocaleDateString([], {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatDateRelative = (date: Date | Timestamp | null | undefined): string => {
  if (!date) return '';

  const dateObj = date instanceof Timestamp ? date.toDate() : date;
  const now = new Date();
  const diffTime = Math.abs(dateObj.getTime() - now.getTime());
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  if (isToday(dateObj)) {
    return 'Today';
  }

  if (isTomorrow(dateObj)) {
    return 'Tomorrow';
  }

  if (diffDays < 7) {
    return dateObj.toLocaleDateString([], { weekday: 'long' });
  }

  if (dateObj.getFullYear() === now.getFullYear()) {
    return dateObj.toLocaleDateString([], { month: 'short', day: 'numeric' });
  }

  return dateObj.toLocaleDateString([], { year: 'numeric', month: 'short', day: 'numeric' });
};

export const getStartOfDay = (date: Date = new Date()): Date => {
  const start = new Date(date);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfDay = (date: Date = new Date()): Date => {
  const end = new Date(date);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getStartOfWeek = (date: Date = new Date()): Date => {
  const start = new Date(date);
  start.setDate(date.getDate() - date.getDay());
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfWeek = (date: Date = new Date()): Date => {
  const end = new Date(date);
  end.setDate(date.getDate() - date.getDay() + 6);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const getStartOfMonth = (date: Date = new Date()): Date => {
  const start = new Date(date);
  start.setDate(1);
  start.setHours(0, 0, 0, 0);
  return start;
};

export const getEndOfMonth = (date: Date = new Date()): Date => {
  const end = new Date(date);
  end.setMonth(end.getMonth() + 1);
  end.setDate(0);
  end.setHours(23, 59, 59, 999);
  return end;
};

export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

export const addWeeks = (date: Date, weeks: number): Date => {
  return addDays(date, weeks * 7);
};

export const addMonths = (date: Date, months: number): Date => {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
};

export const timestampToDate = (timestamp: Timestamp | null | undefined): Date | null => {
  if (!timestamp) return null;
  return timestamp.toDate();
};

export const dateToTimestamp = (date: Date | null | undefined): Timestamp | null => {
  if (!date) return null;
  return Timestamp.fromDate(date);
};
