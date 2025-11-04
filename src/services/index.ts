// Re-export all services from a single entry point
export * from './supabase';

// API error handling
export class ApiError extends Error {
  constructor(message: string, public code?: string, public details?: any) {
    super(message);
    this.name = 'ApiError';
  }
}

// Service response wrapper
export interface ServiceResponse<T = any> {
  data: T | null;
  error: string | null;
  success: boolean;
}

export const createResponse = <T>(data: T | null, error: string | null = null): ServiceResponse<T> => ({
  data,
  error,
  success: !error && data !== null,
});