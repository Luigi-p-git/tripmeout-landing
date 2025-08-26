/**
 * Google Places API service for city autocomplete functionality
 * Provides type-safe interfaces and comprehensive error handling for place suggestions
 */

import { 
  createError, 
  ErrorType, 
  withRetry, 
  fetchWithTimeout, 
  logError,
  type AppError 
} from './error-handling'

export interface PlaceSuggestion {
  placeId: string
  description: string
  mainText: string
  secondaryText: string
  types: string[]
}

export interface PlacesApiResponse {
  predictions: PlaceSuggestion[]
  status: string
}

export interface PlacesApiError {
  error: string
  status?: string
}

/**
 * Fetches city suggestions from Google Places API with comprehensive error handling
 * @param input - The search query string
 * @returns Promise with place suggestions or throws AppError
 */
export async function getCitySuggestions(input: string): Promise<PlaceSuggestion[]> {
  // Input validation
  if (!input || typeof input !== 'string') {
    throw createError(
      ErrorType.VALIDATION_ERROR,
      'Invalid input provided',
      'Please enter a valid search term',
      400,
      false
    )
  }

  const trimmedInput = input.trim()
  if (trimmedInput.length < 2) {
    return []
  }

  if (trimmedInput.length > 100) {
    throw createError(
      ErrorType.VALIDATION_ERROR,
      'Input too long',
      'Search term must be less than 100 characters',
      400,
      false
    )
  }

  const fetchOperation = async (): Promise<PlaceSuggestion[]> => {
    try {
      const response = await fetchWithTimeout('/api/places/autocomplete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ input: trimmedInput }),
      }, 8000) // 8 second timeout

      if (!response.ok) {
        let errorData: PlacesApiError
        try {
          errorData = await response.json()
        } catch {
          errorData = { error: 'Unknown server error' }
        }

        const errorType = response.status === 429 
          ? ErrorType.RATE_LIMIT_ERROR 
          : response.status >= 500 
          ? ErrorType.API_ERROR 
          : ErrorType.VALIDATION_ERROR

        const appError = createError(
          errorType,
          errorData.error || `HTTP error! status: ${response.status}`,
          getErrorMessage(response.status, errorData.error),
          response.status,
          response.status >= 500 || response.status === 429, // Retryable for server errors and rate limits
          { status: response.status, originalError: errorData }
        )

        logError(appError, 'getCitySuggestions')
        throw appError
      }

      const data: PlacesApiResponse = await response.json()
      
      // Handle Google Places API specific errors
      if (data.status && data.status !== 'OK' && data.status !== 'ZERO_RESULTS') {
        const appError = createError(
          ErrorType.API_ERROR,
          `Google Places API error: ${data.status}`,
          getGooglePlacesErrorMessage(data.status),
          response.status,
          data.status === 'OVER_QUERY_LIMIT' || data.status === 'UNKNOWN_ERROR',
          { googleStatus: data.status }
        )

        logError(appError, 'getCitySuggestions - Google Places API')
        throw appError
      }

      return data.predictions || []
    } catch (error) {
      // Re-throw AppErrors as-is
      if (error && typeof error === 'object' && 'type' in error) {
        throw error
      }

      // Wrap unknown errors
      const appError = createError(
        ErrorType.UNKNOWN_ERROR,
        error instanceof Error ? error.message : 'Unknown error occurred',
        'Unable to fetch city suggestions. Please try again.',
        0,
        true,
        error
      )

      logError(appError, 'getCitySuggestions - Unknown error')
      throw appError
    }
  }

  // Use retry logic for the operation
  return withRetry(fetchOperation, {
    maxAttempts: 3,
    baseDelay: 1000,
    maxDelay: 5000
  })
}

/**
 * Gets user-friendly error messages for HTTP status codes
 */
function getErrorMessage(status: number, originalError?: string): string {
  switch (status) {
    case 400:
      return 'Invalid search request. Please check your input.'
    case 401:
    case 403:
      return 'Access denied. Please try again later.'
    case 429:
      return 'Too many requests. Please wait a moment before searching again.'
    case 500:
    case 502:
    case 503:
      return 'Server is temporarily unavailable. Please try again in a moment.'
    case 504:
      return 'Request timed out. Please try again.'
    default:
      return originalError || 'Unable to fetch suggestions. Please try again.'
  }
}

/**
 * Gets user-friendly error messages for Google Places API status codes
 */
function getGooglePlacesErrorMessage(status: string): string {
  switch (status) {
    case 'REQUEST_DENIED':
      return 'Search service is temporarily unavailable.'
    case 'OVER_QUERY_LIMIT':
      return 'Search limit reached. Please try again later.'
    case 'INVALID_REQUEST':
      return 'Invalid search request. Please try a different search term.'
    case 'UNKNOWN_ERROR':
      return 'Search service encountered an error. Please try again.'
    default:
      return 'Search service is temporarily unavailable.'
  }
}

/**
 * Formats place suggestion for display
 * @param suggestion - The place suggestion object
 * @returns Formatted display string
 */
export function formatPlaceDisplay(suggestion: PlaceSuggestion): string {
  return suggestion.description
}

/**
 * Checks if a place suggestion is a city/locality
 * @param suggestion - The place suggestion object
 * @returns True if the suggestion represents a city
 */
export function isCityType(suggestion: PlaceSuggestion): boolean {
  const cityTypes = ['locality', 'administrative_area_level_1', 'administrative_area_level_2', 'country']
  return suggestion.types.some(type => cityTypes.includes(type))
}