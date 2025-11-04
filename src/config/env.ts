// Environment configuration
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY,
  },
  app: {
    name:  'Gym Tracker',
    version: '1.0.0',
  },
} as const;

// Validation
if (!config.supabase.url || !config.supabase.anonKey) {
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}