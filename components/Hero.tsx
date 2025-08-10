'use client'

import { useState } from 'react'
import { Search, MapPin, Calendar } from 'lucide-react'

export default function Hero() {
  const [searchQuery, setSearchQuery] = useState('')
  const [location, setLocation] = useState('')
  const [date, setDate] = useState('')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    // Handle search logic here
    console.log('Search:', { searchQuery, location, date })
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
                    className="input-field pl-10"
                  />
                </div>
              </div>

              {/* Where */}
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                  Where?
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="City, ZIP code"
                    className="input-field pl-10"
                  />
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
                    className="input-field pl-10"
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
            <div className="text-3xl font-bold text-yellow-300">1,000+</div>
            <div className="text-blue-100">Facilities Available</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-300">50+</div>
            <div className="text-blue-100">Cities Covered</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-yellow-300">10,000+</div>
            <div className="text-blue-100">Happy Customers</div>
          </div>
        </div>
      </div>
    </section>
  )
}