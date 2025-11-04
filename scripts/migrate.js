#!/usr/bin/env node

/**
 * Database Migration Helper Script
 * 
 * This script helps you apply the database migration to your Supabase project.
 * 
 * Usage:
 *   node scripts/migrate.js
 * 
 * Prerequisites:
 *   - SUPABASE_URL and SUPABASE_SERVICE_KEY in your environment
 *   - Or run the SQL manually in Supabase dashboard
 */

import { readFileSync } from 'fs';
import { join } from 'path';

const MIGRATION_FILE = join(process.cwd(), 'supabase/migrations/20250630183241_broken_stream.sql');

async function runMigration() {
  try {
    // Read the migration file
    const migrationSQL = readFileSync(MIGRATION_FILE, 'utf8');
    
    console.log('🗄️  Gym Tracker Database Migration');
    console.log('=====================================');
    console.log('');
    console.log('📋 Migration file loaded successfully!');
    console.log(`📄 File: ${MIGRATION_FILE}`);
    console.log('');
    console.log('🚀 To apply this migration:');
    console.log('');
    console.log('Option 1 - Supabase Dashboard (Recommended):');
    console.log('1. Go to https://supabase.com and open your project');
    console.log('2. Click "SQL Editor" in the sidebar');
    console.log('3. Click "New query"');
    console.log('4. Copy and paste the migration SQL');
    console.log('5. Click "Run"');
    console.log('');
    console.log('Option 2 - Copy SQL to clipboard:');
    console.log('The SQL content is ready to copy from the migration file.');
    console.log('');
    console.log('📊 This migration will create:');
    console.log('- ✅ exercises table (with RLS)');
    console.log('- ✅ training_plans table (with RLS)');
    console.log('- ✅ workout_sessions table (with RLS)');
    console.log('- ✅ workout_exercises table (with RLS)');
    console.log('- ✅ Security policies for user data isolation');
    console.log('- ✅ Performance indexes');
    console.log('- ✅ Updated_at trigger for exercises');
    console.log('');
    console.log('📋 SQL Preview (first 500 characters):');
    console.log('---');
    console.log(migrationSQL.substring(0, 500) + '...');
    console.log('---');
    console.log('');
    console.log('💡 Need help? Check DATABASE_SETUP.md for detailed instructions.');
    
  } catch (error) {
    console.error('❌ Error reading migration file:', error.message);
    console.log('');
    console.log('Make sure the migration file exists at:');
    console.log(MIGRATION_FILE);
  }
}

runMigration();