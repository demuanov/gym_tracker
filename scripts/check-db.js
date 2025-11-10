/**
 * Database Health Check Script
 * 
 * This script checks if your database migration was applied correctly
 * and if your app can connect to Supabase.
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables from .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = join(__dirname, '..', '.env');

try {
  const envContent = readFileSync(envPath, 'utf8');
  const envLines = envContent.split('\n');
  
  envLines.forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        process.env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
} catch (error) {
  console.log('Warning: Could not load .env file');
}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY;

async function checkDatabase() {
  console.log('🔍 Database Health Check');
  console.log('========================');
  console.log('');

  // Check environment variables
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    console.log('❌ Missing environment variables');
    console.log('Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file');
    return;
  }

  console.log('✅ Environment variables found');
  console.log(`🔗 Supabase URL: ${SUPABASE_URL}`);
  console.log('');

  try {
    // Create Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

    // Test connection by checking tables
    const tables = ['exercises', 'training_plans', 'workout_sessions', 'workout_exercises'];
    
    console.log('🔄 Checking database tables...');
    
    for (const table of tables) {
      try {
        const { error } = await supabase.from(table).select('count', { count: 'exact', head: true });
        
        if (error) {
          console.log(`❌ Table '${table}': ${error.message}`);
        } else {
          console.log(`✅ Table '${table}': OK`);
        }
      } catch (err) {
        console.log(`❌ Table '${table}': Connection error`);
      }
    }

    console.log('');
    console.log('🎯 Next steps:');
    console.log('1. If tables are missing, run the migration in Supabase dashboard');
    console.log('2. If connection fails, check your environment variables');
    console.log('3. Start your app with: npm run dev');

  } catch (error) {
    console.log('❌ Connection failed:', error.message);
    console.log('');
    console.log('💡 Troubleshooting:');
    console.log('1. Verify your Supabase URL and API key');
    console.log('2. Check if your Supabase project is active');
    console.log('3. Ensure you have applied the database migration');
  }
}

checkDatabase();