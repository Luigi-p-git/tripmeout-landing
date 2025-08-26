'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { CityAutocomplete } from '@/components/ui/city-autocomplete'
import { 
  LoadingSpinner, 
  LoadingOverlay, 
  LoadingCard, 
  Skeleton 
} from '@/components/ui/loading'
import { 
  Search, 
  MapPin, 
  Calendar, 
  Users, 
  DollarSign, 
  Grid3X3, 
  List, 
  Filter,
  SlidersHorizontal,
  Star,
  Clock,
  ArrowLeft,
  Heart,
  Share2,
  ExternalLink,
  AlertTriangle,
  RefreshCw
} from 'lucide-react'
import Link from 'next/link'
import { type PlaceSuggestion } from '@/lib/google-places'
import { type AppError, ErrorType, getUserFriendlyMessage } from '@/lib/error-handling'

// Mock data for search results - in a real app, this would come from an API
interface SearchResult {
  id: string
  title: string
  description: string
  location: string
  price: number
  rating: number
  reviews: number
  image: string
  category: 'hotel' | 'restaurant' | 'attraction' | 'activity'
  duration?: string
  openHours?: string
  tags: string[]
}

const mockResults: SearchResult[] = [
  {
    id: '1',
    title: 'Eiffel Tower',
    description: 'Iconic iron lattice tower and symbol of Paris, offering breathtaking views of the city.',
    location: 'Paris, France',
    price: 29,
    rating: 4.6,
    reviews: 125420,
    image: '/api/placeholder/300/200',
    category: 'attraction',
    duration: '2-3 hours',
    openHours: '9:00 AM - 11:45 PM',
    tags: ['Iconic', 'Views', 'Architecture']
  },
  {
    id: '2',
    title: 'Le Comptoir du Relais',
    description: 'Traditional French bistro serving classic dishes in a cozy, authentic atmosphere.',
    location: 'Saint-Germain, Paris',
    price: 45,
    rating: 4.4,
    reviews: 2840,
    image: '/api/placeholder/300/200',
    category: 'restaurant',
    openHours: '12:00 PM - 2:00 PM, 7:00 PM - 11:00 PM',
    tags: ['French Cuisine', 'Bistro', 'Traditional']
  },
  {
    id: '3',
    title: 'Hotel des Grands Boulevards',
    description: 'Boutique hotel with elegant rooms and modern amenities in the heart of Paris.',
    location: '2nd Arrondissement, Paris',
    price: 280,
    rating: 4.5,
    reviews: 1560,
    image: '/api/placeholder/300/200',
    category: 'hotel',
    tags: ['Boutique', 'Central', 'Luxury']
  },
  {
    id: '4',
    title: 'Seine River Cruise',
    description: 'Scenic boat tour along the Seine with commentary about Parisian landmarks.',
    location: 'Seine River, Paris',
    price: 15,
    rating: 4.3,
    reviews: 8920,
    image: '/api/placeholder/300/200',
    category: 'activity',
    duration: '1 hour',
    tags: ['Scenic', 'Relaxing', 'Sightseeing']
  },
  {
    id: '5',
    title: 'Louvre Museum',
    description: 'World\'s largest art museum housing thousands of works including the Mona Lisa.',
    location: '1st Arrondissement, Paris',
    price: 17,
    rating: 4.7,
    reviews: 89340,
    image: '/api/placeholder/300/200',
    category: 'attraction',
    duration: '3-4 hours',
    openHours: '9:00 AM - 6:00 PM',
    tags: ['Art', 'Museum', 'Culture']
  },
  {
    id: '6',
    title: 'L\'Ami Jean',
    description: 'Lively bistro known for its Basque-influenced cuisine and warm atmosphere.',
    location: '7th Arrondissement, Paris',
    price: 55,
    rating: 4.5,
    reviews: 3240,
    image: '/api/placeholder/300/200',
    category: 'restaurant',
    openHours: '12:00 PM - 2:00 PM, 7:00 PM - 12:00 AM',
    tags: ['Basque', 'Lively', 'Wine']
  }
]

/**
 * Search Results Page Component
 * Displays search results with grid/list view options and filtering capabilities
 */
