/**
 * AIcademics Extension Error Handler
 * Provides centralized error handling for the extension.
 */

// Log and format errors
export function handleError(error, context = '') {
  // Format error message
  const errorMessage = formatError(error);
  
  // Log to console with context
  console.error(`[AIcademics Error${context ? ` - ${context}` : ''}]:`, errorMessage, error);
  
  // Return a friendly error message for display to the user
  return {
    message: getUserFriendlyMessage(error),
    details: errorMessage,
    timestamp: new Date().toISOString()
  };
}

// Format error object into a string
function formatError(error) {
  if (typeof error === 'string') {
    return error;
  }
  
  if (error instanceof Error) {
    return `${error.name}: ${error.message}\n${error.stack || ''}`;
  }
  
  return JSON.stringify(error);
}

// Convert technical errors to user-friendly messages
function getUserFriendlyMessage(error) {
  // Network error detection
  if (error.message && (
      error.message.includes('NetworkError') || 
      error.message.includes('Failed to fetch') ||
      error.message.includes('Network request failed')
    )) {
    return 'Unable to connect to the server. Please check your internet connection.';
  }
  
  // Authentication errors
  if (error.message && (
      error.message.includes('authentication') ||
      error.message.includes('auth') ||
      error.message.includes('Not authenticated') ||
      error.message.includes('Unauthorized') ||
      error.status === 401
    )) {
    return 'You need to sign in to perform this action.';
  }
  
  // Permission errors
  if (error.message && (
      error.message.includes('permission') ||
      error.message.includes('Forbidden') ||
      error.status === 403
    )) {
    return 'You don\'t have permission to perform this action.';
  }
  
  // API rate limit errors (for OpenAI)
  if (error.message && (
      error.message.includes('rate limit') ||
      error.message.includes('Rate limit') ||
      error.message.includes('too many requests') ||
      error.status === 429
    )) {
    return 'Rate limit exceeded. Please try again later.';
  }
  
  // Default error message
  return 'Something went wrong. Please try again.';
}

// Report error to telemetry (disabled for now)
export async function reportError(error, context = '') {
  // For future implementation:
  // This would send error reports to a centralized error tracking service
  // Currently disabled for privacy reasons
  
  // Just log the error for now
  handleError(error, context);
}

// Store error in local logging
export function logErrorLocally(error, context = '') {
  const errorData = {
    message: formatError(error),
    context,
    timestamp: new Date().toISOString()
  };
  
  // Get existing logs
  chrome.storage.local.get(['errorLogs'], (result) => {
    const logs = result.errorLogs || [];
    
    // Add new error, limit to latest 50
    logs.push(errorData);
    const trimmedLogs = logs.slice(-50);
    
    // Save updated logs
    chrome.storage.local.set({ errorLogs: trimmedLogs });
  });
} 