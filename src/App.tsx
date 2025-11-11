import { useState, useEffect } from 'react';
import { Dumbbell, Plus, Calendar, List, Target, Clock } from 'lucide-react';
import { useAuth } from './hooks/useAuth';
import { useExercises } from './hooks/useExercises';
import { useWorkoutTimer } from './hooks/useWorkoutTimer';
import { getCategoryColor } from './utils';
import { userTracker } from './services/userTracker';
import { 
  Exercise,
  TrainingPlan, 
  CalendarWorkout, 
  ExerciseSet,
  WorkoutExercise 
} from './types';
import { 
  AuthForm, 
  ExerciseForm, 
  TrainingPlanForm,
  EnhancedTrainingPlanForm,
  ExerciseCard,
  TrainingPlanView,
  CalendarView,
  ExerciseDetailView,
  NavigationDrawer,
  DrawerToggle,
  Button,
  Card,
  LogDashboard
} from './components';

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
  const [trainingPlans, setTrainingPlans] = useState<TrainingPlan[]>([]);
  const [currentView, setCurrentView] = useState<View>('current-plan'); // Changed default to current-plan
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
    const previousView = currentView;
    setCurrentView(view);
    setIsDrawerOpen(false);
    
    // Track navigation for comprehensive user interaction logging
    userTracker.trackNavigation(previousView, view, 'drawer_navigation');
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
    setCurrentView('exercise-detail');
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

  const handleCompleteExercise = () => {
    setCurrentView('calendar');
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
        const today = new Date();
        const todaysWorkout = calendarWorkouts.find(workout => 
          workout.scheduled_date.toDateString() === today.toDateString()
        );

        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">
                Today's Workout - {today.toLocaleDateString('en-US', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </h2>
              <Button
                onClick={() => setCurrentView('calendar')}
                variant="outline"
                leftIcon={<Calendar size={16} />}
              >
                View Calendar
              </Button>
            </div>

            {!todaysWorkout ? (
              <Card className="text-center py-12">
                <Target className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No workout scheduled for today</h3>
                <p className="text-gray-600 mb-6">
                  Schedule a training plan for today to get started with your workout
                </p>
                <div className="flex gap-3 justify-center">
                  <Button
                    onClick={() => setCurrentView('calendar')}
                    leftIcon={<Calendar size={16} />}
                  >
                    Schedule Workout
                  </Button>
                  <Button
                    onClick={() => setCurrentView('plans')}
                    variant="outline"
                    leftIcon={<Target size={16} />}
                  >
                    View Plans
                  </Button>
                </div>
              </Card>
            ) : todaysWorkout.training_plan ? (
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
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        todaysWorkout.status === 'completed' 
                          ? 'bg-green-100 text-green-800'
                          : todaysWorkout.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {todaysWorkout.status === 'completed' ? 'Completed' : 
                         todaysWorkout.status === 'in_progress' ? 'In Progress' : 'Scheduled'}
                      </span>
                    </div>
                  </div>

                  {todaysWorkout.training_plan.exercises && (
                    <div className="space-y-3">
                      <h4 className="font-medium text-gray-900">
                        Exercises ({todaysWorkout.training_plan.exercises.length})
                      </h4>
                      <div className="grid gap-3">
                        {todaysWorkout.training_plan.exercises.map(exercise => (
                          <Card key={exercise.id} className="bg-gray-50">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h5 className="font-medium text-gray-900">{exercise.name}</h5>
                                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(exercise.category)}`}>
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
                                <Button
                                  size="sm"
                                  onClick={() => handleStartWorkout(exercise)}
                                  leftIcon={<Clock size={14} />}
                                >
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
                        onClick={() => {
                          // Mark workout as completed
                          const updatedWorkouts = calendarWorkouts.map(w => 
                            w.id === todaysWorkout.id 
                              ? { ...w, status: 'completed' as const }
                              : w
                          );
                          setCalendarWorkouts(updatedWorkouts);
                        }}
                        size="lg"
                        leftIcon={<Target size={16} />}
                      >
                        Complete Workout
                      </Button>
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <Card className="text-center py-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  Workout scheduled but no plan assigned
                </h3>
                <p className="text-gray-600 mb-4">
                  This workout doesn't have a training plan assigned to it yet.
                </p>
                <Button
                  onClick={() => setCurrentView('calendar')}
                  variant="outline"
                >
                  Edit in Calendar
                </Button>
              </Card>
            )}
          </div>
        );
        
      case 'exercise-detail':
        if (!selectedExercise) {
          setCurrentView('current-plan');
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
            onPauseTimer={pauseTimer}
            onResetTimer={resetTimer}
            onCompleteExercise={handleCompleteExercise}
          />
        );

      case 'exercises':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Exercises</h2>
              <Button
                onClick={() => setShowExerciseForm(true)}
                leftIcon={<Plus size={20} />}
              >
                Add Exercise
              </Button>
            </div>

            {exercisesLoading ? (
              <Card className="text-center py-12">
                <Dumbbell className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
                <p className="text-gray-600">Loading exercises...</p>
              </Card>
            ) : exercises.length === 0 ? (
              <Card className="text-center py-12">
                <Dumbbell className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No exercises yet</h3>
                <p className="text-gray-600 mb-6">Start by adding your first exercise to track your workouts</p>
                <Button onClick={() => setShowExerciseForm(true)}>
                  Add Your First Exercise
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {exercises.map(exercise => (
                  <ExerciseCard
                    key={exercise.id}
                    exercise={exercise}
                    onToggleComplete={toggleExerciseComplete}
                    onDelete={deleteExercise}
                    onStartWorkout={handleStartWorkout}
                  />
                ))}
              </div>
            )}
          </div>
        );

      case 'plans':
        return (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Training Plans</h2>
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowPlanForm(true)}
                  variant="outline"
                  disabled={exercises.length === 0}
                  leftIcon={<Plus size={20} />}
                >
                  Classic Plan
                </Button>
                <Button
                  onClick={() => setShowEnhancedPlanForm(true)}
                  disabled={exercises.length === 0}
                  leftIcon={<Plus size={20} />}
                >
                  Enhanced Plan
                </Button>
              </div>
            </div>

            {exercises.length === 0 ? (
              <Card className="text-center py-12">
                <Target className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Create exercises first</h3>
                <p className="text-gray-600 mb-6">You need to have exercises before creating a training plan</p>
                <Button onClick={() => setCurrentView('exercises')}>
                  Go to Exercises
                </Button>
              </Card>
            ) : trainingPlans.length === 0 ? (
              <Card className="text-center py-12">
                <Calendar className="mx-auto text-gray-400 mb-4" size={48} />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">No training plans yet</h3>
                <p className="text-gray-600 mb-6">Create your first training plan to get started</p>
                <Button onClick={() => setShowEnhancedPlanForm(true)}>
                  Create Your First Plan
                </Button>
              </Card>
            ) : (
              <div className="grid gap-4">
                {trainingPlans.map(plan => {
                  // const totalWorkouts = plan.workouts?.length || 0;
                  // const completedWorkouts = plan.workouts?.filter(workout =>
                  //   workout.exercises.every(ex => ex.completed) && workout.exercises.length > 0
                  // ).length || 0;
                  // const progressPercentage = totalWorkouts > 0 ? (completedWorkouts / totalWorkouts) * 100 : 0;

                  return (
                    <Card key={plan.id} hover>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h3 className="text-xl font-semibold text-gray-900 mb-2">{plan.name}</h3>
                          {plan.description && (
                            <p className="text-gray-700 mb-3">{plan.description}</p>
                          )}
                          {plan.exercises && (
                            <p className="text-sm text-gray-600 mb-3">
                              {plan.exercises.length} exercise{plan.exercises.length !== 1 ? 's' : ''}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-3">
                        <Button
                          onClick={() => setSelectedPlan(plan)}
                          className="flex-1"
                        >
                          View Plan
                        </Button>
                        <Button
                          onClick={() => deletePlan(plan.id)}
                          variant="outline"
                        >
                          Delete
                        </Button>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
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
          <div className="flex gap-4">
            {[
              { key: 'current-plan', label: "Today's Workout", icon: Dumbbell },
              { key: 'calendar', label: 'Calendar', icon: Calendar },
              { key: 'exercises', label: 'Exercises', icon: List },
              { key: 'plans', label: 'Plans', icon: Target },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setCurrentView(key as View)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
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

        {/* Content */}
        {currentView === 'exercises' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-gray-900">Your Exercises</h2>
              <Button
                onClick={() => setShowExerciseForm(true)}
                leftIcon={<Plus size={20} />}
              >
                Add Exercise
              </Button>
            </div>

            {exercisesLoading ? (
              <div className="card text-center py-12">
                <Dumbbell className="mx-auto text-gray-400 mb-4 animate-pulse" size={48} />
                <p className="text-gray-600">Loading exercises...</p>
              </div>
            ) : exercises.length === 0 ? (
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
                    onStartWorkout={handleStartWorkout}
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
          onUpdatePlan={(updatedPlan) => {
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

      {/* Log Dashboard - Accessible via Ctrl+Shift+L */}
      {showLogDashboard && (
        <LogDashboard
          onClose={() => {
            setShowLogDashboard(false);
            userTracker.trackFeatureUsage('admin', 'log_dashboard_closed', {
              method: 'close_button'
            });
          }}
        />
      )}
    </div>
  );
}

export default App;