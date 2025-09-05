'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Clock, Calendar, MapPin, DollarSign, Users, Image as ImageIcon, FileText, Settings } from 'lucide-react'

interface ChangeTrackerProps {
  facilityId: string
  previousReviewId?: string
}

interface FacilitySnapshot {
  id: string
  name: string
  description: string
  address: string
  city: string
  state: string
  zip_code: string
  price: number
  price_unit: string
  capacity: number
  cancellation_policy: string
  house_rules: string
  updated_at: string
  facility_amenities?: { amenity_name: string }[]
  facility_features?: { feature_name: string }[]
  facility_images?: { image_url: string, is_primary: boolean }[]
  facility_availability?: {
    day_of_week: number
    start_time: string
    end_time: string
    is_available: boolean
  }[]
}

interface Change {
  section: string
  field: string
  type: 'added' | 'removed' | 'modified'
  oldValue?: any
  newValue?: any
  icon: React.ReactNode
}

const ChangeTracker: React.FC<ChangeTrackerProps> = ({ facilityId, previousReviewId }) => {
  const [changes, setChanges] = useState<Change[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (previousReviewId) {
      detectChanges()
    } else {
      setLoading(false)
    }
  }, [facilityId, previousReviewId])

  const detectChanges = async () => {
    try {
      // Get the timestamp of the previous review
      const { data: previousReview } = await supabase
        .from('facility_reviews')
        .select('updated_at')
        .eq('id', previousReviewId)
        .single()

      if (!previousReview) {
        setLoading(false)
        return
      }

      // Get current facility data
      const { data: currentFacility } = await supabase
        .from('facility_facilities')
        .select(`
          *,
          facility_amenities(amenity_name),
          facility_features(feature_name),
          facility_images(image_url, is_primary),
          facility_availability(day_of_week, start_time, end_time, is_available)
        `)
        .eq('id', facilityId)
        .single()

      if (!currentFacility) {
        setLoading(false)
        return
      }

      // For now, we'll detect changes by comparing update timestamps
      // In a full implementation, you'd want to store facility snapshots
      const facilityUpdatedAt = new Date(currentFacility.updated_at)
      const reviewUpdatedAt = new Date(previousReview.updated_at)

      const detectedChanges: Change[] = []

      if (facilityUpdatedAt > reviewUpdatedAt) {
        // Since we don't have historical data, we'll show generic change indicators
        // In a production system, you'd want to implement proper change tracking
        
        detectedChanges.push({
          section: 'Facility Information',
          field: 'Updated',
          type: 'modified',
          newValue: 'Facility has been updated since last review',
          icon: <Settings className="w-4 h-4" />
        })

        // Check for recent image changes
        const recentImages = currentFacility.facility_images?.filter((img: any) => {
          // This is a simplified check - in production you'd track image timestamps
          return true
        })

        if (recentImages && recentImages.length > 0) {
          detectedChanges.push({
            section: 'Images',
            field: 'Images',
            type: 'modified',
            newValue: `${recentImages.length} image(s) may have been updated`,
            icon: <ImageIcon className="w-4 h-4" />
          })
        }

        // Check availability changes (simplified)
        if (currentFacility.facility_availability && currentFacility.facility_availability.length > 0) {
          detectedChanges.push({
            section: 'Availability',
            field: 'Schedule',
            type: 'modified',
            newValue: 'Availability schedule may have been updated',
            icon: <Calendar className="w-4 h-4" />
          })
        }
      }

      setChanges(detectedChanges)
    } catch (error) {
      console.error('Error detecting changes:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-blue-500 mr-2 animate-spin" />
          <span className="text-sm text-blue-700">Detecting changes...</span>
        </div>
      </div>
    )
  }

  if (changes.length === 0) {
    return (
      <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center">
          <Clock className="w-4 h-4 text-gray-500 mr-2" />
          <span className="text-sm text-gray-600">No changes detected since last review</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <h4 className="font-medium text-blue-900 mb-3 flex items-center">
        <Clock className="w-4 h-4 mr-2" />
        Changes Since Last Review
      </h4>
      <div className="space-y-2">
        {changes.map((change, index) => (
          <div key={index} className="flex items-start space-x-2 text-sm">
            <div className="text-blue-500 mt-0.5">
              {change.icon}
            </div>
            <div className="flex-1">
              <span className="font-medium text-blue-900">{change.section}:</span>
              <span className="text-blue-700 ml-1">{change.newValue}</span>
            </div>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              change.type === 'added' ? 'bg-green-100 text-green-800' :
              change.type === 'removed' ? 'bg-red-100 text-red-800' :
              'bg-blue-100 text-blue-800'
            }`}>
              {change.type}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-3 text-xs text-blue-600">
        💡 Tip: This shows potential changes since the last review. Review each section carefully to verify the updates.
      </div>
    </div>
  )
}

export default ChangeTracker