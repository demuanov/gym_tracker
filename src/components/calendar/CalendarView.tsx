import { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  CheckCircle,
  Circle,
  Play
} from 'lucide-react';
import { format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  isSameMonth, 
  isSameDay, 
  isToday, 
  addMonths, 
  subMonths 
} from 'date-fns';
import { CalendarWorkout, TrainingPlan } from '../../types';
import { Button, Card } from '../ui';

interface CalendarViewProps {
  calendarWorkouts: CalendarWorkout[];
  trainingPlans: TrainingPlan[];
  onDateSelect: (date: Date) => void;
  onScheduleWorkout: (date: Date, planId?: string) => void;
  onWorkoutClick: (workout: CalendarWorkout) => void;
  selectedDate?: Date;
}

export default function CalendarView({
  calendarWorkouts,
  trainingPlans,
  onDateSelect,
  onScheduleWorkout,
  onWorkoutClick,
  selectedDate
}: CalendarViewProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [schedulingDate, setSchedulingDate] = useState<Date | null>(null);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  // Generate calendar days
  const days = [];
  let day = startDate;
  while (day <= endDate) {
    days.push(day);
    day = addDays(day, 1);
  }

  const nextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };

  const prevMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };

  const getWorkoutForDate = (date: Date): CalendarWorkout | undefined => {
    return calendarWorkouts.find(workout => 
      isSameDay(new Date(workout.scheduled_date), date)
    );
  };

  const getStatusColor = (status: CalendarWorkout['status']) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100 border-green-200';
      case 'in_progress':
        return 'text-blue-600 bg-blue-100 border-blue-200';
      case 'skipped':
        return 'text-gray-600 bg-gray-100 border-gray-200';
      default:
        return 'text-yellow-600 bg-yellow-100 border-yellow-200';
    }
  };

  const getStatusIcon = (status: CalendarWorkout['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle size={16} />;
      case 'in_progress':
        return <Play size={16} />;
      default:
        return <Circle size={16} />;
    }
  };

  const handleDateClick = (date: Date) => {
    onDateSelect(date);
    const workout = getWorkoutForDate(date);
    if (workout) {
      onWorkoutClick(workout);
    } else {
      setSchedulingDate(date);
      setShowScheduleModal(true);
    }
  };

  const handleScheduleWorkout = (planId?: string) => {
    if (schedulingDate) {
      onScheduleWorkout(schedulingDate, planId);
      setShowScheduleModal(false);
      setSchedulingDate(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Calendar Header */}
      <Card>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900 sm:text-xl">
            {format(currentMonth, 'MMMM yyyy')}
          </h2>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={prevMonth}
              className="p-2"
            >
              <ChevronLeft size={16} />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={nextMonth}
              className="p-2"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <div className="min-w-[600px] px-4 sm:px-0">
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div
                  key={day}
                  className="border-b p-2 text-center text-xs font-medium uppercase tracking-wide text-gray-500 sm:text-sm"
                >
                  {day}
                </div>
              ))}

              {/* Calendar Days */}
              {days.map((day, index) => {
                const workout = getWorkoutForDate(day);
                const isCurrentMonth = isSameMonth(day, monthStart);
                const isSelected = selectedDate && isSameDay(day, selectedDate);
                const dayIsToday = isToday(day);

                return (
                  <div
                    key={index}
                    onClick={() => handleDateClick(day)}
                    className={`
                      min-h-[96px] cursor-pointer border border-gray-200 p-2 transition-colors
                      ${isCurrentMonth ? 'bg-white hover:bg-gray-50' : 'bg-gray-50 text-gray-400'}
                      ${isSelected ? 'ring-2 ring-primary-500' : ''}
                      ${dayIsToday ? 'bg-blue-50 border-blue-200' : ''}
                    `}
                  >
                    <div className="flex h-full flex-col">
                      {/* Date Number */}
                      <div className={`mb-1 text-sm font-medium ${dayIsToday ? 'text-blue-600' : ''}`}>
                        {format(day, 'd')}
                      </div>

                      {/* Workout Indicator */}
                      {workout && (
                        <div className={`
                          flex items-center gap-1 rounded border px-2 py-1 text-xs font-medium
                          ${getStatusColor(workout.status)}
                        `}>
                          {getStatusIcon(workout.status)}
                          <span className="truncate">
                            {workout.training_plan?.name || 'Workout'}
                          </span>
                        </div>
                      )}

                      {/* Add Workout Button for Empty Days */}
                      {!workout && isCurrentMonth && (
                        <div className="mt-auto">
                          <div className="flex h-6 w-full items-center justify-center rounded border-2 border-dashed border-gray-300 opacity-0 transition-opacity hover:opacity-100">
                            <Plus size={12} className="text-gray-400" />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Schedule Workout Modal */}
      {showScheduleModal && schedulingDate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="max-w-md w-full" padding="lg">
            <div className="flex items-center gap-2 mb-4">
              <CalendarIcon size={20} className="text-primary-600" />
              <h3 className="text-lg font-semibold">
                Schedule Workout - {format(schedulingDate, 'MMM dd, yyyy')}
              </h3>
            </div>

            <div className="space-y-3 mb-6">
              {trainingPlans.length === 0 ? (
                <p className="text-gray-600 text-sm">
                  No training plans available. Create a training plan first.
                </p>
              ) : (
                trainingPlans.map(plan => (
                  <button
                    key={plan.id}
                    onClick={() => handleScheduleWorkout(plan.id)}
                    className="w-full p-3 text-left border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                  >
                    <div className="font-medium text-gray-900">{plan.name}</div>
                    {plan.description && (
                      <div className="text-sm text-gray-600 mt-1">{plan.description}</div>
                    )}
                    {plan.exercises && (
                      <div className="text-xs text-gray-500 mt-1">
                        {plan.exercises.length} exercise{plan.exercises.length !== 1 ? 's' : ''}
                      </div>
                    )}
                  </button>
                ))
              )}

              <button
                onClick={() => handleScheduleWorkout()}
                className="w-full p-3 text-left border-2 border-dashed border-gray-300 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
              >
                <div className="flex items-center gap-2 text-gray-600">
                  <Plus size={16} />
                  <span>Create custom workout for this day</span>
                </div>
              </button>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setShowScheduleModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}