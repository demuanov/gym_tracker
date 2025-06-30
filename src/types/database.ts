export interface Database {
  public: {
    Tables: {
      exercises: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: string;
          sets: number | null;
          reps: number | null;
          weight: number | null;
          duration: number | null;
          notes: string | null;
          completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: string;
          sets?: number | null;
          reps?: number | null;
          weight?: number | null;
          duration?: number | null;
          notes?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: string;
          sets?: number | null;
          reps?: number | null;
          weight?: number | null;
          duration?: number | null;
          notes?: string | null;
          completed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };
      training_plans: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          description: string | null;
          start_date: string;
          end_date: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          description?: string | null;
          start_date: string;
          end_date: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          description?: string | null;
          start_date?: string;
          end_date?: string;
          created_at?: string;
        };
      };
      workout_sessions: {
        Row: {
          id: string;
          training_plan_id: string;
          date: string;
          duration: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          training_plan_id: string;
          date: string;
          duration?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          training_plan_id?: string;
          date?: string;
          duration?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
      workout_exercises: {
        Row: {
          id: string;
          workout_session_id: string;
          exercise_id: string;
          completed: boolean;
          actual_sets: number | null;
          actual_reps: number | null;
          actual_weight: number | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          workout_session_id: string;
          exercise_id: string;
          completed?: boolean;
          actual_sets?: number | null;
          actual_reps?: number | null;
          actual_weight?: number | null;
          notes?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          workout_session_id?: string;
          exercise_id?: string;
          completed?: boolean;
          actual_sets?: number | null;
          actual_reps?: number | null;
          actual_weight?: number | null;
          notes?: string | null;
          created_at?: string;
        };
      };
    };
  };
}