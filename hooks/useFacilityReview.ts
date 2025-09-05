import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface FacilityReview {
  id: string
  facility_id: string
  status: 'pending' | 'approved' | 'needs_changes'
  basic_info_status: 'pending' | 'approved' | 'needs_changes'
  basic_info_comments: string
  description_status: 'pending' | 'approved' | 'needs_changes'
  description_comments: string
  location_status: 'pending' | 'approved' | 'needs_changes'
  location_comments: string
  pricing_status: 'pending' | 'approved' | 'needs_changes'
  pricing_comments: string
  amenities_status: 'pending' | 'approved' | 'needs_changes'
  amenities_comments: string
  features_status: 'pending' | 'approved' | 'needs_changes'
  features_comments: string
  images_status: 'pending' | 'approved' | 'needs_changes'
  images_comments: string
  policies_status: 'pending' | 'approved' | 'needs_changes'
  policies_comments: string
  general_comments: string
  created_at: string
  updated_at: string
}

export function useFacilityReview(facilityId: string | null) {
  const [review, setReview] = useState<FacilityReview | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const loadReview = async () => {
    if (!facilityId) return

    setLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase
        .from('facility_reviews')
        .select('*')
        .eq('facility_id', facilityId)
        .order('updated_at', { ascending: false })
        .limit(1)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        throw error
      }

      setReview(data)
    } catch (err: any) {
      setError(err.message)
      console.error('Error loading review:', err)
    } finally {
      setLoading(false)
    }
  }

  const resubmitForReview = async () => {
    if (!facilityId) return false

    try {
      const { data, error } = await supabase.rpc('resubmit_facility_for_review', {
        facility_id_param: facilityId
      })

      if (error) throw error

      if (data) {
        // Reload the review data
        await loadReview()
        return true
      }

      return false
    } catch (err: any) {
      setError(err.message)
      return false
    }
  }

  const hasChangesRequested = () => {
    if (!review) return false
    return review.status === 'needs_changes'
  }

  const getChangesCount = () => {
    if (!review) return 0
    
    let count = 0
    const sections = [
      'basic_info_comments',
      'description_comments', 
      'location_comments',
      'pricing_comments',
      'amenities_comments',
      'features_comments',
      'images_comments',
      'policies_comments'
    ]

    sections.forEach(section => {
      if (review[section as keyof FacilityReview]) count++
    })

    if (review.general_comments) count++

    return count
  }

  useEffect(() => {
    loadReview()
  }, [facilityId])

  return {
    review,
    loading,
    error,
    loadReview,
    resubmitForReview,
    hasChangesRequested,
    getChangesCount
  }
}