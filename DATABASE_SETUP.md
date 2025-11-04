# Supabase Database Setup Guide

## Quick Setup Steps

### 1. Prerequisites
- Supabase account and project created
- Environment variables set in your `.env` file

### 2. Database Migration

#### Option A: Supabase Dashboard (Recommended)
1. Open [supabase.com](https://supabase.com) and go to your project
2. Click "SQL Editor" in the sidebar
3. Click "New query"
4. Copy and paste the content from `supabase/migrations/20250630183241_broken_stream.sql`
5. Click "Run" to execute

#### Option B: Using Supabase CLI
```bash
# Install Supabase CLI (if not already installed)
npm install supabase@latest

# Login to Supabase
npx supabase login

# Link your project
npx supabase link --project-ref YOUR_PROJECT_REF

# Apply migrations
npx supabase db push
```

### 3. Verify Setup

After running the migration, your database should have these tables:
- `exercises` - Store individual exercises
- `training_plans` - Store training plans
- `workout_sessions` - Store workout sessions
- `workout_exercises` - Link exercises to sessions

### 4. Test the Setup

You can test the setup by:
1. Creating a user account in your app
2. Adding a test exercise
3. Checking the `exercises` table in Supabase dashboard

### 5. Environment Variables

Make sure your `.env` file has:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

Get these values from:
- Supabase Dashboard > Settings > API

## Troubleshooting

### Common Issues:
1. **Permission errors**: Make sure you're authenticated
2. **Table already exists**: Drop existing tables first or use `IF NOT EXISTS`
3. **Policy errors**: Ensure RLS policies are correctly set

### Useful SQL Commands:
```sql
-- Check if tables exist
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public';

-- Check RLS policies
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Reset database (BE CAREFUL!)
DROP TABLE IF EXISTS workout_exercises CASCADE;
DROP TABLE IF EXISTS workout_sessions CASCADE;
DROP TABLE IF EXISTS training_plans CASCADE;
DROP TABLE IF EXISTS exercises CASCADE;
```