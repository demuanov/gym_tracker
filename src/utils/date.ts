import { format, isToday, isFuture, isPast, differenceInDays, addDays } from 'date-fns';

// Date formatting utilities
export const formatDate = (date: Date): string => {
  return format(date, 'MMM dd, yyyy');
};

export const formatDateTime = (date: Date): string => {
  return format(date, 'MMM dd, yyyy HH:mm');
};

export const formatRelativeDate = (date: Date): string => {
  if (isToday(date)) return 'Today';
  
  const daysDiff = differenceInDays(date, new Date());
  if (daysDiff === 1) return 'Tomorrow';
  if (daysDiff === -1) return 'Yesterday';
  
  return formatDate(date);
};

// Date validation utilities
export const isDateInFuture = (date: Date): boolean => isFuture(date);
export const isDateInPast = (date: Date): boolean => isPast(date);
export const isDateToday = (date: Date): boolean => isToday(date);

// Date range utilities
export const createDateRange = (startDate: Date, endDate: Date): Date[] => {
  const dates: Date[] = [];
  let currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    dates.push(new Date(currentDate));
    currentDate = addDays(currentDate, 1);
  }
  
  return dates;
};

export const getDaysBetween = (startDate: Date, endDate: Date): number => {
  return differenceInDays(endDate, startDate);
};