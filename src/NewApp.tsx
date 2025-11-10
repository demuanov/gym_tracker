import React, { useState } from 'react';
import { Dumbbell } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useExercises } from './hooks/useExercises';
import { useWorkoutTimer } from './hooks/useWorkoutTimer';
import { 
  CalendarWorkout, 
  TrainingPlan, 
  Exercise, 
  ExerciseSet,
  WorkoutExercise 
} from './types';

// Component imports
import {
  AuthForm,
  ExerciseForm,
  EnhancedTrainingPlanForm,
  CalendarView,
  ExerciseDetailView,
  NavigationDrawer,
  DrawerToggle,
  Button,
  Card
} from './components';

type AppView = 'calendar' | 'exercise-detail' | 'statistics' | 'profile';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { exercises, loading: exercisesLoading, addExercise } = useExercises();
  const { 
    activeTimer, 
    currentTime, 
    isRunning, 
    startTimer, 
    pauseTimer, 
    resetTimer, 
    stopTimer 
  } = useWorkoutTimer();

  // State management
  const [currentView, setCurrentView] = useState<AppView>('calendar');
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise | null>(null);
  
  // Modal states
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);

  // Mock data - in real app these would come from API/database
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [calendarWorkouts, setCalendarWorkouts] = useState<CalendarWorkout[]>([]);
  const [exerciseSets, setExerciseSets] = useState<ExerciseSet[]>([]);

  // Loading state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="mx-auto text-primary-600 mb-4 animate-pulse" size={48} />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Auth required
  if (!user) {
    return <AuthForm />;
  }

  // Handlers
  const handleSignOut = async () => {
    await signOut();
    setIsDrawerOpen(false);
  };

  const handleNavigate = (view: AppView) => {
    setCurrentView(view);
  };

  const handleAddExercise = async (exerciseData: Parameters<typeof addExercise>[0]) => {
    try {
      await addExercise(exerciseData);
      setShowExerciseForm(false);
    } catch (error) {
      console.error('Failed to add exercise:', error);
    }
  };

  const handleCreatePlan = (planData: Omit<TrainingPlan, 'id'>) => {
    const newPlan: TrainingPlan = {
      ...planData,
      id: Date.now().toString()
    };
    setTrainingPlans([...trainingPlans, newPlan]);
    setShowPlanForm(false);
  };

  const handleScheduleWorkout = (date: Date, planId?: string) => {
    const newWorkout: CalendarWorkout = {
      id: `workout_${Date.now()}`,
      user_id: user.id,
      training_plan_id: planId,
      scheduled_date: date,
      status: 'scheduled',
      created_at: new Date(),
      training_plan: planId ? trainingPlans.find(p => p.id === planId) : undefined
    };
    setCalendarWorkouts([...calendarWorkouts, newWorkout]);
  };

  const handleWorkoutClick = (workout: CalendarWorkout) => {
    // Navigate to workout detail or start workout
    console.log('Workout clicked:', workout);
  };

  const handleExerciseClick = (exercise: WorkoutExercise) => {
    setSelectedExercise(exercise);
    setCurrentView('exercise-detail');
  };

  // Exercise detail handlers
  const handleAddSet = () => {
    if (!selectedExercise) return;
    
    const newSet: ExerciseSet = {
      id: `set_${Date.now()}`,
      workout_exercise_id: selectedExercise.id,
      set_number: exerciseSets.filter(s => s.workout_exercise_id === selectedExercise.id).length + 1,
      reps: selectedExercise.exercise.reps || 12,
      weight: selectedExercise.exercise.weight || 0,
      rest_time: 90, // default 90 seconds rest
      completed: false,
      created_at: new Date()
    };
    
    setExerciseSets([...exerciseSets, newSet]);
  };

  const handleUpdateSet = (setId: string, updates: Partial<ExerciseSet>) => {
    setExerciseSets(prev => prev.map(set => 
      set.id === setId ? { ...set, ...updates } : set
    ));
  };

  const handleDeleteSet = (setId: string) => {
    setExerciseSets(prev => prev.filter(set => set.id !== setId));
  };

  const handleCompleteSet = (setId: string) => {
    setExerciseSets(prev => prev.map(set => 
      set.id === setId 
        ? { ...set, completed: !set.completed, completed_at: new Date() }
        : set
    ));
  };

  const handleCompleteExercise = () => {
    setCurrentView('calendar');
    setSelectedExercise(null);
  };

  // Timer handlers
  const handleStartTimer = (type: 'exercise' | 'rest', duration: number) => {
    startTimer(type, duration, selectedExercise?.id);
  };

  const handlePauseTimer = () => {
    pauseTimer();
  };

  const handleResetTimer = () => {
    resetTimer();
  };

  const getCurrentSets = () => {
    if (!selectedExercise) return [];
    return exerciseSets.filter(set => set.workout_exercise_id === selectedExercise.id);
  };

  // Mock stats for drawer
  const stats = {
    totalWorkouts: calendarWorkouts.filter(w => w.status === 'completed').length,
    totalExercises: exercises.length,
    weeklyGoal: 3,
    currentStreak: 5,
    totalWeight: 12500,
    averageWorkoutTime: 45
  };

  // Render different views
  const renderCurrentView = () => {
    switch (currentView) {
      case 'calendar':
        return (
          <CalendarView
            calendarWorkouts={calendarWorkouts}
            trainingPlans={trainingPlans}
            onDateSelect={setSelectedDate}
            onScheduleWorkout={handleScheduleWorkout}
            onWorkoutClick={handleWorkoutClick}
            selectedDate={selectedDate}
          />
        );
        
      case 'exercise-detail':
        if (!selectedExercise) {
          setCurrentView('calendar');
          return null;
        }
        return (
          <ExerciseDetailView
            exercise={selectedExercise.exercise}
            sets={getCurrentSets()}
            activeTimer={activeTimer}
            onBack={() => setCurrentView('calendar')}
            onAddSet={handleAddSet}
            onUpdateSet={handleUpdateSet}
            onDeleteSet={handleDeleteSet}
            onCompleteSet={handleCompleteSet}
            onStartTimer={handleStartTimer}
            onPauseTimer={handlePauseTimer}
            onResetTimer={handleResetTimer}
            onCompleteExercise={handleCompleteExercise}
          />
        );
        
      case 'statistics':
        return (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Statistics</h2>
            <p className="text-gray-600">Statistics view coming soon!</p>
          </Card>
        );
        
      case 'profile':
        return (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Settings</h2>
            <p className="text-gray-600">Profile settings coming soon!</p>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        onNavigate={handleNavigate}
        onSignOut={handleSignOut}
        currentView={currentView}
        stats={stats}
      />

      {/* Main Content */}
      <div className="flex-1 lg:ml-0">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <DrawerToggle onClick={() => setIsDrawerOpen(true)} />
            <h1 className="text-lg font-semibold text-gray-900">Gym Tracker</h1>
            <div className="w-8" /> {/* Spacer */}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {currentView === 'calendar' && (
            <div className="mb-6 flex flex-wrap gap-4 justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Workout Calendar</h1>
                <p className="text-gray-600">Schedule and track your workouts</p>
              </div>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowExerciseForm(true)}
                  variant="outline"
                >
                  Add Exercise
                </Button>
                <Button
                  onClick={() => setShowPlanForm(true)}
                >
                  Create Training Plan
                </Button>
              </div>
            </div>
          )}

          {renderCurrentView()}
        </div>
      </div>

      {/* Modals */}
      {showExerciseForm && (
        <ExerciseForm
          onAddExercise={handleAddExercise}
          onClose={() => setShowExerciseForm(false)}
        />
      )}

      {showPlanForm && (
        <EnhancedTrainingPlanForm
          exercises={exercises}
          onCreatePlan={handleCreatePlan}
          onClose={() => setShowPlanForm(false)}
        />
      )}
    </div>
  );
}

export default App;