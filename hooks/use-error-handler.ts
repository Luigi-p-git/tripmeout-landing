import { useState, useCallback } from 'react'
import { type AppError, ErrorType, createError, logError, getUserFriendlyMessage } from '@/lib/error-handling'

interface UseErrorHandlerReturn {
  error: AppError | null
  isLoading: boolean
  clearError: () => void
  handleError: (error: unknown, context?: string) => void
  executeWithErrorHandling: <T>(
    operation: () => Promise<T>,
    options?: {
      loadingState?: boolean
      context?: string
      onSuccess?: (result: T) => void
      onError?: (error: AppError) => void
    }
  ) => Promise<T | null>
}

/**
 * Custom hook for consistent error handling across the application
 * Provides error state management, logging, and user-friendly error display
 */
export function useErrorHandler(): UseErrorHandlerReturn {
  const [error, setError] = useState<AppError | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  /**
   * Clear the current error state
   */
  const clearError = useCallback(() => {
    setError(null)
  }, [])

  /**
   * Handle and process errors consistently
   */
  const handleError = useCallback((error: unknown, context?: string) => {
    let appError: AppError

    if (error && typeof error === 'object' && 'type' in error) {
      // Already an AppError
      appError = error as AppError
    } else if (error instanceof Error) {
      // Convert Error to AppError
      appError = createError(
        ErrorType.UNKNOWN_ERROR,
        error.message,
        'An unexpected error occurred',
        0,
        false,
        { originalError: error.name, stack: error.stack }
      )
    } else {
      // Handle unknown error types
      appError = createError(
        ErrorType.UNKNOWN_ERROR,
        String(error),
        'An unexpected error occurred',
        0,
        false,
        { originalError: error }
      )
    }

    // Log the error
    logError(appError, context || 'useErrorHandler')

    // Set error state
    setError(appError)
  }, [])

  /**
   * Execute an async operation with automatic error handling and loading state
   */
  const executeWithErrorHandling = useCallback(async <T>(
    operation: () => Promise<T>,
    options: {
      loadingState?: boolean
      context?: string
      onSuccess?: (result: T) => void
      onError?: (error: AppError) => void
    } = {}
  ): Promise<T | null> => {
    const { loadingState = true, context, onSuccess, onError } = options

    try {
      if (loadingState) {
        setIsLoading(true)
      }
      clearError()

      const result = await operation()
      
      if (onSuccess) {
        onSuccess(result)
      }
      
      return result
    } catch (error) {
      handleError(error, context)
      
      if (onError && error && typeof error === 'object' && 'type' in error) {
        onError(error as AppError)
      }
      
      return null
    } finally {
      if (loadingState) {
        setIsLoading(false)
      }
    }
  }, [handleError, clearError])

  return {
    error,
    isLoading,
    clearError,
    handleError,
    executeWithErrorHandling
  }
}

/**
 * Hook for handling API-specific errors with retry logic
 */
export function useApiErrorHandler() {
  const { error, isLoading, clearError, handleError, executeWithErrorHandling } = useErrorHandler()
  const [retryCount, setRetryCount] = useState(0)

  /**
   * Execute API operation with retry logic
   */
  const executeApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    options: {
      maxRetries?: number
      context?: string
      onSuccess?: (result: T) => void
      onError?: (error: AppError) => void
    } = {}
  ): Promise<T | null> => {
    const { maxRetries = 3, context = 'API Call', onSuccess, onError } = options

    const operation = async (): Promise<T> => {
      try {
        const result = await apiCall()
        setRetryCount(0) // Reset retry count on success
        return result
      } catch (error) {
        // Check if error is retryable
        if (error && typeof error === 'object' && 'retryable' in error && error.retryable && retryCount < maxRetries) {
          setRetryCount(prev => prev + 1)
          // Add exponential backoff delay
          const delay = Math.min(1000 * Math.pow(2, retryCount), 10000)
          await new Promise(resolve => setTimeout(resolve, delay))
          throw error // Re-throw to trigger retry
        }
        throw error
      }
    }

    return executeWithErrorHandling(operation, {
      context,
      onSuccess,
      onError
    })
  }, [executeWithErrorHandling, retryCount])

  /**
   * Manual retry function
   */
  const retry = useCallback((apiCall: () => Promise<any>) => {
    setRetryCount(0)
    clearError()
    return executeApiCall(apiCall)
  }, [executeApiCall, clearError])

  return {
    error,
    isLoading,
    retryCount,
    clearError,
    handleError,
    executeApiCall,
    retry
  }
}

/**
 * Hook for form validation errors
 */
export function useFormErrorHandler() {
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  const { error, clearError, handleError } = useErrorHandler()

  /**
   * Set error for a specific field
   */
  const setFieldError = useCallback((field: string, message: string) => {
    setFieldErrors(prev => ({ ...prev, [field]: message }))
  }, [])

  /**
   * Clear error for a specific field
   */
  const clearFieldError = useCallback((field: string) => {
    setFieldErrors(prev => {
      const newErrors = { ...prev }
      delete newErrors[field]
      return newErrors
    })
  }, [])

  /**
   * Clear all field errors
   */
  const clearAllFieldErrors = useCallback(() => {
    setFieldErrors({})
  }, [])

  /**
   * Handle validation errors from API responses
   */
  const handleValidationError = useCallback((error: AppError) => {
    if (error.type === ErrorType.VALIDATION_ERROR && error.details?.fields) {
      // Handle field-specific validation errors
      const fields = error.details.fields as Record<string, string>
      setFieldErrors(fields)
    } else {
      // Handle general validation error
      handleError(error)
    }
  }, [handleError])

  return {
    error,
    fieldErrors,
    clearError,
    clearFieldError,
    clearAllFieldErrors,
    setFieldError,
    handleError,
    handleValidationError
  }
}