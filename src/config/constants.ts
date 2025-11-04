import { ExerciseCategory } from '../types';

// Exercise categories
export const EXERCISE_CATEGORIES: ExerciseCategory[] = [
  'Chest',
  'Back',
  'Shoulders',
  'Arms',
  'Legs',
  'Core',
  'Cardio',
  'Full Body',
];

// Category colors
export const CATEGORY_COLORS = {
  'Chest': 'bg-red-100 text-red-800',
  'Back': 'bg-blue-100 text-blue-800',
  'Shoulders': 'bg-yellow-100 text-yellow-800',
  'Arms': 'bg-purple-100 text-purple-800',
  'Legs': 'bg-green-100 text-green-800',
  'Core': 'bg-orange-100 text-orange-800',
  'Cardio': 'bg-pink-100 text-pink-800',
  'Full Body': 'bg-indigo-100 text-indigo-800',
} as const;

// Default exercise values
export const DEFAULT_EXERCISE = {
  sets: 3,
  reps: 12,
  weight: 0,
  duration: 30,
} as const;

// UI Constants
export const UI = {
  LOADING_DELAY: 300,
  ANIMATION_DURATION: 200,
  DEBOUNCE_DELAY: 500,
} as const;