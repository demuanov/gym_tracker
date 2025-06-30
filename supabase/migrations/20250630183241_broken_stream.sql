/*
  # Gym Exercise Tracker Database Schema

  1. New Tables
    - `exercises`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `category` (text)
      - `sets` (integer, optional)
      - `reps` (integer, optional)
      - `weight` (numeric, optional)
      - `duration` (integer, optional)
      - `notes` (text, optional)
      - `completed` (boolean, default false)
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

    - `training_plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `name` (text)
      - `description` (text, optional)
      - `start_date` (date)
      - `end_date` (date)
      - `created_at` (timestamp)

    - `workout_sessions`
      - `id` (uuid, primary key)
      - `training_plan_id` (uuid, references training_plans)
      - `date` (date)
      - `duration` (integer, optional)
      - `notes` (text, optional)
      - `created_at` (timestamp)

    - `workout_exercises`
      - `id` (uuid, primary key)
      - `workout_session_id` (uuid, references workout_sessions)
      - `exercise_id` (uuid, references exercises)
      - `completed` (boolean, default false)
      - `actual_sets` (integer, optional)
      - `actual_reps` (integer, optional)
      - `actual_weight` (numeric, optional)
      - `notes` (text, optional)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users to manage their own data
*/

-- Create exercises table
CREATE TABLE IF NOT EXISTS exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  category text NOT NULL,
  sets integer,
  reps integer,
  weight numeric(5,2),
  duration integer,
  notes text,
  completed boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create training_plans table
CREATE TABLE IF NOT EXISTS training_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  description text,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Create workout_sessions table
CREATE TABLE IF NOT EXISTS workout_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  training_plan_id uuid REFERENCES training_plans(id) ON DELETE CASCADE NOT NULL,
  date date NOT NULL,
  duration integer,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Create workout_exercises table
CREATE TABLE IF NOT EXISTS workout_exercises (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  workout_session_id uuid REFERENCES workout_sessions(id) ON DELETE CASCADE NOT NULL,
  exercise_id uuid REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  completed boolean DEFAULT false,
  actual_sets integer,
  actual_reps integer,
  actual_weight numeric(5,2),
  notes text,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE training_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- Create policies for exercises
CREATE POLICY "Users can manage their own exercises"
  ON exercises
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for training_plans
CREATE POLICY "Users can manage their own training plans"
  ON training_plans
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create policies for workout_sessions
CREATE POLICY "Users can manage workout sessions for their plans"
  ON workout_sessions
  FOR ALL
  TO authenticated
  USING (
    training_plan_id IN (
      SELECT id FROM training_plans WHERE user_id = auth.uid()
    )
  )
  WITH CHECK (
    training_plan_id IN (
      SELECT id FROM training_plans WHERE user_id = auth.uid()
    )
  );

-- Create policies for workout_exercises
CREATE POLICY "Users can manage workout exercises for their sessions"
  ON workout_exercises
  FOR ALL
  TO authenticated
  USING (
    workout_session_id IN (
      SELECT ws.id FROM workout_sessions ws
      JOIN training_plans tp ON ws.training_plan_id = tp.id
      WHERE tp.user_id = auth.uid()
    )
  )
  WITH CHECK (
    workout_session_id IN (
      SELECT ws.id FROM workout_sessions ws
      JOIN training_plans tp ON ws.training_plan_id = tp.id
      WHERE tp.user_id = auth.uid()
    )
  );

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS exercises_user_id_idx ON exercises(user_id);
CREATE INDEX IF NOT EXISTS exercises_category_idx ON exercises(category);
CREATE INDEX IF NOT EXISTS training_plans_user_id_idx ON training_plans(user_id);
CREATE INDEX IF NOT EXISTS workout_sessions_plan_id_idx ON workout_sessions(training_plan_id);
CREATE INDEX IF NOT EXISTS workout_sessions_date_idx ON workout_sessions(date);
CREATE INDEX IF NOT EXISTS workout_exercises_session_id_idx ON workout_exercises(workout_session_id);
CREATE INDEX IF NOT EXISTS workout_exercises_exercise_id_idx ON workout_exercises(exercise_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger for exercises updated_at
CREATE TRIGGER update_exercises_updated_at
  BEFORE UPDATE ON exercises
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();