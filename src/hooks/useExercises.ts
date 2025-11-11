import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Exercise } from '../types';
import { useAuth } from './useAuth';

export function useExercises() {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExercises();
    } else {
      setExercises([]);
      setLoading(false);
    }
  }, [user]);

  const fetchExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedExercises: Exercise[] = data.map((exercise: any) => ({
        id: exercise.id,
        name: exercise.name,
        category: exercise.category,
        sets: exercise.sets || undefined,
        reps: exercise.reps || undefined,
        weight: exercise.weight || undefined,
        duration: exercise.duration || undefined,
        notes: exercise.notes || undefined,
        completed: exercise.completed,
        createdAt: new Date(exercise.created_at),
      }));

      setExercises(formattedExercises);
    } catch (error) {
      console.error('Error fetching exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const addExercise = async (exerciseInput: Omit<Exercise, 'id' | 'completed' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          user_id: user.id,
          name: exerciseInput.name,
          category: exerciseInput.category,
          sets: exerciseInput.sets || null,
          reps: exerciseInput.reps || null,
          weight: exerciseInput.weight || null,
          duration: exerciseInput.duration || null,
          notes: exerciseInput.notes || null,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;
      if (!data) throw new Error('No data returned from insert');

      const exerciseData: any = Array.isArray(data) ? data[0] : data;
      const newExercise: Exercise = {
        id: exerciseData.id,
        name: exerciseData.name,
        category: exerciseData.category,
        sets: exerciseData.sets || undefined,
        reps: exerciseData.reps || undefined,
        weight: exerciseData.weight || undefined,
        duration: exerciseData.duration || undefined,
        notes: exerciseData.notes || undefined,
        completed: exerciseData.completed,
        createdAt: new Date(exerciseData.created_at),
      };

      setExercises(prev => [newExercise, ...prev]);
    } catch (error) {
      console.error('Error adding exercise:', error);
      throw error;
    }
  };

  const updateExercise = async (id: string, updates: Partial<Exercise>) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .update({
          name: updates.name,
          category: updates.category,
          sets: updates.sets || null,
          reps: updates.reps || null,
          weight: updates.weight || null,
          duration: updates.duration || null,
          notes: updates.notes || null,
          completed: updates.completed,
        })
        .eq('id', id);

      if (error) throw error;

      setExercises(prev =>
        prev.map(exercise =>
          exercise.id === id ? { ...exercise, ...updates } : exercise
        )
      );
    } catch (error) {
      console.error('Error updating exercise:', error);
      throw error;
    }
  };

  const deleteExercise = async (id: string) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setExercises(prev => prev.filter(exercise => exercise.id !== id));
    } catch (error) {
      console.error('Error deleting exercise:', error);
      throw error;
    }
  };

  const toggleExerciseComplete = async (id: string) => {
    const exercise = exercises.find(ex => ex.id === id);
    if (!exercise) return;

    await updateExercise(id, { completed: !exercise.completed });
  };

  return {
    exercises,
    loading,
    addExercise,
    updateExercise,
    deleteExercise,
    toggleExerciseComplete,
    refetch: fetchExercises,
  };
}