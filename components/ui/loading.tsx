import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  className?: string
  color?: 'primary' | 'secondary' | 'white'
}

/**
 * Loading spinner component with different sizes and colors
 */
export function LoadingSpinner({ 
  size = 'md', 
  className, 
  color = 'primary' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8',
    xl: 'h-12 w-12'
  }

  const colorClasses = {
    primary: 'text-indigo-600',
    secondary: 'text-gray-600',
    white: 'text-white'
  }

  return (
    <Loader2 
      className={cn(
        'animate-spin',
        sizeClasses[size],
        colorClasses[color],
        className
      )} 
    />
  )
}

interface LoadingOverlayProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl'
  message?: string
}

/**
 * Loading overlay that covers its container with a spinner
 */
export function LoadingOverlay({ 
  isLoading, 
  children, 
  className,
  spinnerSize = 'lg',
  message = 'Loading...'
}: LoadingOverlayProps) {
  return (
    <div className={cn('relative', className)}>
      {children}
      {isLoading && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="text-center">
            <LoadingSpinner size={spinnerSize} />
            {message && (
              <p className="mt-2 text-sm text-gray-600">{message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

interface LoadingCardProps {
  className?: string
  message?: string
  spinnerSize?: 'sm' | 'md' | 'lg' | 'xl'
}

/**
 * Loading card component for placeholder content
 */
export function LoadingCard({ 
  className, 
  message = 'Loading...', 
  spinnerSize = 'lg' 
}: LoadingCardProps) {
  return (
    <div className={cn(
      'bg-white rounded-lg border border-gray-200 p-8 text-center',
      className
    )}>
      <LoadingSpinner size={spinnerSize} className="mx-auto" />
      <p className="mt-4 text-gray-600">{message}</p>
    </div>
  )
}

interface LoadingDotsProps {
  className?: string
  color?: 'primary' | 'secondary' | 'white'
}

/**
 * Loading dots animation
 */
export function LoadingDots({ className, color = 'primary' }: LoadingDotsProps) {
  const colorClasses = {
    primary: 'bg-indigo-600',
    secondary: 'bg-gray-600',
    white: 'bg-white'
  }

  return (
    <div className={cn('flex space-x-1', className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            'h-2 w-2 rounded-full animate-pulse',
            colorClasses[color]
          )}
          style={{
            animationDelay: `${i * 0.2}s`,
            animationDuration: '1s'
          }}
        />
      ))}
    </div>
  )
}

interface SkeletonProps {
  className?: string
  lines?: number
  avatar?: boolean
}

/**
 * Skeleton loading component for content placeholders
 */
export function Skeleton({ className, lines = 3, avatar = false }: SkeletonProps) {
  return (
    <div className={cn('animate-pulse', className)}>
      {avatar && (
        <div className="flex items-center space-x-4 mb-4">
          <div className="rounded-full bg-gray-300 h-10 w-10"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-4 bg-gray-300 rounded',
              i === lines - 1 ? 'w-2/3' : 'w-full'
            )}
          />
        ))}
      </div>
    </div>
  )
}

interface LoadingButtonProps {
  isLoading: boolean
  children: React.ReactNode
  className?: string
  disabled?: boolean
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
}

/**
 * Button with loading state
 */
export function LoadingButton({ 
  isLoading, 
  children, 
  className, 
  disabled, 
  onClick,
  type = 'button'
}: LoadingButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={cn(
        'inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors',
        className
      )}
    >
      {isLoading && (
        <LoadingSpinner size="sm" color="white" className="mr-2" />
      )}
      {children}
    </button>
  )
}

/**
 * Page-level loading component
 */
export function PageLoading({ message = 'Loading page...' }: { message?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
      <div className="text-center">
        <LoadingSpinner size="xl" />
        <p className="mt-4 text-lg text-gray-600">{message}</p>
      </div>
    </div>
  )
}