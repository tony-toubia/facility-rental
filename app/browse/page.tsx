'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Filter, MapPin, Star, DollarSign, Grid, List, Navigation, Clock, Calendar } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/lib/auth'
import { getFacilitiesWithinRadius, getBrowserLocation, geocodeAddress, LocationData } from '@/lib/geolocation-new'
import LocationAutocompleteNew from '@/components/LocationAutocompleteNew'
import CategoryCheckboxList from '@/components/CategoryCheckboxList'
import { FACILITY_CATEGORIES } from '@/data/facility-categories'
import { getFacilityCategories } from '@/lib/database'

interface Facility {
  id: string
  name: string
  type: string
  description: string
  address: string
  city: string
  state: string
  latitude?: number
  longitude?: number
  price: number
  price_unit: string
  capacity: number
  availability_increment?: number
  minimum_rental_duration?: number
  rating: number | null
  review_count: number | null
  status: string
  created_at: string
  owner_id: string
  distance?: number // Distance in miles from search location
  categories?: string[] // Array of category names
  primary_category?: string // Primary category name
  facility_users?: {
    first_name: string
    last_name: string
    email: string
  }
  facility_images?: {
    image_url: string
    is_primary: boolean
  }[]
  facility_amenities?: {
    name: string
    icon_name: string | null
  }[]
  facility_features?: {
    name: string
  }[]
  facility_categories?: {
    name: string
  }[]
}



const categories = ['All', 'Gym & Fitness', 'Swimming Pool', 'Basketball Court', 'Tennis Court', 'Yoga Studio']
const priceRanges = ['All', '$0-25', '$26-50', '$51-75', '$76+']
const minDurationOptions = ['All', '30 min', '1 hour', '2 hours', '3+ hours']
const incrementOptions = ['All', '15 min', '30 min', '1 hour']
const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Distance']

