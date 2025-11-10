import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Circle, 
  Timer,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react';
import { Exercise, ExerciseSet, WorkoutTimer } from '../../types';
import { Button, Card } from '../ui';
import { getCategoryColor, formatWeight } from '../../utils';

interface ExerciseDetailViewProps {
  exercise: Exercise;
  sets: ExerciseSet[];
  activeTimer?: WorkoutTimer | null;
  onBack: () => void;
  onAddSet: () => void;
  onUpdateSet: (setId: string, updates: Partial<ExerciseSet>) => void;
  onDeleteSet: (setId: string) => void;
  onCompleteSet: (setId: string) => void;
  onStartTimer: (type: 'exercise' | 'rest', duration: number) => void;
  onPauseTimer: () => void;
  onResetTimer: () => void;
  onCompleteExercise: () => void;
}

export default function ExerciseDetailView({
  exercise,
  sets,
  activeTimer,
  onBack,
  onAddSet,
  onUpdateSet,
  onDeleteSet,
  onCompleteSet,
  onStartTimer,
  onPauseTimer,
  onResetTimer,
  onCompleteExercise
}: ExerciseDetailViewProps) {
  const [newSetReps, setNewSetReps] = useState(exercise.reps || 12);
  const [newSetWeight, setNewSetWeight] = useState(exercise.weight || 0);

  const completedSets = sets.filter(set => set.completed).length;
  const totalSets = sets.length;
  const isExerciseComplete = totalSets > 0 && completedSets === totalSets;

  const handleAddSet = () => {
    onAddSet();
    // Reset form values to defaults
    setNewSetReps(exercise.reps || 12);
    setNewSetWeight(exercise.weight || 0);
  };

  const handleSetUpdate = (setId: string, field: 'reps' | 'weight', value: number) => {
    onUpdateSet(setId, { [field]: value });
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <Card>
          <div className="flex items-center gap-4 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              leftIcon={<ArrowLeft size={16} />}
            >
              Back
            </Button>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h1 className="text-2xl font-bold text-gray-900">{exercise.name}</h1>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(exercise.category)}`}>
                  {exercise.category}
                </span>
              </div>
              {exercise.notes && (
                <p className="text-gray-600">{exercise.notes}</p>
              )}
            </div>
          </div>

          {/* Progress Overview */}
          <div className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">{totalSets}</div>
              <div className="text-sm text-gray-600">Total Sets</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedSets}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">{totalSets - completedSets}</div>
              <div className="text-sm text-gray-600">Remaining</div>
            </div>
          </div>
        </Card>

        {/* Timer Section */}
        {activeTimer && (
          <Card>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Timer className="text-blue-600" size={20} />
                </div>
                <div>
                  <div className="font-semibold text-gray-900">
                    {activeTimer.timer_type === 'rest' ? 'Rest Timer' : 'Exercise Timer'}
                  </div>
                  <div className="text-2xl font-mono font-bold text-blue-600">
                    {formatTime(activeTimer.duration)}
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onPauseTimer}
                  leftIcon={<Pause size={16} />}
                >
                  Pause
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onResetTimer}
                  leftIcon={<RotateCcw size={16} />}
                >
                  Reset
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Sets Management */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Sets</h2>
            <Button
              onClick={handleAddSet}
              leftIcon={<Plus size={16} />}
              size="sm"
            >
              Add Set
            </Button>
          </div>

          {sets.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Circle size={32} className="mx-auto mb-2 opacity-50" />
              <p>No sets added yet</p>
              <p className="text-sm">Click "Add Set" to start your workout</p>
            </div>
          ) : (
            <div className="space-y-3">
              {sets.map((set, index) => (
                <div
                  key={set.id}
                  className={`
                    p-4 border rounded-lg transition-colors
                    ${set.completed 
                      ? 'bg-green-50 border-green-200' 
                      : 'bg-white border-gray-200 hover:border-gray-300'
                    }
                  `}
                >
                  <div className="flex items-center gap-4">
                    {/* Set Number */}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => onCompleteSet(set.id)}
                        className={`
                          p-1 rounded-full transition-colors
                          ${set.completed 
                            ? 'text-green-600 bg-green-100' 
                            : 'text-gray-400 hover:text-green-600 hover:bg-green-50'
                          }
                        `}
                      >
                        {set.completed ? <CheckCircle size={20} /> : <Circle size={20} />}
                      </button>
                      <span className="font-medium text-gray-900">
                        Set {set.set_number}
                      </span>
                    </div>

                    {/* Reps Input */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 min-w-[40px]">Reps:</label>
                      <input
                        type="number"
                        value={set.reps}
                        onChange={(e) => handleSetUpdate(set.id, 'reps', parseInt(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                        disabled={set.completed}
                      />
                    </div>

                    {/* Weight Input */}
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-600 min-w-[50px]">Weight:</label>
                      <input
                        type="number"
                        step="0.5"
                        value={set.weight || 0}
                        onChange={(e) => handleSetUpdate(set.id, 'weight', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 border border-gray-300 rounded text-center focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        min="0"
                        disabled={set.completed}
                      />
                      <span className="text-sm text-gray-600">kg</span>
                    </div>

                    {/* Rest Timer Button */}
                    {set.completed && !activeTimer && index < sets.length - 1 && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStartTimer('rest', set.rest_time || 90)}
                        leftIcon={<Play size={14} />}
                      >
                        Rest ({formatTime(set.rest_time || 90)})
                      </Button>
                    )}

                    {/* Delete Set */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteSet(set.id)}
                      className="ml-auto p-2 text-red-600 hover:bg-red-50"
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>

                  {/* Set completion time */}
                  {set.completed && set.completed_at && (
                    <div className="mt-2 text-xs text-green-600">
                      Completed at {new Date(set.completed_at).toLocaleTimeString()}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Timer Controls */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 mb-3">Quick Timers</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[30, 60, 90, 120].map(seconds => (
              <Button
                key={seconds}
                variant="outline"
                onClick={() => onStartTimer('rest', seconds)}
                disabled={!!activeTimer}
                leftIcon={<Timer size={16} />}
              >
                {formatTime(seconds)}
              </Button>
            ))}
          </div>
        </Card>

        {/* Complete Exercise */}
        {totalSets > 0 && (
          <Card>
            <div className="text-center">
              {isExerciseComplete ? (
                <div className="p-6">
                  <CheckCircle size={48} className="mx-auto text-green-600 mb-3" />
                  <h3 className="text-xl font-semibold text-green-900 mb-2">
                    Exercise Completed!
                  </h3>
                  <p className="text-green-700 mb-4">
                    Great job! You completed all {totalSets} sets.
                  </p>
                  <Button
                    onClick={onCompleteExercise}
                    variant="success"
                    size="lg"
                  >
                    Finish Exercise
                  </Button>
                </div>
              ) : (
                <div className="p-6">
                  <div className="text-sm text-gray-600 mb-2">
                    Progress: {completedSets} of {totalSets} sets completed
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${(completedSets / totalSets) * 100}%` }}
                    />
                  </div>
                  <Button
                    onClick={onCompleteExercise}
                    variant="primary"
                    size="lg"
                    disabled={completedSets === 0}
                  >
                    Finish Exercise ({completedSets}/{totalSets} sets)
                  </Button>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}