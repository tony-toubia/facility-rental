'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Search, Filter, MapPin, Star, DollarSign, Grid, List } from 'lucide-react'

// Mock data for facilities
const facilities = [
  {
    id: 1,
    name: 'Elite Fitness Center',
    type: 'Gym & Fitness',
    location: 'Downtown, New York',
    rating: 4.8,
    reviewCount: 124,
    price: 25,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=300&fit=crop',
    features: ['Full Equipment', 'Personal Training', 'Locker Rooms'],
    availability: 'Available Today'
  },
  {
    id: 2,
    name: 'Aqua Sports Complex',
    type: 'Swimming Pool',
    location: 'Westside, Los Angeles',
    rating: 4.9,
    reviewCount: 89,
    price: 40,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=500&h=300&fit=crop',
    features: ['Olympic Size', 'Heated Pool', 'Diving Board'],
    availability: 'Available Tomorrow'
  },
  {
    id: 3,
    name: 'Championship Courts',
    type: 'Basketball Court',
    location: 'Midtown, Chicago',
    rating: 4.7,
    reviewCount: 156,
    price: 35,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=500&h=300&fit=crop',
    features: ['Professional Court', 'Sound System', 'Scoreboard'],
    availability: 'Available Now'
  },
  {
    id: 4,
    name: 'Zen Yoga Studio',
    type: 'Yoga Studio',
    location: 'Brooklyn, New York',
    rating: 4.9,
    reviewCount: 67,
    price: 20,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?w=500&h=300&fit=crop',
    features: ['Peaceful Environment', 'Props Included', 'Natural Light'],
    availability: 'Available Today'
  },
  {
    id: 5,
    name: 'Metro Tennis Club',
    type: 'Tennis Court',
    location: 'Upper East Side, New York',
    rating: 4.6,
    reviewCount: 93,
    price: 45,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=500&h=300&fit=crop',
    features: ['Clay Courts', 'Equipment Rental', 'Lighting'],
    availability: 'Available Today'
  },
  {
    id: 6,
    name: 'PowerLift Gym',
    type: 'Gym & Fitness',
    location: 'South Beach, Miami',
    rating: 4.5,
    reviewCount: 201,
    price: 30,
    priceUnit: 'hour',
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=300&fit=crop',
    features: ['Heavy Weights', '24/7 Access', 'Sauna'],
    availability: 'Available Now'
  }
]

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
              {filteredFacilities.map((facility) => (
                <Link
                  key={facility.id}
                  href={`/facility/${facility.id}`}
                  className={`card overflow-hidden hover:shadow-lg transition-shadow duration-200 group ${
                    viewMode === 'list' ? 'flex' : ''
                  }`}
                >
                  <div className={`relative ${viewMode === 'list' ? 'w-48 h-32' : 'h-48'}`}>
                    <Image
                      src={facility.image}
                      alt={facility.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-200"
                    />
                    <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-medium text-green-600">
                      {facility.availability}
                    </div>
                  </div>

                  <div className="p-4 flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-primary-600 font-medium">{facility.type}</span>
                      <div className="flex items-center space-x-1">
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                        <span className="text-sm font-medium">{facility.rating}</span>
                        <span className="text-sm text-gray-500">({facility.reviewCount})</span>
                      </div>
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {facility.name}
                    </h3>

                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin className="w-4 h-4 mr-1" />
                      {facility.location}
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      {facility.features.map((feature, index) => (
                        <span
                          key={index}
                          className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-gray-900">
                        <DollarSign className="w-4 h-4" />
                        <span className="font-semibold">{facility.price}</span>
                        <span className="text-sm text-gray-600">/{facility.priceUnit}</span>
                      </div>
                      <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
                        View Details →
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {filteredFacilities.length === 0 && (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No facilities found matching your criteria.</p>
                <p className="text-gray-400 mt-2">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}