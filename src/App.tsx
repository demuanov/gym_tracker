import React, { useState } from 'react';
import { Dumbbell, Plus, Calendar, List, Target } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { Exercise, TrainingPlan } from './types';
import ExerciseForm from './components/ExerciseForm';
import ExerciseCard from './components/ExerciseCard';
import TrainingPlanForm from './components/TrainingPlanForm';
import TrainingPlanView from './components/TrainingPlanView';

type View = 'exercises' | 'plans' | 'current-plan';

function App() {
  const [exercises, setExercises] = useLocalStorage<Exercise[]>('gym-exercises', []);
  const [trainingPlans, setTrainingPlans] = useLocalStorage<TrainingPlan[]>('training-plans', []);
  const [currentView, setCurrentView] = useState<View>('exercises');
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);

  const addExercise = (exerciseData: Omit<Exercise, 'id' | 'completed' | 'createdAt'>) => {
    const newExercise: Exercise = {
      ...exerciseData,
      id: Date.now().toString(),
      completed: false,
      createdAt: new Date()
    };
    setExercises([...exercises, newExercise]);
    setShowExerciseForm(false);
  };

  const toggleExerciseComplete = (id: string) => {
    setExercises(exercises.map(exercise =>
      exercise.id === id ? { ...exercise, completed: !exercise.completed } : exercise
    ));
  };

  const deleteExercise = (id: string) => {
    setExercises(exercises.filter(exercise => exercise.id !== id));
  };

  const createTrainingPlan = (planData: Omit<TrainingPlan, 'id'>) => {
    const newPlan: TrainingPlan = {
      ...planData,
      id: Date.now().toString()
    };
    setTrainingPlans([...trainingPlans, newPlan]);
    setShowPlanForm(false);
  };

  const updateTrainingPlan = (updatedPlan: TrainingPlan) => {
    setTrainingPlans(trainingPlans.map(plan =>
      plan.id === updatedPlan.id ? updatedPlan : plan
    ));
    setSelectedPlan(updatedPlan);
  };

  const deletePlan = (id: string) => {
    setTrainingPlans(trainingPlans.filter(plan => plan.id !== id));
  };

  const completedExercises = exercises.filter(ex => ex.completed).length;
  const totalExercises = exercises.length;
  const activePlans = trainingPlans.length;

  if (selectedPlan) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <TrainingPlanView
            plan={selectedPlan}
            onUpdatePlan={updateTrainingPlan}
            onBack={() => setSelectedPlan(null)}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Dumbbell className="text-primary-600" size={40} />
            <h1 className="text-4xl font-bold text-gray-900">Gym Tracker</h1>
          </div>
          <p className="text-gray-600 text-lg">Track your exercises and follow your training plans</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="card text-center">
            <div className="text-3xl font-bold text-primary-600 mb-2">{totalExercises}</div>
            <div className="text-gray-600">Total Exercises</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-success-600 mb-2">{completedExercises}</div>
            <div className="text-gray-600">Completed Today</div>
          </div>
          <div className="card text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{activePlans}</div>
            <div className="text-gray-600">Training Plans</div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap gap-4 mb-8">
          <button
            onClick={() => setCurrentView('exercises')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'exercises'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <List size={20} />
            Exercises
          </button>
          <button
            onClick={() => setCurrentView('plans')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              currentView === 'plans'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
            }`}
          >
            <Calendar size={20} />
            Training Plans
          </button>
        </div>

        {/* Content */}
        {currentView === 'exercises' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Exercises</h2>
              <button
                onClick={() => setShowExerciseForm(true)}
                className="btn-primary flex items-center gap-2"
              >
                <Plus size={20} />
                Add Exercise
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="card text-center py-12">
                <Dumbbell className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No exercises yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first exercise to track your workouts</p>
                <button
                  onClick={() => setShowExerciseForm(true)}
                  className="btn-primary"
                >
                  Add Your First Exercise
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {exercises.map(exercise => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onToggleComplete={toggleExerciseComplete}
                    onDelete={deleteExercise}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {currentView === 'plans' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Training Plans</h2>
              <button
                onClick={() => setShowPlanForm(true)}
                className="btn-primary flex items-center gap-2"
                disabled={exercises.length === 0}
              >
                <Plus size={20} />
                Create Plan
              </button>
            </div>

            {exercises.length === 0 ? (
              <div className="card text-center py-12">
                <Target className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create exercises first</h3>
                <p className="text-gray-600 mb-6">You need to have exercises before creating a training plan</p>
                <button
                  onClick={() => setCurrentView('exercises')}
                  className="btn-primary"
                >
                  Go to Exercises
                </button>
              </div>
            ) : trainingPlans.length === 0 ? (
              <div className="card text-center py-12">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No training plans yet</h3>
                <p className="text-gray-600 mb-6">Create your first monthly training plan to stay organized</p>
                <button
                  onClick={() => setShowPlanForm(true)}
                  className="btn-primary"
                >
                  Create Your First Plan
                </button>
              </div>
            ) : (
              <div className="grid gap-4">
                {trainingPlans.map(plan => {
                  const totalWorkouts = plan.workouts.length;
                  const completedWorkouts = plan.workouts.filter(workout =>
                    workout.exercises.every(ex => ex.completed) && workout.exercises.length > 0
                  ).length;
                  const progressPercentage = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

                  return (
                    <div key={plan.id} className="card hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                          <p className="text-gray-600 mb-3">
                            {plan.startDate.toLocaleDateString()} - {plan.endDate.toLocaleDateString()}
                          </p>
                          {plan.description && (
                            <p className="text-gray-700 mb-3">{plan.description}</p>
                          )}
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex justify-between text-sm text-gray-600 mb-2">
                          <span>Progress</span>
                          <span>{completedWorkouts} / {totalWorkouts} workouts</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercentage}%` }}
                          />
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={() => setSelectedPlan(plan)}
                          className="btn-primary flex-1"
                        >
                          View Plan
                        </button>
                        <button
                          onClick={() => deletePlan(plan.id)}
                          className="btn-secondary"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Modals */}
        {showExerciseForm && (
          <ExerciseForm
            onAddExercise={addExercise}
            onClose={() => setShowExerciseForm(false)}
          />
        )}

        {showPlanForm && (
          <TrainingPlanForm
            exercises={exercises}
            onCreatePlan={createTrainingPlan}
            onClose={() => setShowPlanForm(false)}
          />
        )}
      </div>
    </div>
  );
}

export default App;