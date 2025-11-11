import { Calendar, Target, Clock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { getCategoryColor } from '../../utils';
import { CalendarWorkout, Exercise } from '../../types';

interface TodayWorkoutViewProps {
  workouts: CalendarWorkout[];
  onNavigateToCalendar: () => void;
  onNavigateToPlans: () => void;
  onStartWorkout: (exercise: Exercise) => void;
  onCompleteWorkout: (workoutId: string) => void;
}

export function TodayWorkoutView({
  workouts,
  onNavigateToCalendar,
  onNavigateToPlans,
  onStartWorkout,
  onCompleteWorkout,
}: TodayWorkoutViewProps) {
  const today = new Date();
  const todaysWorkout = workouts.find(
    (workout) => workout.scheduled_date.toDateString() === today.toDateString()
  );

  if (!todaysWorkout) {
    return (
      <Card className="text-center py-12">
        <Target className="mx-auto text-gray-400 mb-4" size={48} />
        <h3 className="text-xl font-semibold text-gray-900 mb-2">
          No workout scheduled for today
        </h3>
        <p className="text-gray-600 mb-6">
          Schedule a training plan for today to get started with your workout
        </p>
        <div className="flex gap-3 justify-center">
          <Button onClick={onNavigateToCalendar} leftIcon={<Calendar size={16} />}>
            Schedule Workout
          </Button>
          <Button onClick={onNavigateToPlans} variant="outline" leftIcon={<Target size={16} />}>
            View Plans
          </Button>
        </div>
      </Card>
    );
  }

  const renderWorkoutStatus = () => {
    const status = todaysWorkout.status;
    const statusConfig = {
      completed: {
        label: 'Completed',
        className: 'bg-green-100 text-green-800',
      },
      in_progress: {
        label: 'In Progress',
        className: 'bg-blue-100 text-blue-800',
      },
      scheduled: {
        label: 'Scheduled',
        className: 'bg-yellow-100 text-yellow-800',
      },
      skipped: {
        label: 'Skipped',
        className: 'bg-gray-100 text-gray-700',
      },
    } as const;

    const config = statusConfig[status] ?? statusConfig.scheduled;
    return (
      <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.className}`}>
        {config.label}
      </span>
    );
  };

  if (!todaysWorkout.training_plan) {
    return (
      <Card className="text-center py-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Workout scheduled but no plan assigned
        </h3>
        <p className="text-gray-600 mb-4">
          This workout doesn't have a training plan assigned to it yet.
        </p>
        <Button onClick={onNavigateToCalendar} variant="outline">
          Edit in Calendar
        </Button>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-xl font-semibold text-gray-900">
              {todaysWorkout.training_plan.name}
            </h3>
            {todaysWorkout.training_plan.description && (
              <p className="text-gray-600 mt-1">
                {todaysWorkout.training_plan.description}
              </p>
            )}
          </div>
          <div className="flex items-center gap-2">{renderWorkoutStatus()}</div>
        </div>

        {todaysWorkout.training_plan.exercises && (
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">
              Exercises ({todaysWorkout.training_plan.exercises.length})
            </h4>
            <div className="grid gap-3">
              {todaysWorkout.training_plan.exercises.map((exercise) => (
                <Card key={exercise.id} className="bg-gray-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h5 className="font-medium text-gray-900">{exercise.name}</h5>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(
                            exercise.category
                          )}`}
                        >
                          {exercise.category}
                        </span>
                      </div>
                      <div className="flex gap-4 text-sm text-gray-600">
                        {exercise.sets && <span>Sets: {exercise.sets}</span>}
                        {exercise.reps && <span>Reps: {exercise.reps}</span>}
                        {exercise.weight && <span>Weight: {exercise.weight}kg</span>}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={() => onStartWorkout(exercise)} leftIcon={<Clock size={14} />}>
                        Start
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </Card>

      {todaysWorkout.status !== 'completed' && (
        <Card>
          <div className="text-center py-6">
            <h4 className="font-semibold text-gray-900 mb-2">Ready to finish your workout?</h4>
            <p className="text-gray-600 mb-4">
              Complete all exercises to mark today's workout as finished
            </p>
            <Button
              onClick={() => onCompleteWorkout(todaysWorkout.id)}
              size="lg"
              leftIcon={<Target size={16} />}
            >
              Complete Workout
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}