export default function SearchResultsPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [filteredResults, setFilteredResults] = useState<SearchResult[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 500])
  const [sortBy, setSortBy] = useState<'relevance' | 'price' | 'rating'>('relevance')
  const [showFilters, setShowFilters] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<AppError | null>(null)
  const [retryCount, setRetryCount] = useState(0)

  /**
   * Simulate API call to fetch search results
   */
  const fetchSearchResults = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Simulate occasional API failures for demonstration
      if (Math.random() < 0.1 && retryCount === 0) {
        throw new Error('Network error occurred')
      }
      
      // Filter and sort results based on current filters
      let results = [...mockResults]

      // Filter by search query
      if (searchQuery) {
        results = results.filter(result => 
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
        )
      }

      // Filter by category
      if (selectedCategory !== 'all') {
        results = results.filter(result => result.category === selectedCategory)
      }

      // Filter by price range
      results = results.filter(result => 
        result.price >= priceRange[0] && result.price <= priceRange[1]
      )

      // Sort results
      switch (sortBy) {
        case 'price':
          results.sort((a, b) => a.price - b.price)
          break
        case 'rating':
          results.sort((a, b) => b.rating - a.rating)
          break
        default:
          // Keep original order for relevance
          break
      }

      setFilteredResults(results)
      setRetryCount(0)
    } catch (err) {
      const appError: AppError = {
         type: ErrorType.NETWORK_ERROR,
         message: err instanceof Error ? err.message : 'Unknown error occurred',
         userMessage: 'Failed to load search results. Please try again.',
         statusCode: 0,
         retryable: true,
         details: { searchQuery, selectedCategory, priceRange, sortBy }
       }
      setError(appError)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSearchResults()
  }, [searchQuery, selectedCategory, priceRange, sortBy])

  /**
   * Handle retry for failed requests
   */
  const handleRetry = () => {
    setRetryCount(prev => prev + 1)
    fetchSearchResults()
  }

  /**
   * Handle new search
   */
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    setRetryCount(0)
    // Update URL params
    const params = new URLSearchParams(searchParams.toString())
    if (query) {
      params.set('q', query)
    } else {
      params.delete('q')
    }
    router.push(`/trip-planner/search?${params.toString()}`)
  }

  /**
   * Handle city selection from autocomplete
   */
  const handleCitySelect = (city: PlaceSuggestion) => {
    handleSearch(city.mainText)
  }

  /**
   * Get category badge styling
   */
  const getCategoryBadge = (category: SearchResult['category']) => {
    const styles = {
      hotel: 'bg-blue-100 text-blue-800',
      restaurant: 'bg-orange-100 text-orange-800',
      attraction: 'bg-purple-100 text-purple-800',
      activity: 'bg-green-100 text-green-800'
    }
    return styles[category] || 'bg-gray-100 text-gray-800'
  }

  /**
   * Render star rating
   */
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
        <span className="text-sm text-gray-600 ml-1">{rating}</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-white/20 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto p-6">
          <div className="flex flex-col gap-4">
            {/* Back button and title */}
            <div className="flex items-center gap-4">
              <Link href="/trip-planner">
                <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Trip Planner
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Search Results
                  {searchQuery && (
                    <span className="text-gray-600 font-normal ml-2">
                      for "{searchQuery}"
                    </span>
                  )}
                </h1>
                <p className="text-gray-600">
                  {filteredResults.length} results found
                </p>
              </div>
            </div>

            {/* Search bar */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <CityAutocomplete
                placeholder="Search destinations, hotels, restaurants..."
                size="default"
                showSearchButton={true}
                value={searchQuery}
                onChange={setSearchQuery}
                onSearch={handleSearch}
                onCitySelect={handleCitySelect}
                className="max-w-md w-full sm:w-auto"
              />
              
              <div className="flex items-center gap-2">
                {/* View mode toggle */}
                <div className="flex items-center bg-white rounded-lg border border-gray-200 p-1">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8 p-0"
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8 p-0"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                {/* Filters toggle */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 border border-gray-200 bg-white hover:bg-gray-50"
                >
                  <SlidersHorizontal className="h-4 w-4" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Filters panel */}
            {showFilters && (
              <Card className="bg-white/90 backdrop-blur-sm">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Category filter */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Category
                      </label>
                      <select
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="w-full p-2 border border-gray-200 rounded-md text-sm"
                      >
                        <option value="all">All Categories</option>
                        <option value="hotel">Hotels</option>
                        <option value="restaurant">Restaurants</option>
                        <option value="attraction">Attractions</option>
                        <option value="activity">Activities</option>
                      </select>
                    </div>

                    {/* Price range */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Price Range
                      </label>
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          placeholder="Min"
                          value={priceRange[0]}
                          onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                          className="text-sm"
                        />
                        <span className="text-gray-500">-</span>
                        <Input
                          type="number"
                          placeholder="Max"
                          value={priceRange[1]}
                          onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 500])}
                          className="text-sm"
                        />
                      </div>
                    </div>

                    {/* Sort by */}
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Sort By
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as 'relevance' | 'price' | 'rating')}
                        className="w-full p-2 border border-gray-200 rounded-md text-sm"
                      >
                        <option value="relevance">Relevance</option>
                        <option value="price">Price (Low to High)</option>
                        <option value="rating">Rating (High to Low)</option>
                      </select>
                    </div>

                    {/* Clear filters */}
                    <div className="flex items-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedCategory('all')
                          setPriceRange([0, 500])
                          setSortBy('relevance')
                        }}
                        className="w-full border border-gray-200 bg-white hover:bg-gray-50"
                      >
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-7xl mx-auto p-6">
        {/* Loading State */}
        {isLoading && (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}>
            {Array.from({ length: 6 }).map((_, index) => (
              <LoadingCard 
                key={index} 
                className={viewMode === 'list' ? 'flex flex-row' : ''}
                message="Loading results..."
              />
            ))}
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto backdrop-blur-sm bg-white/90 rounded-2xl border border-white/20 shadow-lg p-8">
              <div className="bg-red-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-medium text-gray-900 mb-2">
                Failed to load results
              </h3>
              <p className="text-gray-600 mb-6">
                {getUserFriendlyMessage(error)}
              </p>
              <div className="space-y-3">
                {error.retryable && (
                  <Button 
                    onClick={handleRetry}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Try Again
                  </Button>
                )}
                <Button 
                  onClick={() => {
                    setSearchQuery('')
                    setSelectedCategory('all')
                    setPriceRange([0, 500])
                    setSortBy('relevance')
                    setError(null)
                  }}
                  variant="ghost"
                  className="w-full border border-gray-200 bg-white hover:bg-gray-50"
                >
                  Clear All Filters
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* No Results State */}
        {!isLoading && !error && filteredResults.length === 0 && (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto backdrop-blur-sm bg-white/10 rounded-2xl border border-white/20 shadow-lg p-8">
              <div className="bg-white/20 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <Search className="h-8 w-8 text-white" />
              </div>
              <h3 className="text-xl font-medium text-white mb-2">
                No results found
              </h3>
              <p className="text-white/80 mb-6">
                Try adjusting your search terms or filters.
              </p>
              <Button 
                onClick={() => {
                  setSearchQuery('')
                  setSelectedCategory('all')
                  setPriceRange([0, 500])
                  setSortBy('relevance')
                }}
                variant="ghost"
                className="bg-white/10 hover:bg-white/20 text-white border border-white/20 hover:border-white/40 rounded-full"
              >
                Clear All Filters
              </Button>
            </div>
          </div>
        )}

        {/* Results Grid/List */}
        {!isLoading && !error && filteredResults.length > 0 && (
          <div className={`${
            viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
              : 'space-y-4'
          }`}>
            {filteredResults.map((result) => (
              <Card 
                key={result.id} 
                className={`group hover:shadow-lg transition-all duration-200 bg-white/90 backdrop-blur-sm border-white/20 overflow-hidden ${
                  viewMode === 'list' ? 'flex flex-row' : ''
                }`}
              >
                {/* Image */}
                <div className={`${
                  viewMode === 'list' ? 'w-48 flex-shrink-0' : 'h-48'
                } bg-gradient-to-r from-indigo-500 to-purple-600 relative`}>
                  <div className="absolute inset-0 bg-black bg-opacity-20"></div>
                  <div className="absolute top-4 left-4">
                    <Badge className={getCategoryBadge(result.category)}>
                      {result.category.charAt(0).toUpperCase() + result.category.slice(1)}
                    </Badge>
                  </div>
                  <div className="absolute top-4 right-4 flex gap-2">
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white">
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" className="h-8 w-8 p-0 bg-white/20 hover:bg-white/30 text-white">
                      <Share2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className={`${
                  viewMode === 'list' ? 'flex-1' : ''
                } p-6`}>
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                      {result.title}
                    </h3>
                    <div className="text-right">
                      <div className="text-lg font-bold text-gray-900">
                        ${result.price}
                      </div>
                      {result.category === 'hotel' && (
                        <div className="text-xs text-gray-500">per night</div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(result.rating)}
                    <span className="text-sm text-gray-500">({result.reviews.toLocaleString()} reviews)</span>
                  </div>

                  <div className="flex items-center gap-1 text-sm text-gray-600 mb-3">
                    <MapPin className="h-4 w-4" />
                    <span>{result.location}</span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                    {result.description}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {result.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center gap-4">
                      {result.duration && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4" />
                          <span>{result.duration}</span>
                        </div>
                      )}
                      {result.openHours && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>Open now</span>
                        </div>
                      )}
                    </div>
                    <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white">
                      View Details
                      <ExternalLink className="h-4 w-4 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}