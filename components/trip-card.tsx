'use client'

import { Trip } from '@/lib/supabase'
import { Calendar, MapPin } from 'lucide-react'
import Link from 'next/link'

interface TripCardProps {
  trip: Trip
}

/**
 * TripCard component for displaying trip information in a card format
 * Used in the trip planner dashboard to show individual trips
 */
export function TripCard({ trip }: TripCardProps) {
  /**
   * Format date for display
   */
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No date set'
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  /**
   * Get status badge styling
   */
  const getStatusBadge = (status: Trip['status']) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium'
    switch (status) {
      case 'planning':
        return `${baseClasses} bg-blue-100 text-blue-800`
      case 'active':
        return `${baseClasses} bg-green-100 text-green-800`
      case 'completed':
        return `${baseClasses} bg-gray-100 text-gray-800`
      case 'cancelled':
        return `${baseClasses} bg-red-100 text-red-800`
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`
    }
  }

  return (
    <Link
      href={`/trip-planner/${trip.id}`}
      className="group"
    >
      <div className="bg-white rounded-xl shadow-sm border hover:shadow-md transition-all duration-200 group-hover:scale-[1.02] overflow-hidden">
        {/* Trip Image Placeholder */}
        <div className="h-48 bg-gradient-to-r from-indigo-500 to-purple-600 relative">
          <div className="absolute inset-0 bg-black bg-opacity-20"></div>
          <div className="absolute bottom-4 left-4 right-4">
            <span className={getStatusBadge(trip.status)}>
              {trip.status.charAt(0).toUpperCase() + trip.status.slice(1)}
            </span>
          </div>
        </div>
        
        {/* Trip Content */}
        <div className="p-6">
          <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
            {trip.title}
          </h3>
          
          {trip.description && (
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">
              {trip.description}
            </p>
          )}
          
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(trip.start_date)}</span>
            </div>
            {trip.end_date && (
              <div className="flex items-center gap-1">
                <span>to</span>
                <span>{formatDate(trip.end_date)}</span>
              </div>
            )}
          </div>
          
          {trip.budget && (
            <div className="mt-2 text-sm text-gray-500">
              Budget: ${trip.budget.toLocaleString()}
            </div>
          )}
        </div>
      </div>
    </Link>
  )
}