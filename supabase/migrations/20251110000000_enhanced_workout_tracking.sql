/*
  Enhanced Gym Tracker Database Schema
  
  This migration adds support for:
  1. Calendar-based workout scheduling
  2. Detailed set tracking with reps and weight
  3. Timer sessions for exercises
  4. Enhanced workout statistics
*/

-- Create exercise_sets table for detailed set tracking
CREATE TABLE IF NOT EXISTS exercise_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id uuid REFERENCES workout_exercises(id) ON DELETE CASCADE NOT NULL,
  set_number integer NOT NULL,
  reps integer NOT NULL,
  weight numeric(5,2),
  rest_time integer, -- in seconds
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  completed_at timestamptz
);

-- Create workout_timers table for timer sessions
CREATE TABLE IF NOT EXISTS workout_timers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_exercise_id uuid REFERENCES workout_exercises(id) ON DELETE CASCADE NOT NULL,
  timer_type text NOT NULL CHECK (timer_type IN ('exercise', 'rest', 'custom')),
  duration integer NOT NULL, -- in seconds
  started_at timestamptz,
  paused_at timestamptz,
  completed_at timestamptz,
  is_active boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- Create calendar_workouts table for scheduling workouts on specific dates
CREATE TABLE IF NOT EXISTS calendar_workouts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  training_plan_id uuid REFERENCES training_plans(id) ON DELETE CASCADE,
  scheduled_date date NOT NULL,
  status text DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'in_progress', 'completed', 'skipped')),
  started_at timestamptz,
  completed_at timestamptz,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS exercise_sets_workout_exercise_id_idx ON exercise_sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS exercise_sets_set_number_idx ON exercise_sets(set_number);
CREATE INDEX IF NOT EXISTS workout_timers_workout_exercise_id_idx ON workout_timers(workout_exercise_id);
CREATE INDEX IF NOT EXISTS workout_timers_is_active_idx ON workout_timers(is_active);
CREATE INDEX IF NOT EXISTS calendar_workouts_user_id_idx ON calendar_workouts(user_id);
CREATE INDEX IF NOT EXISTS calendar_workouts_scheduled_date_idx ON calendar_workouts(scheduled_date);
CREATE INDEX IF NOT EXISTS calendar_workouts_status_idx ON calendar_workouts(status);

-- Enable RLS on new tables
ALTER TABLE exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_timers ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_workouts ENABLE ROW LEVEL SECURITY;

-- Create policies for exercise_sets
CREATE POLICY "Users can manage exercise sets for their workouts"
  ON exercise_sets
  FOR ALL
  TO authenticated
  USING (
    workout_exercise_id IN (
      SELECT we.id FROM workout_exercises we
      JOIN workout_sessions ws ON we.workout_session_id = ws.id
      JOIN training_plans tp ON ws.training_plan_id = tp.id
      WHERE tp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    workout_exercise_id IN (
      SELECT we.id FROM workout_exercises we
      JOIN workout_sessions ws ON we.workout_session_id = ws.id
      JOIN training_plans tp ON ws.training_plan_id = tp.id
      WHERE tp.user_id = auth.uid()
    )
  );

-- Create policies for workout_timers
CREATE POLICY "Users can manage timers for their workouts"
  ON workout_timers
  FOR ALL
  TO authenticated
  USING (
    workout_exercise_id IN (
      SELECT we.id FROM workout_exercises we
      JOIN workout_sessions ws ON we.workout_session_id = ws.id
      JOIN training_plans tp ON ws.training_plan_id = tp.id
      WHERE tp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    workout_exercise_id IN (
      SELECT we.id FROM workout_exercises we
      JOIN workout_sessions ws ON we.workout_session_id = ws.id
      JOIN training_plans tp ON ws.training_plan_id = tp.id
      WHERE tp.user_id = auth.uid()
    )
  );

-- Create policies for calendar_workouts
CREATE POLICY "Users can manage their own calendar workouts"
  ON calendar_workouts
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Add some useful functions
CREATE OR REPLACE FUNCTION get_workout_duration(workout_id uuid)
RETURNS interval AS $$
BEGIN
  RETURN (
    SELECT completed_at - started_at
    FROM calendar_workouts
    WHERE id = workout_id AND completed_at IS NOT NULL
  );
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION get_total_volume_for_exercise(exercise_id uuid, date_from date DEFAULT NULL, date_to date DEFAULT NULL)
RETURNS numeric AS $$
BEGIN
  RETURN (
    SELECT COALESCE(SUM(es.reps * es.weight), 0)
    FROM exercise_sets es
    JOIN workout_exercises we ON es.workout_exercise_id = we.id
    JOIN workout_sessions ws ON we.workout_session_id = ws.id
    WHERE we.exercise_id = exercise_id
    AND es.completed = true
    AND (date_from IS NULL OR ws.date >= date_from)
    AND (date_to IS NULL OR ws.date <= date_to)
  );
END;
$$ LANGUAGE plpgsql;