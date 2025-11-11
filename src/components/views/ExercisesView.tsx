import { Plus, Dumbbell } from 'lucide-react';
import { Exercise } from '../../types';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ExerciseCard } from '../exercise';

interface ExercisesViewProps {
  exercises: Exercise[];
  loading: boolean;
  onAddExercise: () => void;
  onToggleComplete: (exerciseId: string) => void;
  onDeleteExercise: (exerciseId: string) => void;
  onStartWorkout: (exercise: Exercise) => void;
}

export function ExercisesView({
  exercises,
  loading,
  onAddExercise,
  onToggleComplete,
  onDeleteExercise,
  onStartWorkout,
}: ExercisesViewProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Your Exercises</h2>
        <Button onClick={onAddExercise} leftIcon={<Plus size={20} />}>
          Add Exercise
        </Button>
      </div>

      {loading ? (
        <Card className="text-center py-12">
          <Dumbbell className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
          <p className="text-gray-600">Loading exercises...</p>
        </Card>
      ) : exercises.length === 0 ? (
        <Card className="text-center py-12">
          <Dumbbell className="mx-auto text-gray-400 mb-4" size={48} />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">No exercises yet</h3>
          <p className="text-gray-600 mb-6">Start by adding your first exercise to track your workouts</p>
          <Button onClick={onAddExercise}>Add Your First Exercise</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onToggleComplete={onToggleComplete}
              onDelete={onDeleteExercise}
              onStartWorkout={onStartWorkout}
            />
          ))}
        </div>
      )}
    </div>
  );
}
