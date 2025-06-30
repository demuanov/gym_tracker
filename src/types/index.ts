export interface Exercise {
  id: string;
  name: string;
  category: string;
  sets?: number;
  reps?: number;
  weight?: number;
  duration?: number;
  notes?: string;
  completed: boolean;
  createdAt: Date;
}

export interface WorkoutSession {
  id: string;
  date: Date;
  exercises: Exercise[];
  duration?: number;
  notes?: string;
}

export interface TrainingPlan {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  workouts: WorkoutSession[];
  description?: string;
}

export type ExerciseCategory = 
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Arms'
  | 'Legs'
  | 'Core'
  | 'Cardio'
  | 'Full Body';