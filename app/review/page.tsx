'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Clock, MapPin, DollarSign, Users, Eye, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { getFacilitiesForReview } from '@/lib/database'
import { useAuth } from '@/lib/auth'
import type { Facility } from '@/types'

export default function ReviewPage() {
  const { facilityUser } = useAuth()
  const [facilities, setFacilities] = useState<Facility[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadFacilities()
  }, [])

  const loadFacilities = async () => {
    try {
      setLoading(true)
      const data = await getFacilitiesForReview()
      setFacilities(data)
    } catch (err) {
      console.error('Error loading facilities for review:', err)
      setError('Failed to load facilities for review')
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />
      case 'needs_changes':
        return <XCircle className="w-5 h-5 text-red-500" />
      case 'approved':
        return <CheckCircle className="w-5 h-5 text-green-500" />
      default:
        return <AlertCircle className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'Pending Review'
      case 'needs_changes':
        return 'Needs Changes'
      case 'approved':
        return 'Approved'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending_approval':
        return 'bg-yellow-100 text-yellow-800'
      case 'needs_changes':
        return 'bg-red-100 text-red-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading facilities for review...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Facility Review Dashboard</h1>
              <p className="mt-2 text-gray-600">Review and approve facility listings</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                {facilities.length} facilities pending review
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {facilities.length === 0 ? (
          <div className="text-center py-12">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">All caught up!</h3>
            <p className="text-gray-600">No facilities are currently pending review.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {facilities.map((facility) => (
              <div key={facility.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-3">
                        <h3 className="text-xl font-semibold text-gray-900">{facility.name}</h3>
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(facility.status)}`}>
                          {getStatusIcon(facility.status)}
                          <span className="ml-1">{getStatusText(facility.status)}</span>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        <div className="flex items-center text-sm text-gray-600">
                          <MapPin className="w-4 h-4 mr-2" />
                          {facility.city}, {facility.state}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <DollarSign className="w-4 h-4 mr-2" />
                          ${facility.price}/{facility.price_unit}
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Users className="w-4 h-4 mr-2" />
                          {facility.capacity} capacity
                        </div>
                        <div className="flex items-center text-sm text-gray-600">
                          <Clock className="w-4 h-4 mr-2" />
                          {new Date(facility.created_at || '').toLocaleDateString()}
                        </div>
                      </div>

                      {facility.description && (
                        <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                          {facility.description}
                        </p>
                      )}

                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-500">
                          Owner: {(facility as any).facility_users?.first_name} {(facility as any).facility_users?.last_name}
                        </div>
                        <div className="flex space-x-3">
                          <Link
                            href={`/facility/${facility.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                          >
                            <Eye className="w-4 h-4 mr-1" />
                            Preview
                          </Link>
                          <Link
                            href={`/review/${facility.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
                          >
                            Review
                          </Link>
                        </div>
                      </div>
                    </div>

                    {/* Facility Image */}
                    <div className="ml-6 flex-shrink-0">
                      {(facility as any).facility_images?.find((img: any) => img.is_primary) ? (
                        <Image
                          src={(facility as any).facility_images.find((img: any) => img.is_primary).image_url}
                          alt={facility.name}
                          width={120}
                          height={80}
                          className="rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-30 h-20 bg-gray-200 rounded-lg flex items-center justify-center">
                          <span className="text-gray-400 text-xs">No image</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}