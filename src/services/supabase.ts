import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { config } from '../config/env';
import { LoggedSupabaseClient } from './supabaseLogger';

// Create the original Supabase client
const originalClient = createClient<Database>(config.supabase.url, config.supabase.anonKey);

// Export the logged version for comprehensive database operation tracking
export const supabase = new LoggedSupabaseClient(originalClient);

// Auth service
export const authService = {
  getCurrentUser: () => supabase.auth.getUser(),
  signIn: (email: string, password: string) => 
    supabase.auth.signInWithPassword({ email, password }),
  signUp: (email: string, password: string) => 
    supabase.auth.signUp({ email, password }),
  signOut: () => supabase.auth.signOut(),
  onAuthStateChange: (callback: (event: string, session: any) => void) =>
    supabase.auth.onAuthStateChange(callback),
};

// Exercise service
export const exerciseService = {
  getExercises: (userId: string) => 
    supabase.from('exercises').select('*').eq('user_id', userId),
  createExercise: (exercise: any) => 
    supabase.from('exercises').insert(exercise),
  updateExercise: (id: string, updates: any) => 
    supabase.from('exercises').update(updates).eq('id', id),
  deleteExercise: (id: string) => 
    supabase.from('exercises').delete().eq('id', id),
};

// Training plan service
export const trainingPlanService = {
  getTrainingPlans: (userId: string) => 
    supabase.from('training_plans').select('*').eq('user_id', userId),
  createTrainingPlan: (plan: any) => 
    supabase.from('training_plans').insert(plan),
  updateTrainingPlan: (id: string, updates: any) => 
    supabase.from('training_plans').update(updates).eq('id', id),
  deleteTrainingPlan: (id: string) => 
    supabase.from('training_plans').delete().eq('id', id),
};