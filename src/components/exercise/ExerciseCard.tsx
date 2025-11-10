import { Check, Clock, Copyright as Weight, RotateCcw, Trash2, Edit3 } from 'lucide-react';
import { Exercise } from '../../types';
import { getCategoryColor, formatWeight, formatDuration } from '../../utils';
import { Card } from '../ui';

interface ExerciseCardProps {
  exercise: Exercise;
  onToggleComplete: (id: string) => void;
  onDelete: (id: string) => void;
  onEdit?: (exercise: Exercise) => void;
  onStartWorkout?: (exercise: Exercise) => void;
}

export default function ExerciseCard({ exercise, onToggleComplete, onDelete, onEdit, onStartWorkout }: ExerciseCardProps) {

  return (
    <Card className={`transition-all duration-200 ${exercise.completed ? 'bg-success-50 border-success-200' : ''}`} hover={!exercise.completed}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className={`font-semibold text-lg ${exercise.completed ? 'text-success-800 line-through' : 'text-gray-900'}`}>
              {exercise.name}
            </h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(exercise.category)}`}>
              {exercise.category}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
            {exercise.sets && exercise.reps && (
              <div className="flex items-center gap-1">
                <RotateCcw size={16} />
                <span>{exercise.sets} × {exercise.reps}</span>
              </div>
            )}
            {exercise.weight && (
              <div className="flex items-center gap-1">
                <Weight size={16} />
                <span>{formatWeight(exercise.weight)}</span>
              </div>
            )}
            {exercise.duration && (
              <div className="flex items-center gap-1">
                <Clock size={16} />
                <span>{formatDuration(exercise.duration)}</span>
              </div>
            )}
          </div>

          {exercise.notes && (
            <p className="text-sm text-gray-600 mb-3 italic">
              {exercise.notes}
            </p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-3">
          {onStartWorkout && (
            <button
              onClick={() => onStartWorkout(exercise)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg font-medium bg-primary-100 text-primary-700 hover:bg-primary-200 transition-colors"
            >
              <Clock size={16} />
              Start Workout
            </button>
          )}
          <button
            onClick={() => onToggleComplete(exercise.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-colors ${
              exercise.completed
                ? 'bg-success-100 text-success-700 hover:bg-success-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Check size={16} />
            {exercise.completed ? 'Completed' : 'Mark Complete'}
          </button>
        </div>

        <div className="flex gap-2">
          {onEdit && (
            <button
              onClick={() => onEdit(exercise)}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Edit exercise"
            >
              <Edit3 size={16} />
            </button>
          )}
          <button
            onClick={() => onDelete(exercise.id)}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Delete exercise"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>
    </Card>
  );
}