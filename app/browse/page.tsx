'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Filter, MapPin, Star, DollarSign, Grid, List } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Facility {
  id: string
  name: string
  type: string
  description: string
  address: string
  city: string
  state: string
  price: number
  price_unit: string
  capacity: number
  rating: number | null
  review_count: number | null
  status: string
  created_at: string
  owner_id: string
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
}



const categories = ['All', 'Gym & Fitness', 'Swimming Pool', 'Basketball Court', 'Tennis Court', 'Yoga Studio']
const priceRanges = ['All', '$0-25', '$26-50', '$51-75', '$76+']
const sortOptions = ['Relevance', 'Price: Low to High', 'Price: High to Low', 'Rating', 'Distance']

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')
  const [selectedPriceRange, setSelectedPriceRange] = useState('All')
  const [sortBy, setSortBy] = useState('Relevance')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [showFilters, setShowFilters] = useState(false)
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch facilities from database
  useEffect(() => {
    loadFacilities()
  }, [])

  const loadFacilities = async () => {
    try {
      setLoading(true)
      setError(null)
      
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
        .eq('status', 'active')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading facilities:', error)
        setError(`Failed to load facilities: ${error.message}`)
      } else {
        console.log('Loaded facilities:', data)
        setFacilities(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
      setError(`Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         facility.type.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === 'All' || facility.type === selectedCategory
    const matchesPriceRange = selectedPriceRange === 'All' || 
      (selectedPriceRange === '$0-25' && facility.price <= 25) ||
      (selectedPriceRange === '$26-50' && facility.price >= 26 && facility.price <= 50) ||
      (selectedPriceRange === '$51-75' && facility.price >= 51 && facility.price <= 75) ||
      (selectedPriceRange === '$76+' && facility.price >= 76)
    
    return matchesSearch && matchesCategory && matchesPriceRange
  })

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Browse Facilities</h1>
          
          {/* Search Bar */}
          <div className="flex flex-col md:flex-row gap-4">
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
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Category</h3>
                <div className="space-y-2">
                  {categories.map(category => (
                    <label key={category} className="flex items-center">
                      <input
                        type="radio"
                        name="category"
                        value={category}
                        checked={selectedCategory === category}
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        className="text-primary-600 focus:ring-primary-500"
                      />
                      <span className="ml-2 text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
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
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {/* Results Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
              <p className="text-gray-600 mb-4 sm:mb-0">
                {filteredFacilities.length} facilities found
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
              ) : filteredFacilities.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500 text-lg">No facilities found matching your criteria.</p>
                  <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
                </div>
              ) : (
                filteredFacilities.map((facility) => {
                  const primaryImage = facility.facility_images?.find(img => img.is_primary)?.image_url || 
                                     facility.facility_images?.[0]?.image_url ||
                                     'https://via.placeholder.com/500x300?text=No+Image'
                  
                  const location = `${facility.city}, ${facility.state}`
                  const features = facility.facility_features?.map(f => f.name) || []
                  const amenities = facility.facility_amenities?.map(a => a.name) || []
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
                        <Image
                          src={primaryImage}
                          alt={facility.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-200"
                          onError={(e) => {
                            e.currentTarget.src = 'https://via.placeholder.com/500x300?text=No+Image'
                          }}
                        />
                        <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-medium text-green-600">
                          Available
                        </div>
                      </div>

                      <div className="p-4 flex-1">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-primary-600 font-medium">{facility.type}</span>
                          <div className="flex items-center space-x-1">
                            <Star className={`w-4 h-4 ${facility.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            <span className="text-sm font-medium">
                              {facility.rating || (
                                <span className="text-gray-500">(no reviews yet)</span>
                              )}
                            </span>
                            {facility.review_count && facility.review_count > 0 && (
                              <span className="text-sm text-gray-500">({facility.review_count})</span>
                            )}
                          </div>
                        </div>

                        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                          {facility.name}
                        </h3>

                        <div className="flex items-center text-gray-600 text-sm mb-3">
                          <MapPin className="w-4 h-4 mr-1" />
                          {location}
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