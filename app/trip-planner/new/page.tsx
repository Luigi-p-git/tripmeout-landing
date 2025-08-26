'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { db, auth } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ArrowLeft, Save, MapPin, LogOut } from 'lucide-react'
import Link from 'next/link'

/**
 * New Trip Creation Page
 * Allows users to create a new trip with basic information
 */
export default function NewTripPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    start_date: '',
    end_date: '',
    budget: ''
  })

  useEffect(() => {
    checkUser()
  }, [])

  /**
   * Check if user is authenticated
   */
  const checkUser = async () => {
    try {
      const currentUser = await auth.getUser()
      if (!currentUser) {
        router.push('/trip-planner')
        return
      }
      setUser(currentUser)
    } catch (error) {
      // Handle auth session missing error gracefully
      if (error.message?.includes('Auth session missing')) {
        console.log('No active session found, redirecting to trip planner')
      } else {
        console.error('Error checking user:', error)
      }
      router.push('/trip-planner')
    }
  }

  /**
   * Handle form input changes
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  /**
   * Handle sign out
   */
  const handleSignOut = async () => {
    try {
      await auth.signOut()
      router.push('/trip-planner')
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!user) {
      console.error('User not authenticated')
      return
    }
    
    setLoading(true)

    try {
      const tripData = {
        ...formData,
        user_id: user.id,
        budget: formData.budget ? parseFloat(formData.budget) : undefined,
        status: 'planning' as const
      }

      const newTrip = await db.trips.create(tripData)
      
      // Redirect to the trip planner main page
      router.push('/trip-planner')
    } catch (error) {
      console.error('Error creating trip:', error)
      // In a real app, show error toast/notification
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen py-8 relative">
      {/* Sign Out Button */}
      <div className="absolute top-8 right-8 z-10">
        <Button
          onClick={handleSignOut}
          className="bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 rounded-full shadow-lg hover:shadow-xl flex items-center gap-2 px-6 py-3"
          variant="outline"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Sign Out</span>
        </Button>
      </div>

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 font-fredericka">
            Create New Trip
          </h1>
          <p className="text-white/90 font-medium">
            Plan your next adventure with all the details
          </p>
        </div>

        {/* Form */}
        <div className="backdrop-blur-sm bg-white/10 rounded-2xl border border-white/20 shadow-lg p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
                Trip Title *
              </label>
              <Input
                id="title"
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="e.g., Summer Vacation in Europe"
                required
                className="w-full bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/25 focus:border-white/50 rounded-full"
              />
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
                Description
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe your trip plans, destinations, activities..."
                rows={4}
                className="w-full px-4 py-3 bg-white/20 border border-white/30 rounded-2xl text-white placeholder:text-white/60 focus:outline-none focus:bg-white/25 focus:border-white/50 transition-all duration-200"
              />
            </div>

            {/* Dates */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start_date" className="block text-sm font-medium text-white mb-2">
                  Start Date *
                </label>
                <Input
                  id="start_date"
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  required
                  className="w-full bg-white/20 border-white/30 text-white focus:bg-white/25 focus:border-white/50 rounded-full [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
              <div>
                <label htmlFor="end_date" className="block text-sm font-medium text-white mb-2">
                  End Date *
                </label>
                <Input
                  id="end_date"
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  required
                  className="w-full bg-white/20 border-white/30 text-white focus:bg-white/25 focus:border-white/50 rounded-full [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                />
              </div>
            </div>

            {/* Budget */}
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-white mb-2">
                Budget (Optional)
              </label>
              <Input
                id="budget"
                type="number"
                value={formData.budget}
                onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                placeholder="e.g., 2500"
                min="0"
                step="0.01"
                className="w-full bg-white/20 border-white/30 text-white placeholder:text-white/60 focus:bg-white/25 focus:border-white/50 rounded-full"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-4 pt-4">
              <Link href="/trip-planner" className="flex-1">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full bg-white/20 hover:bg-white/30 text-white border border-white/30 backdrop-blur-sm transition-all duration-200 rounded-full"
                >
                  Cancel
                </Button>
              </Link>
              <Button 
                type="submit" 
                disabled={loading}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground backdrop-blur-sm transition-all duration-200 rounded-full shadow-button hover:shadow-button-hover"
              >
                {loading ? 'Creating...' : 'Create Trip'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}