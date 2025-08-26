/**
 * Comprehensive error handling utilities for the trip planner application
 * Provides standardized error types, retry logic, and user-friendly error messages
 */

export enum ErrorType {
  NETWORK_ERROR = 'NETWORK_ERROR',
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT_ERROR = 'RATE_LIMIT_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  TIMEOUT_ERROR = 'TIMEOUT_ERROR',
  UNKNOWN_ERROR = 'UNKNOWN_ERROR'
}

export interface AppError {
  type: ErrorType
  message: string
  userMessage: string
  statusCode?: number
  retryable: boolean
  details?: any
}

/**
 * Creates a standardized error object
 */
export function createError(
  type: ErrorType,
  message: string,
  userMessage: string,
  statusCode?: number,
  retryable: boolean = false,
  details?: any
): AppError {
  return {
    type,
    message,
    userMessage,
    statusCode,
    retryable,
    details
  }
}

/**
 * Maps HTTP status codes to error types
 */
export function getErrorTypeFromStatus(status: number): ErrorType {
  switch (status) {
    case 400:
      return ErrorType.VALIDATION_ERROR
    case 401:
    case 403:
      return ErrorType.AUTHENTICATION_ERROR
    case 429:
      return ErrorType.RATE_LIMIT_ERROR
    case 408:
    case 504:
      return ErrorType.TIMEOUT_ERROR
    case 500:
    case 502:
    case 503:
      return ErrorType.API_ERROR
    default:
      return ErrorType.UNKNOWN_ERROR
  }
}

/**
 * Gets user-friendly error messages
 */
export function getUserFriendlyMessage(error: AppError): string {
  switch (error.type) {
    case ErrorType.NETWORK_ERROR:
      return "Please check your internet connection and try again."
    case ErrorType.API_ERROR:
      return "We're experiencing technical difficulties. Please try again in a moment."
    case ErrorType.VALIDATION_ERROR:
      return error.userMessage || "Please check your input and try again."
    case ErrorType.RATE_LIMIT_ERROR:
      return "Too many requests. Please wait a moment before trying again."
    case ErrorType.AUTHENTICATION_ERROR:
      return "Authentication failed. Please check your credentials."
    case ErrorType.TIMEOUT_ERROR:
      return "The request timed out. Please try again."
    default:
      return "Something went wrong. Please try again."
  }
}

/**
 * Retry configuration
 */
export interface RetryConfig {
  maxAttempts: number
  baseDelay: number
  maxDelay: number
  backoffFactor: number
}

const DEFAULT_RETRY_CONFIG: RetryConfig = {
  maxAttempts: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  backoffFactor: 2
}

/**
 * Implements exponential backoff retry logic
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  config: Partial<RetryConfig> = {}
): Promise<T> {
  const { maxAttempts, baseDelay, maxDelay, backoffFactor } = {
    ...DEFAULT_RETRY_CONFIG,
    ...config
  }

  let lastError: Error
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      
      // Don't retry on non-retryable errors
      if (error instanceof Error && 'retryable' in error && !error.retryable) {
        throw error
      }
      
      // Don't retry on last attempt
      if (attempt === maxAttempts) {
        throw lastError
      }
      
      // Calculate delay with exponential backoff
      const delay = Math.min(
        baseDelay * Math.pow(backoffFactor, attempt - 1),
        maxDelay
      )
      
      // Add jitter to prevent thundering herd
      const jitteredDelay = delay + Math.random() * 1000
      
      await new Promise(resolve => setTimeout(resolve, jitteredDelay))
    }
  }
  
  throw lastError!
}

/**
 * Wraps fetch with timeout and error handling
 */
export async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs: number = 10000
): Promise<Response> {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs)
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    })
    
    clearTimeout(timeoutId)
    return response
  } catch (error) {
    clearTimeout(timeoutId)
    
    if (error instanceof Error && error.name === 'AbortError') {
      throw createError(
        ErrorType.TIMEOUT_ERROR,
        'Request timed out',
        'The request took too long to complete',
        408,
        true
      )
    }
    
    throw createError(
      ErrorType.NETWORK_ERROR,
      'Network request failed',
      'Unable to connect to the server',
      0,
      true,
      error
    )
  }
}

/**
 * Logs errors with structured format
 */
export function logError(error: AppError, context?: string): void {
  const logData = {
    timestamp: new Date().toISOString(),
    context,
    type: error.type,
    message: error.message,
    statusCode: error.statusCode,
    retryable: error.retryable,
    details: error.details
  }
  
  console.error('Application Error:', logData)
  
  // In production, you might want to send this to an error tracking service
  // like Sentry, LogRocket, or similar
}