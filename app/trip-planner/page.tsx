'use client'

import { useEffect, useState } from 'react'
import { db, auth, type Trip, type User } from '@/lib/supabase'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CityAutocomplete } from '@/components/ui/city-autocomplete'
import { TripCard } from '@/components/trip-card'
import { Plus, User, MapPin, Search, X } from 'lucide-react'
import Link from 'next/link'
import { type PlaceSuggestion } from '@/lib/google-places'

/**
 * Main Trip Planner page component
 * Displays user's trips and provides navigation to create new trips
 */
export default function TripPlannerPage() {
  const [trips, setTrips] = useState<Trip[]>([])
  const [filteredTrips, setFilteredTrips] = useState<Trip[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [isManifestoOpen, setIsManifestoOpen] = useState(false)
  const [destinationSearch, setDestinationSearch] = useState('')

  useEffect(() => {
    checkUser()
  }, [])

  /**
   * Check if user is authenticated and load their trips
   */
  const checkUser = async () => {
    try {
      const currentUser = await auth.getUser()
      if (currentUser) {
        setUser(currentUser)
        await loadTrips(currentUser.id)
      }
    } catch (error) {
      // Handle auth session missing error gracefully
      if (error.message?.includes('Auth session missing')) {
        console.log('No active session found')
      } else {
        console.error('Error checking user:', error)
      }
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  /**
   * Load user's trips from database
   */
  const loadTrips = async (userId: string) => {
    try {
      const userTrips = await db.trips.getAll(userId)
      setTrips(userTrips)
      setFilteredTrips(userTrips)
    } catch (error) {
      console.error('Error loading trips:', error)
    }
  }

  /**
   * Handle search functionality
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    if (!query.trim()) {
      setFilteredTrips(trips)
    } else {
      const filtered = trips.filter(trip => 
        trip.title?.toLowerCase().includes(query.toLowerCase()) ||
        trip.destination?.toLowerCase().includes(query.toLowerCase()) ||
        trip.description?.toLowerCase().includes(query.toLowerCase())
      )
      setFilteredTrips(filtered)
    }
  }

  /**
   * Handle destination search for unauthenticated users
   */
  const handleDestinationSearch = (query: string) => {
    if (query.trim()) {
      // Navigate to search results page with the query
      window.location.href = `/trip-planner/search?q=${encodeURIComponent(query)}`
    }
  }

  /**
   * Handle city selection from autocomplete
   */
  const handleCitySelect = (city: PlaceSuggestion) => {
    // Navigate to search results page with the selected city
    window.location.href = `/trip-planner/search?q=${encodeURIComponent(city.mainText)}&city=${encodeURIComponent(city.placeId)}`
  }



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-white font-medium backdrop-blur-sm bg-white/10 px-6 py-3 rounded-full border border-white/20">
          Loading your trips...
        </div>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        {/* Prominent Search Bar for Unauthenticated Users */}
        <div className="w-full max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold text-white font-fredericka mb-4">
              Plan Your Perfect Trip
            </h1>
            <p className="text-xl text-white/90 font-medium mb-8">
              Discover destinations, create itineraries, and make memories
            </p>
          </div>
          
          {/* Search Bar */}
          <CityAutocomplete
            placeholder="Search destinations, create itineraries, discover places..."
            size="large"
            showSearchButton={true}
            value={destinationSearch}
            onChange={setDestinationSearch}
            onSearch={handleDestinationSearch}
            onCitySelect={handleCitySelect}
            className="w-full"
          />
          
          {/* Quick Actions */}
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button 
              variant="ghost"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40 rounded-full backdrop-blur-sm"
            >
              <MapPin className="h-4 w-4 mr-2" />
              Popular Destinations
            </Button>
            <Button 
              variant="ghost"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40 rounded-full backdrop-blur-sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Trip
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="flex flex-col gap-6 mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold text-white font-fredericka mb-2">My Trips</h1>
              <p className="text-white/90 font-medium">
                Plan and manage your travel adventures
              </p>
            </div>
            <Link href="/trip-planner/new">
              <Button className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground backdrop-blur-sm transition-all duration-200 rounded-full shadow-button hover:shadow-button-hover">
                <Plus className="h-4 w-4" />
                New Trip
              </Button>
            </Link>
          </div>
          
          {/* Search Bar and Lucky Strike Button */}
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <CityAutocomplete
              placeholder="Search trips by destination, title, or description..."
              size="default"
              showSearchButton={false}
              value={searchQuery}
              onChange={handleSearch}
              onCitySelect={(city) => handleSearch(city.mainText)}
              className="max-w-md w-full sm:w-auto"
            />
            
            {/* Lucky Strike Button */}
             <Button
               className="bg-primary hover:bg-primary/90 text-primary-foreground backdrop-blur-sm transition-all duration-200 rounded-full shadow-button hover:shadow-button-hover px-6"
               onClick={() => setIsManifestoOpen(!isManifestoOpen)}
             >
               Lucky Strike
             </Button>
          </div>
        </div>

        {/* Trips Grid */}
        {filteredTrips.length === 0 && trips.length > 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto backdrop-blur-sm bg-white/10 rounded-2xl border border-white/20 shadow-lg p-8">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                No trips found
              </h3>
              <p className="text-white/80 mb-6">
                Try adjusting your search terms or create a new trip.
              </p>
              <Button 
                onClick={() => handleSearch('')}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/40 rounded-full"
              >
                Clear Search
              </Button>
            </div>
          </div>
        ) : trips.length === 0 ? (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto backdrop-blur-sm bg-white/10 rounded-2xl border border-white/20 shadow-lg p-8">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <MapPin className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                No trips yet
              </h3>
              <p className="text-white/80 mb-6">
                Start planning your first adventure!
              </p>
              <Link href="/trip-planner/new">
                <Button className="bg-primary hover:bg-primary/90 text-primary-foreground backdrop-blur-sm transition-all duration-200 rounded-full shadow-button hover:shadow-button-hover">
                  Create Your First Trip
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTrips.map((trip) => (
              <TripCard key={trip.id} trip={trip} />
            ))}
          </div>
        )}
        
        {/* Manifesto Modal */}
        {isManifestoOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="relative max-w-3xl w-full max-h-[80vh] overflow-hidden bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl shadow-2xl">
              <div className="absolute top-4 right-4 z-10">
                <Button
                  onClick={() => setIsManifestoOpen(false)}
                  variant="ghost"
                  size="icon"
                  className="text-white hover:bg-white/20 rounded-full"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
              
              <div className="p-8 overflow-y-auto max-h-full">
                <h2 className="text-3xl font-bold text-white mb-6 font-fredericka text-center">
                  Our Manifesto
                </h2>
                
                <article className="text-white/90 space-y-4 italic text-center">
                  <p>
                    "We stand at the forefront of a new era, where creativity
                    meets technology to redefine what's possible. Our mission
                    is to empower individuals and businesses alike with
                    groundbreaking solutions that inspire change and drive
                    progress.
                  </p>
                  <p>
                    We stand at the forefront of a new era, where creativity meets
                    technology to redefine what's possible. Our mission is to
                    empower individuals and businesses alike with groundbreaking
                    solutions that inspire change and drive progress.
                  </p>
                  <p>
                    We believe in constant innovation, pushing boundaries to
                    create products that are not just tools, but catalysts for
                    transformation. We value simplicity, designing intuitive
                    experiences that make complex tasks effortless and enjoyable.
                    Our commitment to sustainability drives us to protect our
                    planet while delivering exceptional value. We foster
                    collaboration, building bridges between diverse perspectives
                    to create solutions that truly matter."
                  </p>
                </article>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}