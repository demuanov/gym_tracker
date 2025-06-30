import React, { useState } from 'react';
import { Calendar, Plus, X } from 'lucide-react';
import { format, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { TrainingPlan, Exercise } from '../types';

interface TrainingPlanFormProps {
  exercises: Exercise[];
  onCreatePlan: (plan: Omit<TrainingPlan, 'id'>) => void;
  onClose: () => void;
}

export default function TrainingPlanForm({ exercises, onCreatePlan, onClose }: TrainingPlanFormProps) {
  const [planName, setPlanName] = useState('');
  const [startDate, setStartDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [description, setDescription] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!planName.trim() || selectedExercises.length === 0) return;

    const start = new Date(startDate);
    const end = endOfMonth(start);
    
    // Create a 4-week plan with workouts every other day
    const workouts = [];
    let currentDate = start;
    let workoutCount = 0;

    while (currentDate <= end && workoutCount < 16) { // Max 16 workouts in a month
      const workoutExercises = selectedExercises.map(exerciseId => {
        const originalExercise = exercises.find(ex => ex.id === exerciseId);
        if (!originalExercise) return null;
        
        return {
          ...originalExercise,
          id: `${originalExercise.id}-${currentDate.getTime()}`,
          completed: false,
          createdAt: new Date()
        };
      }).filter(Boolean) as Exercise[];

      workouts.push({
        id: `workout-${currentDate.getTime()}`,
        date: new Date(currentDate),
        exercises: workoutExercises
      });

      currentDate = addDays(currentDate, 2); // Every other day
      workoutCount++;
    }

    onCreatePlan({
      name: planName.trim(),
      startDate: start,
      endDate: end,
      workouts,
      description: description.trim() || undefined
    });
  };

  const toggleExercise = (exerciseId: string) => {
    setSelectedExercises(prev =>
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const groupedExercises = exercises.reduce((acc, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = [];
    }
    acc[exercise.category].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Training Plan</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Plan Name *
            </label>
            <input
              type="text"
              value={planName}
              onChange={(e) => setPlanName(e.target.value)}
              className="input-field"
              placeholder="e.g., January Strength Training"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input-field resize-none"
              rows={3}
              placeholder="Describe your training goals..."
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Exercises * ({selectedExercises.length} selected)
            </label>
            
            {Object.keys(groupedExercises).length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                No exercises available. Create some exercises first!
              </p>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {Object.entries(groupedExercises).map(([category, categoryExercises]) => (
                  <div key={category}>
                    <h4 className="font-medium text-gray-900 mb-2">{category}</h4>
                    <div className="space-y-2 ml-4">
                      {categoryExercises.map(exercise => (
                        <label key={exercise.id} className="flex items-center gap-3 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={selectedExercises.includes(exercise.id)}
                            onChange={() => toggleExercise(exercise.id)}
                            className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm text-gray-700">{exercise.name}</span>
                          {exercise.sets && exercise.reps && (
                            <span className="text-xs text-gray-500">
                              ({exercise.sets} × {exercise.reps})
                            </span>
                          )}
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button 
              type="submit" 
              className="btn-primary flex-1 flex items-center justify-center gap-2"
              disabled={selectedExercises.length === 0}
            >
              <Calendar size={20} />
              Create Plan
            </button>
            <button type="button" onClick={onClose} className="btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}