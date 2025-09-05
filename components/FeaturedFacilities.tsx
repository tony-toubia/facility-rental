'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, MapPin, Clock, DollarSign } from 'lucide-react'
import { getFacilities } from '@/lib/database'
import { Facility } from '@/types'
import LoadingSpinner from './LoadingSpinner'

export default function FeaturedFacilities() {
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadFeaturedFacilities() {
      try {
        setLoading(true)
        const data = await getFacilities({ 
          // featured: true, // Temporarily show all facilities
          limit: 8 // Show more for debugging
          // No status filter - will show all facilities
        })
        setFacilities(data)
      } catch (err) {
        console.error('Error loading featured facilities:', err)
        setError('Failed to load featured facilities')
      } finally {
        setLoading(false)
      }
    }

    loadFeaturedFacilities()
  }, [])

  if (loading) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Facilities
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Discover top-rated facilities in your area. These venues are loved by our community for their quality and service.
            </p>
          </div>
          <div className="flex justify-center">
            <LoadingSpinner />
          </div>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Facilities
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }

  if (facilities.length === 0) {
    return (
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Featured Facilities
            </h2>
            <p className="text-gray-600">No featured facilities available at the moment.</p>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Featured Facilities
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover top-rated facilities in your area. These venues are loved by our community for their quality and service.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {facilities.map((facility) => {
            const primaryImage = facility.images?.find(img => img.is_primary) || facility.images?.[0]
            const imageUrl = primaryImage?.image_url || 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&h=300&fit=crop'
            const location = `${facility.city}, ${facility.state}`
            const features = facility.features?.slice(0, 3).map(f => f.name) || []
            
            return (
              <Link
                key={facility.id}
                href={`/facility/${facility.id}`}
                className="card overflow-hidden hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="relative h-48">
                  <Image
                    src={imageUrl}
                    alt={facility.name}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-200"
                  />
                  <div className="absolute top-3 right-3 bg-white px-2 py-1 rounded-full text-xs font-medium">
                    <span className={`${
                      facility.status === 'active' ? 'text-green-600' :
                      facility.status === 'pending_approval' ? 'text-yellow-600' :
                      facility.status === 'suspended' ? 'text-red-600' :
                      facility.status === 'inactive' ? 'text-gray-600' :
                      'text-blue-600'
                    }`}>
                      {facility.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-primary-600 font-medium">{facility.type}</span>
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      <span className="text-sm font-medium">{facility.rating?.toFixed(1) || '0.0'}</span>
                      <span className="text-sm text-gray-500">({facility.review_count || 0})</span>
                    </div>
                  </div>

                  <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                    {facility.name}
                  </h3>

                  <div className="flex items-center text-gray-600 text-sm mb-3">
                    <MapPin className="w-4 h-4 mr-1" />
                    {location}
                  </div>

                  <div className="flex flex-wrap gap-1 mb-3">
                    {features.map((feature, index) => (
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
                      <span className="text-sm text-gray-600">/{facility.price_unit}</span>
                    </div>
                    <button className="text-primary-600 text-sm font-medium hover:text-primary-700">
                      View Details →
                    </button>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        <div className="text-center mt-12">
          <Link href="/browse" className="btn-primary text-lg px-8 py-3">
            View All Facilities
          </Link>
        </div>
      </div>
    </section>
  )
}