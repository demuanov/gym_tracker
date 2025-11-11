import { useState, useEffect, Suspense, lazy, useCallback, useMemo } from 'react';
import { Dumbbell, Plus, Calendar, List, Target } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import { useExercises } from './hooks/useExercises';
import { useWorkoutTimer } from './hooks/useWorkoutTimer';
import { userTracker } from './services/userTracker';
import { 
  Exercise,
  TrainingPlan, 
  CalendarWorkout, 
  ExerciseSet,
  WorkoutExercise 
} from './types';
// Import components from index files for proper exports
import { 
  AuthForm, 
  ExerciseForm, 
  TrainingPlanForm,
  EnhancedTrainingPlanForm,
  TrainingPlanView,
  CalendarView,
  ExerciseDetailView,
  NavigationDrawer,
  DrawerToggle,
  Button,
  Card,
  TodayWorkoutView,
  ExercisesView,
  PlansView
} from './components';

// Lazy load LogDashboard since it's only used when explicitly requested
const LogDashboard = lazy(() => import('./components/LogDashboard'));

type View = 'exercises' | 'plans' | 'current-plan' | 'calendar' | 'exercise-detail' | 'statistics' | 'profile';

function App() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { exercises, loading: exercisesLoading, addExercise, toggleExerciseComplete, deleteExercise } = useExercises();
  const {
    activeTimer,
    // currentTime,
    // isRunning,
    startTimer,
    pauseTimer,
    resetTimer,
    // stopTimer
  } = useWorkoutTimer();  // Existing state
  const navigate = useNavigate();
  const location = useLocation();

  const viewToPath = useMemo<Record<View, string>>(() => ({
    'current-plan': '/',
    calendar: '/calendar',
    exercises: '/exercises',
    plans: '/plans',
    'exercise-detail': '/exercise-detail',
    statistics: '/statistics',
    profile: '/profile'
  }), []);

  const pathToView = useCallback((path: string): View => {
    switch (path) {
      case '/':
      case '/current-plan':
        return 'current-plan';
      case '/calendar':
        return 'calendar';
      case '/exercises':
        return 'exercises';
      case '/plans':
        return 'plans';
      case '/statistics':
        return 'statistics';
      case '/profile':
        return 'profile';
      case '/exercise-detail':
        return 'exercise-detail';
      default:
        return 'current-plan';
    }
  }, []);

  const knownPaths = useMemo(() => new Set([...Object.values(viewToPath), '/current-plan']), [viewToPath]);
  const currentView = pathToView(location.pathname);

  const navigateToView = useCallback((view: View, source?: string) => {
    if (view === currentView) {
      return;
    }

    if (source) {
      userTracker.trackNavigation(currentView, view, source);
    }

    const targetPath = viewToPath[view];
    navigate(targetPath);
  }, [currentView, navigate, viewToPath]);

  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [showExerciseForm, setShowExerciseForm] = useState(false);
  const [showPlanForm, setShowPlanForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<TrainingPlan | null>(null);

  // New enhanced features state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [selectedExercise, setSelectedExercise] = useState<WorkoutExercise | null>(null);
  const [showEnhancedPlanForm, setShowEnhancedPlanForm] = useState(false);
  
  // New data state - in real app these would come from API/database
  const [calendarWorkouts, setCalendarWorkouts] = useState<CalendarWorkout[]>([]);
  const [exerciseSets, setExerciseSets] = useState<ExerciseSet[]>([]);
  const [showLogDashboard, setShowLogDashboard] = useState(false);

  useEffect(() => {
    if (!knownPaths.has(location.pathname)) {
      navigate(viewToPath['current-plan'], { replace: true });
    }
  }, [knownPaths, location.pathname, navigate, viewToPath]);

  // Initialize user tracking and log app start
  useEffect(() => {
    userTracker.trackNavigation('app_start', currentView, 'initial_load');
    
    // Track user authentication status
    if (user) {
      userTracker.trackFeatureUsage('authentication', 'user_authenticated', {
        userId: user.id,
        email: user.email
      });
    }

    // Add keyboard shortcut for logs (Ctrl+Shift+L)
    const handleKeyboard = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'L') {
        e.preventDefault();
        setShowLogDashboard(true);
        userTracker.trackFeatureUsage('admin', 'log_dashboard_opened', {
          method: 'keyboard_shortcut'
        });
      }
    };

    document.addEventListener('keydown', handleKeyboard);

    // Cleanup on component unmount
    return () => {
      document.removeEventListener('keydown', handleKeyboard);
      userTracker.destroy();
    };
  }, []);

  // Track view changes
  useEffect(() => {
    userTracker.trackFeatureUsage('navigation', 'view_changed', {
      newView: currentView,
      timestamp: Date.now()
    });
  }, [currentView]);

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

  if (!user) {
    return <AuthForm />;
  }

  const createExercise = async (exerciseData: Parameters<typeof addExercise>[0]) => {
    try {
      // Track exercise creation attempt
      userTracker.trackFeatureUsage('exercise_management', 'create_started', {
        exerciseName: exerciseData.name,
        category: exerciseData.category
      });
      
      await addExercise(exerciseData);
      
      // Track successful exercise creation and form completion
      userTracker.trackFeatureUsage('exercise_management', 'create_completed', {
        exerciseName: exerciseData.name,
        category: exerciseData.category,
        success: true
      });
      
      userTracker.trackFormInteraction('exercise_form', 'completed', undefined, {
        currentView,
        success: true,
        exerciseName: exerciseData.name
      });
      
      setShowExerciseForm(false);
    } catch (error) {
      console.error('Failed to add exercise:', error);
      
      // Track exercise creation error
      userTracker.trackError(error as Error, 'EXERCISE_CREATION', {
        exerciseData,
        attemptedAction: 'create_exercise'
      });
    }
  };

  const createTrainingPlan = (planData: Omit<TrainingPlan, 'id'>) => {
    // Track training plan creation
    userTracker.trackFeatureUsage('training_plan', 'create_completed', {
      planName: planData.name,
      exerciseCount: planData.exercises?.length || 0,
      category: planData.category
    });
    
    const newPlan: TrainingPlan = {
      ...planData,
      id: Date.now().toString()
    };
    setTrainingPlans([...trainingPlans, newPlan]);
    
    // Track form completion
    userTracker.trackFormInteraction('training_plan_form', 'completed', undefined, {
      currentView,
      success: true,
      planName: planData.name
    });
    
    setShowPlanForm(false);
  };

  // New enhanced handlers
  const createEnhancedTrainingPlan = (planData: Omit<TrainingPlan, 'id'>) => {
    // Track enhanced training plan creation
    userTracker.trackFeatureUsage('training_plan', 'create_enhanced_completed', {
      planName: planData.name,
      exerciseCount: planData.exercises?.length || 0,
      category: planData.category,
      isEnhanced: true
    });
    
    const newPlan: TrainingPlan = {
      ...planData,
      id: Date.now().toString()
    };
    setTrainingPlans([...trainingPlans, newPlan]);
    
    // Track enhanced form completion
    userTracker.trackFormInteraction('enhanced_training_plan_form', 'completed', undefined, {
      currentView,
      success: true,
      planName: planData.name,
      isEnhanced: true
    });
    
    setShowEnhancedPlanForm(false);
  };

  const handleNavigate = (view: View) => {
    navigateToView(view, 'drawer_navigation');
    setIsDrawerOpen(false);
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
    // For now, just log - can expand to show workout detail
    console.log('Workout clicked:', workout);
  };

  // const handleExerciseClick = (exercise: WorkoutExercise) => {
  //   setSelectedExercise(exercise);
  //   setCurrentView('exercise-detail');
  // };

  const handleStartWorkout = (exercise: Exercise) => {
    // Convert Exercise to WorkoutExercise for the detail view
    const workoutExercise: WorkoutExercise = {
      id: `workout_exercise_${Date.now()}`,
      workout_session_id: `session_${Date.now()}`,
      exercise_id: exercise.id,
      exercise: exercise,
      completed: false,
      sets: [],
      timers: []
    };
    setSelectedExercise(workoutExercise);
    navigateToView('exercise-detail');
  };

  // Exercise detail handlers
  const handleAddSet = () => {
    if (!selectedExercise) return;
    
    // Track set addition
    userTracker.trackFeatureUsage('workout_tracking', 'set_added', {
      exerciseId: selectedExercise.id,
      exerciseName: selectedExercise.exercise.name,
      setNumber: exerciseSets.filter(s => s.workout_exercise_id === selectedExercise.id).length + 1,
      reps: selectedExercise.exercise.reps || 12,
      weight: selectedExercise.exercise.weight || 0
    });
    
    const newSet: ExerciseSet = {
      id: `set_${Date.now()}`,
      workout_exercise_id: selectedExercise.id,
      set_number: exerciseSets.filter(s => s.workout_exercise_id === selectedExercise.id).length + 1,
      reps: selectedExercise.exercise.reps || 12,
      weight: selectedExercise.exercise.weight || 0,
      rest_time: 90,
      completed: false,
      created_at: new Date()
    };
    
    setExerciseSets([...exerciseSets, newSet]);
  };

  const handleUpdateSet = (setId: string, updates: Partial<ExerciseSet>) => {
    // Track set updates
    userTracker.trackFeatureUsage('workout_tracking', 'set_updated', {
      setId,
      updates,
      exerciseId: selectedExercise?.id,
      exerciseName: selectedExercise?.exercise.name
    });
    
    setExerciseSets(prev => prev.map(set => 
      set.id === setId ? { ...set, ...updates } : set
    ));
  };

  const handleDeleteSet = (setId: string) => {
    // Track set deletion
    const setToDelete = exerciseSets.find(s => s.id === setId);
    userTracker.trackFeatureUsage('workout_tracking', 'set_deleted', {
      setId,
      exerciseId: selectedExercise?.id,
      exerciseName: selectedExercise?.exercise.name,
      setNumber: setToDelete?.set_number
    });
    
    setExerciseSets(prev => prev.filter(set => set.id !== setId));
  };

  const handleCompleteSet = (setId: string) => {
    const currentSet = exerciseSets.find(s => s.id === setId);
    
    // Track set completion/un-completion
    userTracker.trackFeatureUsage('workout_tracking', 'set_completion_toggled', {
      setId,
      exerciseId: selectedExercise?.id,
      exerciseName: selectedExercise?.exercise.name,
      wasCompleted: currentSet?.completed,
      newStatus: !currentSet?.completed,
      reps: currentSet?.reps,
      weight: currentSet?.weight
    });
    
    setExerciseSets(prev => prev.map(set => 
      set.id === setId 
        ? { ...set, completed: !set.completed, completed_at: new Date() }
        : set
    ));
  };

  const handleCompleteWorkout = (workoutId: string) => {
    setCalendarWorkouts(prev => {
      const targetWorkout = prev.find(workout => workout.id === workoutId);

      if (targetWorkout) {
        userTracker.trackFeatureUsage('workout_tracking', 'workout_completed', {
          workoutId,
          planId: targetWorkout.training_plan_id,
          planName: targetWorkout.training_plan?.name,
          scheduledDate: targetWorkout.scheduled_date,
        });
      }

      return prev.map(workout =>
        workout.id === workoutId
          ? { ...workout, status: 'completed' as const, completed_at: new Date() }
          : workout
      );
    });
  };

  const handleCompleteExercise = () => {
    navigateToView('calendar');
    setSelectedExercise(null);
  };

  // Timer handlers
  const handleStartTimer = (type: 'exercise' | 'rest', duration: number) => {
    // Track timer usage
    userTracker.trackFeatureUsage('workout_timer', 'timer_started', {
      timerType: type,
      duration: duration,
      exerciseId: selectedExercise?.id,
      exerciseName: selectedExercise?.exercise?.name
    });
    
    startTimer(type, duration, selectedExercise?.id);
  };

  const getCurrentSets = () => {
    if (!selectedExercise) return [];
    return exerciseSets.filter(set => set.workout_exercise_id === selectedExercise.id);
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



  const handleSignOut = async () => {
    await signOut();
    setIsDrawerOpen(false);
  };
  
  const stats = {
    totalWorkouts: calendarWorkouts.filter(w => w.status === 'completed').length,
    totalExercises: exercises.length,
    weeklyGoal: 3,
    currentStreak: 5, // Mock data - calculate based on actual workouts
    totalWeight: exerciseSets.reduce((sum, set) => sum + (set.weight || 0) * set.reps, 0),
    averageWorkoutTime: 45 // Mock data
  };

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

  // Render view content
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

      case 'current-plan':
        {
          const today = new Date();
          const formattedDate = today.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          });

          return (
            <div className="space-y-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                  Today's Workout - {formattedDate}
                </h2>
                <Button
                  onClick={() => navigateToView('calendar')}
                  variant="outline"
                  leftIcon={<Calendar size={16} />}
                  fullWidth
                  className="sm:w-auto"
                >
                  View Calendar
                </Button>
              </div>

              <TodayWorkoutView
                workouts={calendarWorkouts}
                onNavigateToCalendar={() => navigateToView('calendar')}
                onNavigateToPlans={() => navigateToView('plans')}
                onStartWorkout={handleStartWorkout}
                onCompleteWorkout={handleCompleteWorkout}
              />
            </div>
          );
        }
        
      case 'exercise-detail':
        if (!selectedExercise) {
          navigateToView('current-plan');
          return null;
        }
        return (
          <ExerciseDetailView
            exercise={selectedExercise.exercise}
            sets={getCurrentSets()}
            activeTimer={activeTimer}
            onBack={() => navigateToView('calendar')}
            onAddSet={handleAddSet}
            onUpdateSet={handleUpdateSet}
            onDeleteSet={handleDeleteSet}
            onCompleteSet={handleCompleteSet}
            onStartTimer={handleStartTimer}
            onPauseTimer={pauseTimer}
            onResetTimer={resetTimer}
            onCompleteExercise={handleCompleteExercise}
          />
        );

      case 'exercises':
        return (
          <ExercisesView
            exercises={exercises}
            loading={exercisesLoading}
            onAddExercise={() => setShowExerciseForm(true)}
            onToggleComplete={toggleExerciseComplete}
            onDeleteExercise={deleteExercise}
            onStartWorkout={handleStartWorkout}
          />
        );

      case 'plans':
        return (
          <PlansView
            trainingPlans={trainingPlans}
            exercises={exercises}
            onCreateClassicPlan={() => setShowPlanForm(true)}
            onCreateEnhancedPlan={() => setShowEnhancedPlanForm(true)}
            onNavigateToExercises={() => navigateToView('exercises')}
            onSelectPlan={(plan) => setSelectedPlan(plan)}
            onDeletePlan={deletePlan}
          />
        );

      case 'statistics':
        return (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Statistics</h2>
            <p className="text-gray-600">Detailed statistics and analytics coming soon!</p>
          </Card>
        );
        
      case 'profile':
        return (
          <Card className="p-8 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Profile Settings</h2>
            <p className="text-gray-600">Profile and account settings coming soon!</p>
          </Card>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Navigation Drawer */}
      <NavigationDrawer
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        user={user}
        onNavigate={handleNavigate}
        onCreateExercise={() => {
          setShowExerciseForm(true);
          setIsDrawerOpen(false);
        }}
        onSignOut={handleSignOut}
        currentView={currentView}
        stats={stats}
      />

      {/* Main Content */}
  <div className="flex-1 w-full lg:ml-0">
        {/* Mobile Top Bar */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 lg:hidden">
          <div className="flex items-center justify-between">
            <DrawerToggle onClick={() => setIsDrawerOpen(true)} />
            <h1 className="text-lg font-semibold text-gray-900">Gym Tracker</h1>
            <div className="w-8" />
          </div>
        </div>

        {/* Desktop Header & Navigation */}
        <div className="hidden lg:block bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gym Tracker</h1>
              <p className="text-gray-600">Welcome back, {user.email}</p>
            </div>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowExerciseForm(true)}
                variant="outline"
                leftIcon={<Plus size={16} />}
              >
                Add Exercise
              </Button>
              <Button
                onClick={() => setShowEnhancedPlanForm(true)}
                leftIcon={<Plus size={16} />}
              >
                Create Plan
              </Button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-2 xl:gap-4">
            {[
              { key: 'current-plan', label: "Today's Workout", icon: Dumbbell },
              { key: 'calendar', label: 'Calendar', icon: Calendar },
              { key: 'exercises', label: 'Exercises', icon: List },
              { key: 'plans', label: 'Plans', icon: Target },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => navigateToView(key as View, 'header_navigation')}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 font-medium transition-colors sm:px-4 ${
                  currentView === key
                    ? 'bg-primary-600 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <Icon size={18} />
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6">
          {renderCurrentView()}
        </div>
      </div>

      {/* Enhanced Modals */}
      {showExerciseForm && (
        <ExerciseForm
          onAddExercise={createExercise}
          onClose={() => setShowExerciseForm(false)}
        />
      )}

      {selectedPlan && (
        <TrainingPlanView
          plan={selectedPlan}
          onUpdatePlan={(updatedPlan: TrainingPlan) => {
            const updatedPlans = trainingPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p);
            setTrainingPlans(updatedPlans);
          }}
          onBack={() => setSelectedPlan(null)}
        />
      )}

      {showPlanForm && (
        <TrainingPlanForm
          exercises={exercises}
          onCreatePlan={createTrainingPlan}
          onClose={() => setShowPlanForm(false)}
        />
      )}

      {showEnhancedPlanForm && (
        <EnhancedTrainingPlanForm
          exercises={exercises}
          onCreatePlan={createEnhancedTrainingPlan}
          onClose={() => setShowEnhancedPlanForm(false)}
        />
      )}

      {/* Log Dashboard - Accessible via Ctrl+Shift+L - Lazy loaded */}
      {showLogDashboard && (
        <Suspense fallback={
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 flex items-center gap-3">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              <span className="text-gray-700">Loading Dashboard...</span>
            </div>
          </div>
        }>
          <LogDashboard
            onClose={() => {
              setShowLogDashboard(false);
              userTracker.trackFeatureUsage('admin', 'log_dashboard_closed', {
                method: 'close_button'
              });
            }}
          />
        </Suspense>
      )}
    </div>
  );
}

export default App;