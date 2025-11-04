import { useState } from 'react';
import { Calendar, CheckCircle, Clock, ArrowLeft, Target } from 'lucide-react';
import { format, isToday, isPast } from 'date-fns';
import { TrainingPlan, WorkoutSession } from '../../types';
import ExerciseCard from '../exercise/ExerciseCard';

interface TrainingPlanViewProps {
  plan: TrainingPlan;
  onUpdatePlan: (plan: TrainingPlan) => void;
  onBack: () => void;
}

export default function TrainingPlanView({ plan, onUpdatePlan, onBack }: TrainingPlanViewProps) {
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutSession | null>(null);

  const toggleExerciseComplete = (workoutId: string, exerciseId: string) => {
    const updatedWorkouts = plan.workouts.map((workout: WorkoutSession) => {
      if (workout.id === workoutId) {
        const updatedExercises = workout.exercises.map((exercise: any) =>
          exercise.id === exerciseId
            ? { ...exercise, completed: !exercise.completed }
            : exercise
        );
        return { ...workout, exercises: updatedExercises };
      }
      return workout;
    });

    onUpdatePlan({ ...plan, workouts: updatedWorkouts });
  };

  const deleteExercise = (workoutId: string, exerciseId: string) => {
    const updatedWorkouts = plan.workouts.map((workout: WorkoutSession) => {
      if (workout.id === workoutId) {
        const updatedExercises = workout.exercises.filter((exercise: any) => exercise.id !== exerciseId);
        return { ...workout, exercises: updatedExercises };
      }
      return workout;
    });

    onUpdatePlan({ ...plan, workouts: updatedWorkouts });
  };

  const getWorkoutStatus = (workout: WorkoutSession) => {
    const completedCount = workout.exercises.filter(ex => ex.completed).length;
    const totalCount = workout.exercises.length;
    
    if (completedCount === totalCount && totalCount > 0) return 'completed';
    if (completedCount > 0) return 'partial';
    if (isPast(workout.date) && !isToday(workout.date)) return 'missed';
    return 'pending';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-success-100 border-success-300 text-success-800';
      case 'partial': return 'bg-yellow-100 border-yellow-300 text-yellow-800';
      case 'missed': return 'bg-red-100 border-red-300 text-red-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-700';
    }
  };

  const totalWorkouts = plan.workouts.length;
  const completedWorkouts = plan.workouts.filter((w: WorkoutSession) => getWorkoutStatus(w) === 'completed').length;
  const progressPercentage = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

  if (selectedWorkout) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setSelectedWorkout(null)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Plan
          </button>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              {format(selectedWorkout.date, 'EEEE, MMMM d, yyyy')}
            </h2>
            <p className="text-gray-600">
              {selectedWorkout.exercises.filter((ex: any) => ex.completed).length} of {selectedWorkout.exercises.length} exercises completed
            </p>
          </div>
        </div>

        <div className="grid gap-4">
          {selectedWorkout.exercises.map((exercise: any) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onToggleComplete={(id: string) => toggleExerciseComplete(selectedWorkout.id, id)}
              onDelete={(id: string) => deleteExercise(selectedWorkout.id, id)}
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Plans
        </button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold text-gray-900">{plan.name}</h1>
          <p className="text-gray-600">
            {format(plan.startDate, 'MMM d')} - {format(plan.endDate, 'MMM d, yyyy')}
          </p>
        </div>
      </div>

      {plan.description && (
        <div className="card">
          <p className="text-gray-700">{plan.description}</p>
        </div>
      )}

      <div className="card">
        <div className="flex items-center gap-3 mb-4">
          <Target className="text-primary-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Progress Overview</h2>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Workouts Completed</span>
              <span>{completedWorkouts} / {totalWorkouts}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div
                className="bg-primary-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-success-600">{completedWorkouts}</div>
              <div className="text-sm text-gray-600">Completed</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-yellow-600">
                {plan.workouts.filter((w: WorkoutSession) => getWorkoutStatus(w) === 'partial').length}
              </div>
              <div className="text-sm text-gray-600">In Progress</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-red-600">
                {plan.workouts.filter((w: WorkoutSession) => getWorkoutStatus(w) === 'missed').length}
              </div>
              <div className="text-sm text-gray-600">Missed</div>
            </div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <Calendar className="text-primary-600" size={24} />
          <h2 className="text-xl font-semibold text-gray-900">Workout Schedule</h2>
        </div>

        <div className="grid gap-3">
          {plan.workouts.map((workout: WorkoutSession) => {
            const status = getWorkoutStatus(workout);
            const completedCount = workout.exercises.filter((ex: any) => ex.completed).length;
            const totalCount = workout.exercises.length;

            return (
              <div
                key={workout.id}
                onClick={() => setSelectedWorkout(workout)}
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${getStatusColor(status)} ${
                  isToday(workout.date) ? 'ring-2 ring-primary-500' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">
                        {format(workout.date, 'EEEE, MMM d')}
                      </h3>
                      {isToday(workout.date) && (
                        <span className="px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
                          Today
                        </span>
                      )}
                    </div>
                    <p className="text-sm opacity-75">
                      {totalCount} exercises • {completedCount} completed
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {status === 'completed' && <CheckCircle className="text-success-600" size={20} />}
                    {status === 'partial' && <Clock className="text-yellow-600" size={20} />}
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {Math.round((completedCount / totalCount) * 100)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}