"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import {
  MapPin,
  Search,
  Plus,
  Camera,
  Utensils,
  Car,
  Star,
  Heart,
  Share2,
  Calendar,
  Clock,
  Users,
  Trash2,
  GripVertical,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

// Sample places of interest data
const samplePlaces = [
  {
    id: "place-1",
    title: "Senso-ji Temple",
    type: "sightseeing",
    location: "Asakusa, Tokyo",
    rating: 4.8,
    price: "Free",
    duration: "2 hours",
    description: "Tokyo's oldest temple with traditional shopping street",
    image: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=400&h=300&fit=crop"
  },
  {
    id: "place-2",
    title: "Sushi Making Class",
    type: "food",
    location: "Shibuya, Tokyo",
    rating: 4.9,
    price: "$85",
    duration: "3 hours",
    description: "Learn authentic sushi making from master chef",
    image: "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=300&fit=crop"
  },
  {
    id: "place-3",
    title: "Tokyo Skytree",
    type: "sightseeing",
    location: "Sumida, Tokyo",
    rating: 4.7,
    price: "$25",
    duration: "1.5 hours",
    description: "Panoramic city views from 634m high",
    image: "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=400&h=300&fit=crop"
  },
  {
    id: "place-4",
    title: "Tsukiji Outer Market",
    type: "food",
    location: "Tsukiji, Tokyo",
    rating: 4.6,
    price: "$30",
    duration: "2 hours",
    description: "Fresh seafood and street food paradise",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=400&h=300&fit=crop"
  },
  {
    id: "place-5",
    title: "Meiji Shrine",
    type: "sightseeing",
    location: "Shibuya, Tokyo",
    rating: 4.5,
    price: "Free",
    duration: "1 hour",
    description: "Peaceful shrine in the heart of Tokyo",
    image: "https://images.unsplash.com/photo-1478436127897-769e1b3f0f36?w=400&h=300&fit=crop"
  },
  {
    id: "place-6",
    title: "Robot Restaurant",
    type: "entertainment",
    location: "Shinjuku, Tokyo",
    rating: 4.3,
    price: "$65",
    duration: "1.5 hours",
    description: "Unique robot show and dining experience",
    image: "https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=400&h=300&fit=crop"
  }
]

const getActivityIcon = (type: string) => {
  switch (type) {
    case "sightseeing":
      return <Camera className="h-4 w-4" />
    case "food":
      return <Utensils className="h-4 w-4" />
    case "entertainment":
      return <Star className="h-4 w-4" />
    case "transport":
      return <Car className="h-4 w-4" />
    default:
      return <MapPin className="h-4 w-4" />
  }
}

interface PlaceCard {
  id: string
  title: string
  type: string
  location: string
  rating: number
  price: string
  duration: string
  description: string
  image: string
}

