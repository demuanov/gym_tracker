import React, { useState } from 'react';
import { X, Plus, Dumbbell } from 'lucide-react';
import { TrainingPlan, Exercise } from '../../types';
import { Button, Card } from '../ui';
import { EXERCISE_CATEGORIES } from '../../config/constants';

interface EnhancedTrainingPlanFormProps {
  exercises: Exercise[];
  onCreatePlan: (plan: Omit<TrainingPlan, 'id'>) => void;
  onClose: () => void;
}

export default function EnhancedTrainingPlanForm({ 
  exercises, 
  onCreatePlan, 
  onClose 
}: EnhancedTrainingPlanFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
  });
  const [selectedExercises, setSelectedExercises] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const toggleExerciseSelection = (exerciseId: string) => {
    setSelectedExercises(prev =>
      prev.includes(exerciseId)
        ? prev.filter(id => id !== exerciseId)
        : [...prev, exerciseId]
    );
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Plan name is required';
    }
    
    if (selectedExercises.length === 0) {
      newErrors.exercises = 'Please select at least one exercise';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    const selectedExerciseObjects = exercises.filter(ex => 
      selectedExercises.includes(ex.id)
    );

    const newPlan: Omit<TrainingPlan, 'id'> = {
      name: formData.name,
      description: formData.description || undefined,
      startDate: new Date(), // Will be set when scheduling
      endDate: new Date(), // Will be set when scheduling  
      workouts: [], // Will be created when scheduling
      exercises: selectedExerciseObjects
    };

    onCreatePlan(newPlan);
  };

  const groupedExercises = exercises.reduce((acc: Record<string, Exercise[]>, exercise) => {
    if (!acc[exercise.category]) {
      acc[exercise.category] = [];
    }
    acc[exercise.category].push(exercise);
    return acc;
  }, {});

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" padding="none">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Create Training Plan</h2>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="p-2"
          >
            <X size={16} />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Plan Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Plan Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="e.g., Upper Body Strength, Full Body Workout..."
            />
            {errors.name && (
              <p className="text-red-600 text-sm mt-1">{errors.name}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description (optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
              rows={3}
              placeholder="Describe your training plan..."
            />
          </div>

          {/* Exercise Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Select Exercises *
            </label>
            {errors.exercises && (
              <p className="text-red-600 text-sm mb-3">{errors.exercises}</p>
            )}

            {Object.keys(groupedExercises).length === 0 ? (
              <Card className="text-center py-8">
                <Dumbbell className="mx-auto text-gray-400 mb-3" size={32} />
                <p className="text-gray-600 mb-2">No exercises available</p>
                <p className="text-sm text-gray-500">
                  Create some exercises first to build your training plan
                </p>
              </Card>
            ) : (
              <div className="space-y-4 max-h-64 overflow-y-auto border border-gray-200 rounded-lg p-4">
                {Object.entries(groupedExercises).map(([category, categoryExercises]) => (
                  <div key={category}>
                    <h4 className="font-medium text-gray-900 mb-2 sticky top-0 bg-white">
                      {category}
                    </h4>
                    <div className="space-y-2 ml-4">
                      {categoryExercises.map((exercise) => (
                        <label 
                          key={exercise.id} 
                          className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded"
                        >
                          <input
                            type="checkbox"
                            checked={selectedExercises.includes(exercise.id)}
                            onChange={() => toggleExerciseSelection(exercise.id)}
                            className="h-4 w-4 text-primary-600 rounded border-gray-300 focus:ring-primary-500"
                          />
                          <div className="flex-1">
                            <span className="text-sm font-medium text-gray-900">
                              {exercise.name}
                            </span>
                            {(exercise.sets || exercise.reps || exercise.weight) && (
                              <div className="text-xs text-gray-500">
                                {exercise.sets && exercise.reps && (
                                  <span>{exercise.sets} × {exercise.reps}</span>
                                )}
                                {exercise.weight && (
                                  <span className="ml-2">{exercise.weight}kg</span>
                                )}
                              </div>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {selectedExercises.length > 0 && (
              <div className="mt-3 p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-700">
                  <strong>{selectedExercises.length}</strong> exercise{selectedExercises.length !== 1 ? 's' : ''} selected
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-4 border-t border-gray-200">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={Object.keys(groupedExercises).length === 0}
              className="flex-1"
            >
              Create Plan
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}