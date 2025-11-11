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

export interface ExerciseSet {
  id: string;
  workout_exercise_id: string;
  set_number: number;
  reps: number;
  weight?: number;
  rest_time?: number; // in seconds
  completed: boolean;
  created_at: Date;
  completed_at?: Date;
}

export interface WorkoutTimer {
  id: string;
  workout_exercise_id: string;
  timer_type: 'exercise' | 'rest' | 'custom';
  duration: number; // in seconds
  started_at?: Date;
  paused_at?: Date;
  completed_at?: Date;
  is_active: boolean;
  created_at: Date;
}

export interface CalendarWorkout {
  id: string;
  user_id: string;
  training_plan_id?: string;
  scheduled_date: Date;
  status: 'scheduled' | 'in_progress' | 'completed' | 'skipped';
  started_at?: Date;
  completed_at?: Date;
  notes?: string;
  created_at: Date;
  training_plan?: TrainingPlan;
  workout_exercises?: WorkoutExercise[];
}

export interface WorkoutExercise {
  id: string;
  workout_session_id: string;
  exercise_id: string;
  exercise: Exercise;
  completed: boolean;
  actual_sets?: number;
  actual_reps?: number;
  actual_weight?: number;
  notes?: string;
  sets: ExerciseSet[];
  timers: WorkoutTimer[];
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
  category?: ExerciseCategory;
  startDate: Date;
  endDate: Date;
  workouts: WorkoutSession[];
  description?: string;
  exercises?: Exercise[]; // Template exercises for this plan
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