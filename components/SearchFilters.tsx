'use client'

import { useState } from 'react'
import { Filter, X } from 'lucide-react'

interface SearchFiltersProps {
  onFiltersChange: (filters: any) => void
  isOpen: boolean
  onToggle: () => void
}

const categories = ['All', 'Gym & Fitness', 'Swimming Pool', 'Basketball Court', 'Tennis Court', 'Yoga Studio']
const priceRanges = ['All', '$0-25', '$26-50', '$51-75', '$76+']
const amenities = ['Free WiFi', 'Parking', 'Air Conditioning', 'Locker Rooms', 'Equipment Rental']

export default function SearchFilters({ onFiltersChange, isOpen, onToggle }: SearchFiltersProps) {
  const [filters, setFilters] = useState({
    category: 'All',
    priceRange: 'All',
    amenities: [] as string[],
    rating: 0
  })

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value }
    setFilters(newFilters)
    onFiltersChange(newFilters)
  }

  const handleAmenityToggle = (amenity: string) => {
    const newAmenities = filters.amenities.includes(amenity)
      ? filters.amenities.filter(a => a !== amenity)
      : [...filters.amenities, amenity]
    
    handleFilterChange('amenities', newAmenities)
  }

  const clearFilters = () => {
    const defaultFilters = {
      category: 'All',
      priceRange: 'All',
      amenities: [],
      rating: 0
    }
    setFilters(defaultFilters)
    onFiltersChange(defaultFilters)
  }

  if (!isOpen) return null

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center">
          <Filter className="w-5 h-5 mr-2" />
          Filters
        </h3>
        <button
          onClick={onToggle}
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Category Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Category</h4>
        <div className="space-y-2">
          {categories.map(category => (
            <label key={category} className="flex items-center">
              <input
                type="radio"
                name="category"
                value={category}
                checked={filters.category === category}
                onChange={(e) => handleFilterChange('category', e.target.value)}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">{category}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Price Range</h4>
        <div className="space-y-2">
          {priceRanges.map(range => (
            <label key={range} className="flex items-center">
              <input
                type="radio"
                name="priceRange"
                value={range}
                checked={filters.priceRange === range}
                onChange={(e) => handleFilterChange('priceRange', e.target.value)}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">{range}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Amenities Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Amenities</h4>
        <div className="space-y-2">
          {amenities.map(amenity => (
            <label key={amenity} className="flex items-center">
              <input
                type="checkbox"
                checked={filters.amenities.includes(amenity)}
                onChange={() => handleAmenityToggle(amenity)}
                className="text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm text-gray-700">{amenity}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Rating Filter */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Minimum Rating</h4>
        <div className="flex space-x-2">
          {[1, 2, 3, 4, 5].map(rating => (
            <button
              key={rating}
              onClick={() => handleFilterChange('rating', rating)}
              className={`px-3 py-1 rounded-full text-sm border ${
                filters.rating === rating
                  ? 'bg-primary-600 text-white border-primary-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:border-primary-600'
              }`}
            >
              {rating}+ ⭐
            </button>
          ))}
        </div>
      </div>

      {/* Clear Filters */}
      <div className="pt-4 border-t">
        <button
          onClick={clearFilters}
          className="w-full text-center text-sm text-primary-600 hover:text-primary-700 font-medium"
        >
          Clear All Filters
        </button>
      </div>
    </div>
  )
}