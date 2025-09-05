'use client'

import { useState, useCallback, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Search, MapPin, Calendar, Navigation } from 'lucide-react'
import LocationAutocompleteNew from './LocationAutocompleteNew'
import { LocationData, getBrowserLocation } from '@/lib/geolocation-new'

export default function Hero() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  const [date, setDate] = useState('')
  const [isLoadingLocation, setIsLoadingLocation] = useState(false)
  const [hasRequestedLocation, setHasRequestedLocation] = useState(false)

  const handleLocationSelect = useCallback((location: LocationData) => {
    setSelectedLocation(location)
  }, [])

  const handleLocationClear = useCallback(() => {
    setSelectedLocation(null)
  }, [])

  // Request location permission on component mount
  useEffect(() => {
    const requestLocationPermission = async () => {
      // Check if we've already requested location or if user has already set a location
      if (hasRequestedLocation || selectedLocation) return

      // Check if geolocation is supported
      if (!navigator.geolocation) return

      try {
        setHasRequestedLocation(true)
        setIsLoadingLocation(true)
        
        console.log('Requesting location permission on home page...')
        const location = await getBrowserLocation()
        
        if (location) {
          console.log('Location obtained:', location)
          setSelectedLocation(location)
        } else {
          console.log('Location permission denied or failed')
        }
      } catch (error) {
        console.log('Error requesting location:', error)
      } finally {
        setIsLoadingLocation(false)
      }
    }

    // Small delay to avoid requesting permission immediately on page load
    const timer = setTimeout(requestLocationPermission, 1000)
    return () => clearTimeout(timer)
  }, [hasRequestedLocation, selectedLocation])

  const formatLocationDisplay = (location: LocationData) => {
    if (location.city && location.state) {
      return `${location.city}, ${location.state}`
    } else if (location.state) {
      return location.state
    } else {
      return location.address
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Build URL parameters for the browse page
    const params = new URLSearchParams()
    
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim())
    }
    
    if (selectedLocation) {
      params.set('location', JSON.stringify({
        address: selectedLocation.address,
        city: selectedLocation.city,
        state: selectedLocation.state,
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude
      }))
    }
    
    if (date) {
      params.set('date', date)
    }
    
    // Navigate to browse page with search parameters
    const url = `/browse${params.toString() ? `?${params.toString()}` : ''}`
    router.push(url)
  }

  return (
    <section className="relative bg-gradient-to-br from-primary-600 to-primary-800 text-white">
      <div className="absolute inset-0 bg-black opacity-20"></div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Find & Rent the Perfect
            <span className="block text-yellow-300">Sports Facility</span>
          </h1>
          <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto">
            Discover gyms, pools, courts, and recreational spaces available for rent in your area. 
            Book instantly and play today.
          </p>
        </div>

        {/* Search Form */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSearch} className="bg-white rounded-lg shadow-xl p-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* What */}
              <div className="md:col-span-2">
                <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
                  What are you looking for?
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Basketball court, swimming pool, gym..."
                    className="input-field pl-10 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Where */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Where?
                </label>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <LocationAutocompleteNew
                      onLocationSelect={handleLocationSelect}
                      onClear={handleLocationClear}
                      placeholder={isLoadingLocation ? "Getting your location..." : "City, ZIP code"}
                      value={selectedLocation ? formatLocationDisplay(selectedLocation) : ''}
                      showClearButton={!!selectedLocation}
                      className="w-full"
                      disabled={isLoadingLocation}
                    />
                  </div>
                  <button
                    type="button"
                    onClick={async () => {
                      setIsLoadingLocation(true)
                      try {
                        const location = await getBrowserLocation()
                        if (location) {
                          setSelectedLocation(location)
                        }
                      } catch (error) {
                        console.log('Error getting location:', error)
                      } finally {
                        setIsLoadingLocation(false)
                      }
                    }}
                    disabled={isLoadingLocation}
                    className="px-3 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[44px]"
                    title="Use my current location"
                  >
                    {isLoadingLocation ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Navigation className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* When */}
              <div>
                <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                  When?
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="date"
                    id="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="input-field pl-10 text-gray-900"
                  />
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <button type="submit" className="btn-primary text-lg px-8 py-3">
                Search Facilities
              </button>
            </div>
          </form>
        </div>

        {/* Stats */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-3xl font-bold text-yellow-300">290+</div>
            <div className="text-blue-100">Facilities Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-300">50+</div>
            <div className="text-blue-100">Midwest Cities</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-300">25+</div>
            <div className="text-blue-100">Facility Types</div>
          </div>
        </div>
      </div>
    </section>
  )
}