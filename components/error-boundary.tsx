"use client"

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { AlertTriangle, RefreshCw, Home } from 'lucide-react'
import Link from 'next/link'
import { logError, createError, ErrorType } from '@/lib/error-handling'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
}

interface State {
  hasError: boolean
  error: Error | null
  errorId: string | null
}

/**
 * Error Boundary component that catches JavaScript errors anywhere in the child component tree
 * Provides a fallback UI and error reporting capabilities
 */
export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorId: null
    }
  }

  static getDerivedStateFromError(error: Error): State {
    // Generate a unique error ID for tracking
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    return {
      hasError: true,
      error,
      errorId
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error with our structured error handling
    const appError = createError(
      ErrorType.UNKNOWN_ERROR,
      error.message,
      'An unexpected error occurred',
      0,
      false,
      {
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        errorId: this.state.errorId
      }
    )

    logError(appError, 'ErrorBoundary')

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo)

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: Send to error reporting service
      // errorReportingService.captureException(error, {
      //   extra: errorInfo,
      //   tags: { errorId: this.state.errorId }
      // })
    }
  }

  handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorId: null
    })
  }

  handleReload = () => {
    window.location.reload()
  }

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <Card className="max-w-md w-full bg-white/90 backdrop-blur-sm border-white/20 shadow-2xl">
            <CardContent className="p-8 text-center">
              {/* Error Icon */}
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-6">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>

              {/* Error Message */}
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Something went wrong
              </h2>
              <p className="text-gray-600 mb-6">
                We encountered an unexpected error. Don't worry, our team has been notified.
              </p>

              {/* Error Details (only in development) */}
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="bg-gray-100 rounded-lg p-4 mb-6 text-left">
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Error Details (Development Only):
                  </h3>
                  <p className="text-xs text-gray-600 font-mono break-all">
                    {this.state.error.message}
                  </p>
                  {this.state.errorId && (
                    <p className="text-xs text-gray-500 mt-2">
                      Error ID: {this.state.errorId}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <Button
                  onClick={this.handleRetry}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Try Again
                </Button>
                
                <Button
                  onClick={this.handleReload}
                  variant="ghost"
                  className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                >
                  Reload Page
                </Button>
                
                <Link href="/" className="block">
                  <Button
                    variant="ghost"
                    className="w-full text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Go Home
                  </Button>
                </Link>
              </div>

              {/* Support Information */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <p className="text-xs text-gray-500">
                  If this problem persists, please contact our support team.
                  {this.state.errorId && (
                    <>
                      <br />
                      Reference ID: <span className="font-mono">{this.state.errorId}</span>
                    </>
                  )}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

/**
 * Hook version of Error Boundary for functional components
 * Note: This is a simplified version - full error boundaries require class components
 */
export function useErrorHandler() {
  return (error: Error, errorInfo?: any) => {
    const appError = createError(
      ErrorType.UNKNOWN_ERROR,
      error.message,
      'An unexpected error occurred',
      0,
      false,
      { ...errorInfo, timestamp: new Date().toISOString() }
    )

    logError(appError, 'useErrorHandler')
    
    // In a real app, you might want to show a toast notification
    // or redirect to an error page
    console.error('Unhandled error:', error)
  }
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  )

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`
  
  return WrappedComponent
}