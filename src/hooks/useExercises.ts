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

      const formattedExercises: Exercise[] = data.map(exercise => ({
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

  const addExercise = async (exerciseData: Omit<Exercise, 'id' | 'completed' | 'createdAt'>) => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          user_id: user.id,
          name: exerciseData.name,
          category: exerciseData.category,
          sets: exerciseData.sets || null,
          reps: exerciseData.reps || null,
          weight: exerciseData.weight || null,
          duration: exerciseData.duration || null,
          notes: exerciseData.notes || null,
          completed: false,
        })
        .select()
        .single();

      if (error) throw error;

      const newExercise: Exercise = {
        id: data.id,
        name: data.name,
        category: data.category,
        sets: data.sets || undefined,
        reps: data.reps || undefined,
        weight: data.weight || undefined,
        duration: data.duration || undefined,
        notes: data.notes || undefined,
        completed: data.completed,
        createdAt: new Date(data.created_at),
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