export default function BrowsePage() {
  const { facilityUser } = useAuth()
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [selectedPriceRange, setSelectedPriceRange] = useState('All')
  const [selectedMinDuration, setSelectedMinDuration] = useState('All')
  const [selectedIncrement, setSelectedIncrement] = useState('All')
  const [sortBy, setSortBy] = useState('Distance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userLocation, setUserLocation] = useState<LocationData | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [radiusMiles, setRadiusMiles] = useState(25)


  const handleLocationSelect = useCallback((location: LocationData) => {
    console.log('Location selected:', location)
    setUserLocation(location)
    setLocationLoading(false)
  }, [])

  const handleLocationClear = useCallback(() => {
    setUserLocation(null)
  }, [])

  const loadUserLocationFromBrowser = useCallback(async () => {
    try {
      setLocationLoading(true)
      const location = await getBrowserLocation()
      if (location) {
        setUserLocation(location)
      }
    } catch (error) {
      console.error('Error loading browser location:', error)
    } finally {
      setLocationLoading(false)
    }
  }, [])

  const loadFacilities = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      console.log('Loading facilities with user location:', userLocation)
      
      if (userLocation && userLocation.latitude && userLocation.longitude) {
        // Use PostGIS-powered radius search
        console.log('Using PostGIS radius search:', {
          lat: userLocation.latitude,
          lng: userLocation.longitude,
          radius: radiusMiles
        })
        
        // Use new Places API version
        const { data, error } = await getFacilitiesWithinRadius(
          userLocation.latitude,
          userLocation.longitude,
          radiusMiles
        )
        
        if (error) {
          console.error('Error loading facilities with radius:', error)
          console.log('Falling back to loading all facilities...')

          // Fallback to loading all facilities if PostGIS fails
          const { data: fallbackData, error: fallbackError } = await supabase
            .from('facility_facilities')
            .select(`
              *,
              facility_users:owner_id (
                first_name,
                last_name,
                email
              ),
              facility_images (
                image_url,
                is_primary
              ),
              facility_amenities (
                name,
                icon_name
              ),
              facility_features (
                name
              )
            `)
            // Temporarily show all facilities to debug
            // .eq('status', 'active')
            // .eq('is_active', true)
            .order('created_at', { ascending: false })

          if (fallbackError) {
            setError(`Failed to load facilities: ${fallbackError.message}`)
          } else {
            console.log('Loaded all facilities as fallback:', fallbackData?.length)
            // Load categories for each facility
            if (fallbackData && fallbackData.length > 0) {
              const facilitiesWithCategories = await Promise.all(
                fallbackData.map(async (facility) => {
                  try {
                    const categories = await getFacilityCategories(facility.id)
                    return { ...facility, categories }
                  } catch (error) {
                    console.error(`Error loading categories for facility ${facility.id}:`, error)
                    return { ...facility, categories: [] }
                  }
                })
              )
              setFacilities(facilitiesWithCategories)
            } else {
              setFacilities(fallbackData || [])
            }
            if (fallbackData && fallbackData.length === 0) {
              setError('No facilities found. There may be no active facilities in the database yet.')
            }
          }
        } else {
          console.log('Loaded facilities with distance:', data?.length)
          // Load categories for each facility
          if (data && data.length > 0) {
            const facilitiesWithCategories = await Promise.all(
              data.map(async (facility: any) => {
                try {
                  const categories = await getFacilityCategories(facility.id)
                  return { ...facility, categories }
                } catch (error) {
                  console.error(`Error loading categories for facility ${facility.id}:`, error)
                  return { ...facility, categories: [] }
                }
              })
            )
            setFacilities(facilitiesWithCategories)
          } else {
            setFacilities(data || [])
          }
        }
      } else {
        // Fallback to loading all facilities
        console.log('No location available - loading all facilities')
        
        const { data, error } = await supabase
          .from('facility_facilities')
          .select(`
            *,
            facility_users:owner_id (
              first_name,
              last_name,
              email
            ),
            facility_images (
              image_url,
              is_primary
            ),
            facility_amenities (
              name,
              icon_name
            ),
            facility_features (
              name
            )
          `)
          .eq('status', 'approved')
          .eq('is_active', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error loading all facilities:', error)
          setError(`Failed to load facilities: ${error.message}`)
        } else {
          console.log('Loaded all facilities:', data?.length)
          setFacilities(data || [])
          if (data && data.length === 0) {
            setError('No facilities found. There may be no active facilities in the database yet.')
          }
        }
      }
    } catch (err) {
      console.error('Error:', err)
      setError(`Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }, [userLocation, radiusMiles])

  // Load facilities when component mounts or location changes
  useEffect(() => {
    loadFacilities()
  }, [loadFacilities])

  // Try to load user location from browser on mount
  useEffect(() => {
    if (!userLocation) {
      loadUserLocationFromBrowser()
    }
  }, [userLocation, loadUserLocationFromBrowser])


  // Handle URL parameters from home page search
  useEffect(() => {
    const search = searchParams.get('search')
    const locationParam = searchParams.get('location')
    const dateParam = searchParams.get('date')
    const categoriesParam = searchParams.get('categories')

    if (search) {
      setSearchQuery(search)
    }

    if (locationParam) {
      try {
        const locationData = JSON.parse(locationParam)
        setUserLocation(locationData)
      } catch (error) {
        console.error('Error parsing location parameter:', error)
      }
    }

    if (categoriesParam) {
      // Handle single category selection from homepage
      setSelectedCategories([categoriesParam])
    }

    // Note: date parameter could be used for future booking functionality
    if (dateParam) {
      console.log('Date parameter received:', dateParam)
    }
  }, [searchParams])

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return '<1 mi'
    }
    return `${Math.round(distance)} mi`
  }

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.type.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Legacy category filter (keep for backward compatibility)
    const matchesLegacyCategory = selectedCategory === 'All' || facility.type === selectedCategory
    
    // New category filter - check if facility has any of the selected categories
    const matchesNewCategories = selectedCategories.length === 0 || 
      (facility as any).categories?.some((cat: string) => 
        selectedCategories.some(selectedCat => 
          FACILITY_CATEGORIES.find(fc => fc.id === selectedCat)?.name === cat
        )
      )
    
    const matchesPriceRange = selectedPriceRange === 'All' || 
      (selectedPriceRange === '$0-25' && facility.price <= 25) ||
      (selectedPriceRange === '$26-50' && facility.price >= 26 && facility.price <= 50) ||
      (selectedPriceRange === '$51-75' && facility.price >= 51 && facility.price <= 75) ||
      (selectedPriceRange === '$76+' && facility.price >= 76)
    
    const matchesMinDuration = selectedMinDuration === 'All' || 
      (selectedMinDuration === '30 min' && (facility.minimum_rental_duration || 30) <= 30) ||
      (selectedMinDuration === '1 hour' && (facility.minimum_rental_duration || 60) <= 60) ||
      (selectedMinDuration === '2 hours' && (facility.minimum_rental_duration || 120) <= 120) ||
      (selectedMinDuration === '3+ hours' && (facility.minimum_rental_duration || 180) >= 180)
    
    const matchesIncrement = selectedIncrement === 'All' || 
      (selectedIncrement === '15 min' && (facility.availability_increment || 30) === 15) ||
      (selectedIncrement === '30 min' && (facility.availability_increment || 30) === 30) ||
      (selectedIncrement === '1 hour' && (facility.availability_increment || 30) === 60)
    
    return matchesSearch && matchesLegacyCategory && matchesNewCategories && matchesPriceRange && matchesMinDuration && matchesIncrement
  })

  // Sort the filtered facilities
  const sortedFacilities = [...filteredFacilities].sort((a, b) => {
    switch (sortBy) {
      case 'Price: Low to High':
        return a.price - b.price
      case 'Price: High to Low':
        return b.price - a.price
      case 'Rating':
        const aRating = a.rating || 0
        const bRating = b.rating || 0
        return bRating - aRating // Higher ratings first
      case 'Distance':
        if (userLocation && a.distance !== undefined && b.distance !== undefined) {
          return a.distance - b.distance // Closer facilities first
        }
        return 0
      case 'Relevance':
      default:
        // For relevance, prioritize exact name matches, then type matches
        const aNameMatch = a.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0
        const bNameMatch = b.name.toLowerCase().includes(searchQuery.toLowerCase()) ? 1 : 0
        if (aNameMatch !== bNameMatch) {
          return bNameMatch - aNameMatch
        }
        // Then sort by rating as secondary criteria
        const aRatingRel = a.rating || 0
        const bRatingRel = b.rating || 0
        return bRatingRel - aRatingRel
    }
  })



  const handleShowAll = () => {
    setUserLocation(null)
  }

  const formatLocationDisplay = (location: LocationData) => {
    if (location.city && location.state) {
      return `${location.city}, ${location.state}`
    } else if (location.state) {
      return location.state
    } else {
      return location.address
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Facilities</h1>
          
          {/* Location Display */}
          {userLocation && (
            <div className="mb-4 flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-600">
                <Navigation className="w-4 h-4 mr-2" />
                <span>
                  Showing facilities within <strong>{radiusMiles} miles</strong> of <strong>{formatLocationDisplay(userLocation)}</strong>
                </span>
              </div>
              <div className="flex items-center gap-3">
                <select
                  value={radiusMiles}
                  onChange={(e) => setRadiusMiles(Number(e.target.value))}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  <option value={5}>5 miles</option>
                  <option value={10}>10 miles</option>
                  <option value={25}>25 miles</option>
                  <option value={50}>50 miles</option>
                  <option value={100}>100 miles</option>
                </select>

                <button
                  onClick={handleShowAll}
                  className="text-sm text-primary-600 hover:text-primary-500 font-medium"
                >
                  Show All Facilities
                </button>
              </div>
            </div>
          )}
          
          {/* Search Bar */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex flex-col md:flex-row gap-4 flex-1">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search facilities..."
                  className="input-field pl-10"
                />
              </div>
              <div className="flex-1">
                <LocationAutocompleteNew
                  onLocationSelect={handleLocationSelect}
                  onClear={handleLocationClear}
                  placeholder="Search for a location..."
                  value={userLocation ? formatLocationDisplay(userLocation) : ''}
                  showClearButton={!!userLocation}
                  className="w-full"
                />
              </div>

            </div>
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="btn-secondary flex items-center space-x-2 md:w-auto"
            >
              <Filter className="w-4 h-4" />
              <span>Filters</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className={`lg:w-64 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              {/* Category Filter */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Categories</h3>
                <CategoryCheckboxList
                  selectedCategories={selectedCategories}
                  onCategoriesChange={setSelectedCategories}
                  allowMultiple={true}
                  maxSelections={3}
                  className="w-full"
                />
              </div>

              {/* Price Range Filter */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Price Range</h3>
                <div className="space-y-2">
                  {priceRanges.map(range => (
                    <label key={range} className="flex items-center">
                      <input
                        type="radio"
                        name="priceRange"
                        value={range}
                        checked={selectedPriceRange === range}
                        onChange={(e) => setSelectedPriceRange(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-700">{range}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Minimum Duration Filter */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Minimum Booking</h3>
                <div className="space-y-2">
                  {minDurationOptions.map(duration => (
                    <label key={duration} className="flex items-center">
                      <input
                        type="radio"
                        name="minDuration"
                        value={duration}
                        checked={selectedMinDuration === duration}
                        onChange={(e) => setSelectedMinDuration(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-700">{duration}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Time Increment Filter */}
              <div className="bg-white rounded-lg shadow-sm p-4">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Time Slots</h3>
                <div className="space-y-2">
                  {incrementOptions.map(increment => (
                    <label key={increment} className="flex items-center">
                      <input
                        type="radio"
                        name="increment"
                        value={increment}
                        checked={selectedIncrement === increment}
                        onChange={(e) => setSelectedIncrement(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-700">{increment}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <p className="text-gray-600 mb-4 sm:mb-0">
                {sortedFacilities.length} facilities found
              </p>
              
              <div className="flex items-center space-x-4">
                {/* Sort Dropdown */}
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="input-field w-auto"
                >
                  {sortOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>

                {/* View Mode Toggle */}
                <div className="flex border rounded-lg">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 ${viewMode === 'grid' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}
                  >
                    <Grid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 ${viewMode === 'list' ? 'bg-primary-600 text-white' : 'text-gray-600'}`}
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Results Grid/List */}
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6' 
              : 'space-y-4'
            }>
              {loading ? (
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading facilities...</p>
                </div>
              ) : error ? (
                <div className="text-center py-12">
                  <p className="text-red-500 text-lg">{error}</p>
                  <button 
                    onClick={loadFacilities}
                    className="mt-4 btn-primary"
                  >
                    Try Again
                  </button>
                </div>
              ) : sortedFacilities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No facilities found matching your criteria.</p>
                  <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                sortedFacilities.map((facility) => {
                  const primaryImage = facility.facility_images?.find(img => img.is_primary)?.image_url || 
                                     facility.facility_images?.[0]?.image_url ||
                                     'https://via.placeholder.com/500x300?text=No+Image'
                  
                  const location = `${facility.city}, ${facility.state}`
                  const features = facility.facility_features?.map(f => f.name) || []
                  const amenities = facility.facility_amenities?.map(a => a.name) || []

                  // Use loaded categories from database, fallback to facility.type
                  const categories = facility.categories || []
                  if (categories.length === 0 && facility.type) {
                    categories.push(facility.type)
                  }

                  const uniqueCategories = Array.from(new Set(categories))
                  const allFeatures = [...features, ...amenities].slice(0, 3) // Show max 3 features
                  
                  return (
                    <Link
                      key={facility.id}
                      href={`/facility/${facility.id}`}
                      className={`card overflow-hidden hover:shadow-lg transition-shadow duration-200 group ${
                        viewMode === 'list' ? 'flex' : ''
                      }`}
                    >
                      <div className={`relative ${viewMode === 'list' ? 'w-48 h-32' : 'h-48'}`}>
                        {primaryImage && primaryImage !== 'https://via.placeholder.com/500x300?text=No+Image' ? (
                          <Image
                            src={primaryImage}
                            alt={facility.name}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-200"
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <div className="text-gray-500 text-center">
                              <div className="text-2xl mb-2">🏢</div>
                              <div className="text-sm">No Image</div>
                            </div>
                          </div>
                        )}
                        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                          <span className={`${
                            facility.status === 'approved' || facility.status === 'active' ? 'text-green-600' :
                            facility.status === 'pending_approval' ? 'text-yellow-600' :
                            facility.status === 'suspended' ? 'text-red-600' :
                            facility.status === 'inactive' ? 'text-gray-600' :
                            'text-blue-600'
                          }`}>
                            {facility.status === 'approved' ? 'ACTIVE' : facility.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                      </div>

                      <div className="p-4 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          {/* Categories on the left */}
                          <div className="flex items-center space-x-2 flex-1 min-w-0">
                            {uniqueCategories.length > 0 && (
                              <div className="flex items-center space-x-1 flex-wrap gap-1">
                                {uniqueCategories.slice(0, 2).map((category, index) => (
                                  <span
                                    key={index}
                                    className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                                      index === 0
                                        ? 'bg-primary-100 text-primary-700 border border-primary-200 font-medium'
                                        : 'bg-blue-50 text-blue-600'
                                    }`}
                                  >
                                    {category}
                                  </span>
                                ))}
                                {uniqueCategories.length > 2 && (
                                  <button
                                    className="text-xs px-2 py-1 rounded-full whitespace-nowrap bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                                    title={`${uniqueCategories.length - 2} more categories`}
                                  >
                                    +{uniqueCategories.length - 2}
                                  </button>
                                )}
                              </div>
                            )}
                          </div>

                          {/* Star rating on the right */}
                          <div className="flex items-center space-x-1 flex-shrink-0">
                            {facility.rating ? (
                              <>
                                <Star className="w-4 h-4 text-yellow-400 fill-current" />
                                <span className="text-sm font-medium">{facility.rating}</span>
                                {facility.review_count && facility.review_count > 0 && (
                                  <span className="text-sm text-gray-500">({facility.review_count})</span>
                                )}
                              </>
                            ) : (
                              <span className="text-sm text-gray-500">-</span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {facility.name}
                        </h3>

                        <div className="flex items-center justify-between text-gray-600 text-sm mb-3">
                          <div className="flex items-center">
                            <MapPin className="w-4 h-4 mr-1" />
                            {location}
                          </div>
                          {facility.distance && (
                            <span className="text-primary-600 font-medium">
                              {formatDistance(facility.distance)}
                            </span>
                          )}
                        </div>


                        {allFeatures.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {allFeatures.map((feature, index) => (
                              <span
                                key={index}
                                className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                              >
                                {feature}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Booking Information */}
                        <div className="space-y-1 mb-3 text-xs text-gray-600">
                          {facility.minimum_rental_duration && (
                            <div className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              <span>Min: {facility.minimum_rental_duration < 60 ? `${facility.minimum_rental_duration}min` : `${facility.minimum_rental_duration / 60}hr`}</span>
                            </div>
                          )}
                          {facility.availability_increment && (
                            <div className="flex items-center">
                              <Calendar className="w-3 h-3 mr-1" />
                              <span>Slots: {facility.availability_increment < 60 ? `${facility.availability_increment}min` : `${facility.availability_increment / 60}hr`}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center text-gray-900">
                            <DollarSign className="w-4 h-4" />
                            <span className="font-semibold">{facility.price}</span>
                            <span className="text-sm text-gray-600">/{facility.price_unit}</span>
                          </div>
                          <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
                            View Details →
                          </button>
                        </div>
                      </div>
                    </Link>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}