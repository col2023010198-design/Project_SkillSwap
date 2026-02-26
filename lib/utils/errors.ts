import { ApiResponse } from '../types/messaging';

// Map PostgreSQL error codes to user-friendly messages
export function handleDatabaseError(error: any): string {
  console.error('Database error:', error);
  
  if (!error) return 'An unexpected error occurred';
  
  // PostgreSQL error codes
  if (error.code === '23505') {
    return 'This conversation already exists';
  }
  if (error.code === '23503') {
    return 'Invalid user or conversation reference';
  }
  if (error.code === '23514') {
    return 'Message content is invalid';
  }
  if (error.code === 'PGRST116') {
    return 'No data found';
  }
  
  // Generic error message
  return error.message || 'An error occurred. Please try again.';
}

// Wrapper for database operations with error handling
export async function handleDatabaseOperation<T>(
  operation: () => Promise<{ data: T | null; error: any }>
): Promise<ApiResponse<T>> {
  try {
    const { data, error } = await operation();
    
    if (error) {
      return { data: null, error: handleDatabaseError(error) };
    }
    
    return { data, error: null };
  } catch (err) {
    console.error('Unexpected error:', err);
    return { data: null, error: 'An unexpected error occurred' };
  }
}
