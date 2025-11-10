import { useState, useEffect, useRef } from 'react';
import { WorkoutTimer } from '../types';

interface UseWorkoutTimerReturn {
  activeTimer: WorkoutTimer | null;
  currentTime: number;
  isRunning: boolean;
  startTimer: (type: 'exercise' | 'rest' | 'custom', duration: number, workoutExerciseId?: string) => void;
  pauseTimer: () => void;
  resumeTimer: () => void;
  resetTimer: () => void;
  stopTimer: () => void;
}

export function useWorkoutTimer(): UseWorkoutTimerReturn {
  const [activeTimer, setActiveTimer] = useState<WorkoutTimer | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef<number>(0);
  const pausedTimeRef = useRef<number>(0);

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Timer tick effect
  useEffect(() => {
    if (isRunning && activeTimer) {
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const elapsed = Math.floor((now - startTimeRef.current + pausedTimeRef.current) / 1000);
        
        if (activeTimer.timer_type === 'rest') {
          // Countdown timer for rest periods
          const remaining = activeTimer.duration - elapsed;
          setCurrentTime(Math.max(0, remaining));
          
          if (remaining <= 0) {
            // Timer finished
            setIsRunning(false);
            setActiveTimer(null);
            // Could add notification or sound here
          }
        } else {
          // Count up timer for exercises
          setCurrentTime(elapsed);
        }
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, activeTimer]);

  const startTimer = (
    type: 'exercise' | 'rest' | 'custom',
    duration: number,
    workoutExerciseId?: string
  ) => {
    // Stop any existing timer
    stopTimer();

    const newTimer: WorkoutTimer = {
      id: `timer_${Date.now()}`,
      workout_exercise_id: workoutExerciseId || '',
      timer_type: type,
      duration,
      started_at: new Date(),
      is_active: true,
      created_at: new Date()
    };

    setActiveTimer(newTimer);
    setCurrentTime(type === 'rest' ? duration : 0);
    setIsRunning(true);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
  };

  const pauseTimer = () => {
    if (!isRunning || !activeTimer) return;

    setIsRunning(false);
    const now = Date.now();
    pausedTimeRef.current += now - startTimeRef.current;

    setActiveTimer(prev => prev ? {
      ...prev,
      paused_at: new Date()
    } : null);
  };

  const resumeTimer = () => {
    if (isRunning || !activeTimer) return;

    setIsRunning(true);
    startTimeRef.current = Date.now();

    setActiveTimer(prev => prev ? {
      ...prev,
      paused_at: undefined
    } : null);
  };

  const resetTimer = () => {
    if (!activeTimer) return;

    setIsRunning(false);
    startTimeRef.current = Date.now();
    pausedTimeRef.current = 0;
    
    if (activeTimer.timer_type === 'rest') {
      setCurrentTime(activeTimer.duration);
    } else {
      setCurrentTime(0);
    }

    setActiveTimer(prev => prev ? {
      ...prev,
      started_at: new Date(),
      paused_at: undefined
    } : null);
  };

  const stopTimer = () => {
    setIsRunning(false);
    setActiveTimer(null);
    setCurrentTime(0);
    startTimeRef.current = 0;
    pausedTimeRef.current = 0;

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  return {
    activeTimer: activeTimer ? { ...activeTimer, duration: currentTime } : null,
    currentTime,
    isRunning,
    startTimer,
    pauseTimer: isRunning ? pauseTimer : resumeTimer,
    resumeTimer,
    resetTimer,
    stopTimer
  };
}