export default function ItineraryPage() {
  const searchParams = useSearchParams()
  const destination = searchParams.get('destination') || 'Tokyo, Japan'
  
  const [searchQuery, setSearchQuery] = useState("")
  const [availablePlaces, setAvailablePlaces] = useState<PlaceCard[]>(samplePlaces)
  const [itineraryPlaces, setItineraryPlaces] = useState<PlaceCard[]>([])
  const [filteredPlaces, setFilteredPlaces] = useState<PlaceCard[]>(samplePlaces)

  // Filter places based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredPlaces(availablePlaces)
    } else {
      const filtered = availablePlaces.filter(place => 
        place.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.type.toLowerCase().includes(searchQuery.toLowerCase()) ||
        place.location.toLowerCase().includes(searchQuery.toLowerCase())
      )
      setFilteredPlaces(filtered)
    }
  }, [searchQuery, availablePlaces])

  // Handle adding place to itinerary
  const addToItinerary = (place: PlaceCard) => {
    if (!itineraryPlaces.find(p => p.id === place.id)) {
      setItineraryPlaces([...itineraryPlaces, place])
      setAvailablePlaces(availablePlaces.filter(p => p.id !== place.id))
    }
  }

  // Handle removing place from itinerary
  const removeFromItinerary = (place: PlaceCard) => {
    setItineraryPlaces(itineraryPlaces.filter(p => p.id !== place.id))
    setAvailablePlaces([...availablePlaces, place])
  }

  return (
    <main className="h-[100dvh] w-full bg-white">
      <div className="h-full flex flex-col p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 font-fredericka mb-2">
            Plan Your {destination} Trip
          </h1>
          <p className="text-xl text-gray-700 font-medium">
            Drag places to create your perfect itinerary
          </p>
        </div>

        {/* Modern Feature Card */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl p-8 text-white shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white mb-4">
                  Premium
                </div>
                <h2 className="text-3xl font-bold mb-3">
                  Welcome to TripMeOut AI Planner
                </h2>
                <p className="text-emerald-50 text-lg mb-6">
                  Unleash your creativity with our comprehensive suite of professional travel planning tools and resources.
                </p>
                <div className="flex gap-4">
                  <Button className="bg-white text-emerald-600 hover:bg-emerald-50 font-medium px-6 py-2 rounded-full">
                    Explore Plans
                  </Button>
                  <Button variant="ghost" className="border border-white/30 text-white hover:bg-white/10 font-medium px-6 py-2 rounded-full">
                    Take a Tour
                  </Button>
                </div>
              </div>
              <div className="hidden md:block ml-8">
                <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/30 rounded-full flex items-center justify-center">
                      <MapPin className="h-6 w-6 text-white" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="max-w-md mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search places, activities, restaurants..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 text-gray-900 placeholder:text-gray-500 rounded-full"
            />
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 min-h-0">
          {/* Available Places */}
          <div className="flex flex-col">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 font-fredericka">
              Places of Interest
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              <AnimatePresence>
                {filteredPlaces.map((place) => (
                  <motion.div
                    key={place.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                          onClick={() => addToItinerary(place)}>
                      <CardContent className="p-4">
                        <div className="flex gap-4">
                          <div className="w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                            <img 
                              src={place.image} 
                              alt={place.title}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between mb-2">
                              <h3 className="font-semibold text-gray-900 truncate">{place.title}</h3>
                              <Plus className="h-4 w-4 text-gray-400 flex-shrink-0 ml-2" />
                            </div>
                            <div className="flex items-center gap-2 mb-2">
                              <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200">
                                {getActivityIcon(place.type)}
                                <span className="ml-1 capitalize">{place.type}</span>
                              </Badge>
                              <div className="flex items-center text-gray-600 text-sm">
                                <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                                {place.rating}
                              </div>
                            </div>
                            <div className="flex items-center justify-between text-sm text-gray-500">
                              <div className="flex items-center">
                                <MapPin className="h-3 w-3 mr-1" />
                                {place.location}
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                {place.duration}
                                <span className="font-medium text-gray-900">{place.price}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Itinerary Builder */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900 font-fredericka">
                Your Itinerary
              </h2>
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{itineraryPlaces.length} places</span>
              </div>
            </div>
            
            <div className="flex-1 min-h-[400px]">
              {itineraryPlaces.length === 0 ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center p-8 bg-gray-50 rounded-2xl border border-gray-200 border-dashed">
                    <div className="bg-gray-200 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                      <Plus className="h-8 w-8 text-gray-600" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">
                      Start Building Your Itinerary
                    </h3>
                    <p className="text-gray-600">
                      Click on places from the left to add them to your trip
                    </p>
                  </div>
                </div>
              ) : (
                <Reorder.Group 
                  axis="y" 
                  values={itineraryPlaces} 
                  onReorder={setItineraryPlaces}
                  className="space-y-4 overflow-y-auto pr-2"
                >
                  <AnimatePresence>
                    {itineraryPlaces.map((place, index) => (
                      <Reorder.Item
                        key={place.id}
                        value={place}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        whileDrag={{ scale: 1.05, zIndex: 10 }}
                      >
                        <Card className="bg-white border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                          <CardContent className="p-4">
                            <div className="flex gap-4">
                              <div className="flex items-center">
                                <GripVertical className="h-4 w-4 text-gray-400 cursor-grab" />
                                <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center ml-2 mr-3">
                                  <span className="text-gray-700 font-medium text-sm">{index + 1}</span>
                                </div>
                              </div>
                              <div className="w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
                                <img 
                                  src={place.image} 
                                  alt={place.title}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-2">
                                  <h3 className="font-semibold text-gray-900 truncate">{place.title}</h3>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeFromItinerary(place)}
                                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 h-auto"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                                <div className="flex items-center gap-2 mb-1">
                                  <Badge variant="secondary" className="bg-gray-100 text-gray-700 border-gray-200 text-xs">
                                    {getActivityIcon(place.type)}
                                    <span className="ml-1 capitalize">{place.type}</span>
                                  </Badge>
                                </div>
                                <div className="flex items-center justify-between text-xs text-gray-500">
                                  <div className="flex items-center">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {place.duration}
                                  </div>
                                  <span className="font-medium text-gray-900">{place.price}</span>
                                </div>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      </Reorder.Item>
                    ))}
                  </AnimatePresence>
                </Reorder.Group>
              )}
            </div>

            {/* Action Buttons */}
            {itineraryPlaces.length > 0 && (
              <div className="flex gap-3 mt-6">
                <Button className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white transition-all duration-200 rounded-full">
                  <Heart className="h-4 w-4 mr-2" />
                  Save Trip
                </Button>
                <Button className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-200 transition-all duration-200 rounded-full">
                  <Share2 className="h-4 w-4 mr-2" />
                  Share
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}