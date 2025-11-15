import { useCallback, useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { TrainingPlan, WorkoutSession, Exercise } from '../types';
import { useAuth } from './useAuth';

interface TrainingPlanRow {
  id: string;
  name: string;
  description: string | null;
  start_date: string;
  end_date: string;
  workout_sessions?: Array<{
    id: string;
    date: string;
    duration: number | null;
    notes: string | null;
    workout_exercises?: Array<{
      id: string;
      exercise_id: string;
      completed: boolean;
      exercises?: {
        id: string;
        name: string;
        category: string;
        sets: number | null;
        reps: number | null;
        weight: number | null;
        duration: number | null;
        notes: string | null;
        completed: boolean;
        created_at: string;
      } | null;
    }>;
  }>;
}

interface UseTrainingPlansResult {
  trainingPlans: TrainingPlan[];
  loading: boolean;
  error: string | null;
  createPlan: (plan: Omit<TrainingPlan, 'id'>) => Promise<string | null>;
  deletePlan: (planId: string) => Promise<void>;
  refresh: () => Promise<void>;
  updatePlanLocally: (plan: TrainingPlan) => void;
}

type SupabaseResponse<T> = {
  data: T | null;
  error: { message: string; code?: string } | null;
};

type WorkoutExerciseInsertPayload = {
  workout_session_id: string;
  exercise_id: string;
  completed: boolean;
};

export function useTrainingPlans(): UseTrainingPlansResult {
  const { user } = useAuth();
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const formatTrainingPlans = useCallback((rows: TrainingPlanRow[]): TrainingPlan[] => {
    return rows.map((plan) => ({
      id: plan.id,
      name: plan.name,
      description: plan.description ?? undefined,
      startDate: new Date(plan.start_date),
      endDate: new Date(plan.end_date),
      workouts: (plan.workout_sessions ?? []).map((session): WorkoutSession => ({
        id: session.id,
        date: new Date(session.date),
        duration: session.duration ?? undefined,
        notes: session.notes ?? undefined,
        exercises: (session.workout_exercises ?? []).map((workoutExercise): Exercise => {
          const exercise = workoutExercise.exercises;
          return {
            id: exercise?.id ?? `${workoutExercise.exercise_id}-${session.id}`,
            sourceExerciseId: exercise?.id ?? workoutExercise.exercise_id,
            name: exercise?.name ?? 'Exercise',
            category: exercise?.category ?? 'Full Body',
            sets: exercise?.sets ?? undefined,
            reps: exercise?.reps ?? undefined,
            weight: exercise?.weight ?? undefined,
            duration: exercise?.duration ?? undefined,
            notes: exercise?.notes ?? undefined,
            completed: workoutExercise.completed ?? exercise?.completed ?? false,
            createdAt: exercise?.created_at ? new Date(exercise.created_at) : new Date(),
          };
        })
      })),
    }));
  }, []);

  const fetchPlans = useCallback(async () => {
    if (!user) {
      setTrainingPlans([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const response = await supabase
      .from('training_plans')
      .select(`
        id,
        name,
        description,
        start_date,
        end_date,
        workout_sessions (
          id,
          date,
          duration,
          notes,
          workout_exercises (
            id,
            exercise_id,
            completed,
            exercises (
              id,
              name,
              category,
              sets,
              reps,
              weight,
              duration,
              notes,
              completed,
              created_at
            )
          )
        )
      `)
      .eq('user_id', user.id)
      .order('start_date', { ascending: false });

    const { data, error: fetchError } = response as SupabaseResponse<TrainingPlanRow[]>;

    if (fetchError) {
      setError(fetchError.message);
      setLoading(false);
      return;
    }

    setTrainingPlans(formatTrainingPlans(data ?? []));
    setLoading(false);
  }, [formatTrainingPlans, user]);

  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  const createPlan = useCallback(async (planData: Omit<TrainingPlan, 'id'>) => {
    if (!user) throw new Error('User not authenticated');

    const insertResponse = await supabase
      .from('training_plans')
      .insert({
        user_id: user.id,
        name: planData.name,
        description: planData.description ?? null,
        start_date: planData.startDate.toISOString(),
        end_date: planData.endDate.toISOString(),
      })
      .select('id')
      .single();

    const { data: insertedPlan, error: insertError } = insertResponse as SupabaseResponse<{ id: string }>;

    if (insertError) {
      throw insertError;
    }

    const trainingPlanId = insertedPlan?.id ?? null;

    if (!trainingPlanId) {
      await fetchPlans();
      return null;
    }

    const sessionsPayload = planData.workouts.map((workout) => ({
      training_plan_id: trainingPlanId,
      date: workout.date.toISOString(),
      duration: workout.duration ?? null,
      notes: workout.notes ?? null,
    }));

    let insertedSessions: { id: string }[] = [];

    if (sessionsPayload.length) {
      const sessionsResponse = await supabase
        .from('workout_sessions')
        .insert(sessionsPayload)
        .select('id')
        .order('date', { ascending: true });

      const { data: sessionRows, error: sessionsError } = sessionsResponse as SupabaseResponse<{ id: string }[]>;

      if (sessionsError) {
        throw sessionsError;
      }

      insertedSessions = sessionRows ?? [];
    }

    if (insertedSessions.length) {
      const workoutExercisePayload: WorkoutExerciseInsertPayload[] = insertedSessions.flatMap((sessionRow, index) => {
        const workout = planData.workouts[index];
        if (!workout) return [];

        return workout.exercises.map((exercise) => ({
          workout_session_id: sessionRow.id,
          exercise_id: exercise.sourceExerciseId ?? exercise.id,
          completed: exercise.completed ?? false,
        }));
      });

      if (workoutExercisePayload.length) {
        const workoutExercisesResponse = await (supabase
          .from('workout_exercises')
          .insert(workoutExercisePayload) as unknown as Promise<SupabaseResponse<null>>);

        const { error: workoutExercisesError } = workoutExercisesResponse;

        if (workoutExercisesError) {
          throw workoutExercisesError;
        }
      }
    }

    await fetchPlans();
    return trainingPlanId ?? null;
  }, [fetchPlans, user]);

  const deletePlan = useCallback(async (planId: string) => {
    await supabase.from('training_plans').delete().eq('id', planId);
    setTrainingPlans((prev) => prev.filter((plan) => plan.id !== planId));
  }, []);

  const updatePlanLocally = useCallback((updatedPlan: TrainingPlan) => {
    setTrainingPlans((prev) =>
      prev.map((plan) => (plan.id === updatedPlan.id ? updatedPlan : plan))
    );
  }, []);

  return {
    trainingPlans,
    loading,
    error,
    createPlan,
    deletePlan,
    refresh: fetchPlans,
    updatePlanLocally,
  };
}
