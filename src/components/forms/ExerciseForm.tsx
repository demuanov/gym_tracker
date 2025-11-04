import React, { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { Exercise, ExerciseCategory } from '../../types';

interface ExerciseFormProps {
  onAddExercise: (exercise: Omit<Exercise, 'id' | 'completed' | 'createdAt'>) => void;
  onClose: () => void;
}

const categories: ExerciseCategory[] = [
  'Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core', 'Cardio', 'Full Body'
];

export default function ExerciseForm({ onAddExercise, onClose }: ExerciseFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: 'Chest' as ExerciseCategory,
    sets: '',
    reps: '',
    weight: '',
    duration: '',
    notes: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    onAddExercise({
      name: formData.name.trim(),
      category: formData.category,
      sets: formData.sets ? parseInt(formData.sets) : undefined,
      reps: formData.reps ? parseInt(formData.reps) : undefined,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      duration: formData.duration ? parseInt(formData.duration) : undefined,
      notes: formData.notes.trim() || undefined
    });

    setFormData({
      name: '',
      category: 'Chest',
      sets: '',
      reps: '',
      weight: '',
      duration: '',
      notes: ''
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Add New Exercise</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Exercise Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input-field"
              placeholder="e.g., Bench Press"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value as ExerciseCategory })}
              className="input-field"
            >
              {categories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sets
              </label>
              <input
                type="number"
                value={formData.sets}
                onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                className="input-field"
                placeholder="3"
                min="1"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reps
              </label>
              <input
                type="number"
                value={formData.reps}
                onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                className="input-field"
                placeholder="12"
                min="1"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Weight (kg)
              </label>
              <input
                type="number"
                value={formData.weight}
                onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                className="input-field"
                placeholder="50"
                min="0"
                step="0.5"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Duration (min)
              </label>
              <input
                type="number"
                value={formData.duration}
                onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                className="input-field"
                placeholder="30"
                min="1"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notes
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="input-field resize-none"
              rows={3}
              placeholder="Additional notes..."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button type="submit" className="btn-primary flex-1 flex items-center justify-center gap-2">
              <Plus size={20} />
              Add Exercise
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