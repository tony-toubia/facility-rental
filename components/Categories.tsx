'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { ChevronDown, ChevronRight, Dumbbell, Waves, Trophy, Users, Zap, Target, MapPin, Activity, Compass } from 'lucide-react'
import { FACILITY_CATEGORIES, PARENT_CATEGORIES } from '@/data/facility-categories'
import { supabase } from '@/lib/supabase'
import LoadingSpinner from './LoadingSpinner'

// Icon and color mapping for parent categories
const parentIconMap: Record<string, any> = {
  'court-sports': Trophy,
  'field-sports': Target,
  'track-field': Zap,
  'aquatic': Waves,
  'fitness': Dumbbell,
  'multi-purpose': Users,
  'outdoor': MapPin,
  'specialized': Activity
}

const parentColorMap: Record<string, string> = {
  'court-sports': 'bg-orange-600 group-hover:bg-orange-700',
  'field-sports': 'bg-green-600 group-hover:bg-green-700',
  'track-field': 'bg-yellow-600 group-hover:bg-yellow-700',
  'aquatic': 'bg-blue-600 group-hover:bg-blue-700',
  'fitness': 'bg-red-600 group-hover:bg-red-700',
  'multi-purpose': 'bg-purple-600 group-hover:bg-purple-700',
  'outdoor': 'bg-emerald-600 group-hover:bg-emerald-700',
  'specialized': 'bg-indigo-600 group-hover:bg-indigo-700'
}

export default function Categories() {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [parentCounts, setParentCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategoryCounts() {
      try {
        setLoading(true)
        
        // Get facility counts by category from category assignments
        const { data: assignments, error: assignmentError } = await supabase
          .from('facility_category_assignments')
          .select(`
            category_id,
            facility_facilities!inner (
              status
            )
          `)
          .eq('facility_facilities.status', 'active')
        
        if (assignmentError) {
          throw assignmentError
        }
        
        // Count facilities per category
        const counts: Record<string, number> = {}
        const parentCountsTemp: Record<string, number> = {}
        
        assignments?.forEach(assignment => {
          const categoryId = assignment.category_id
          counts[categoryId] = (counts[categoryId] || 0) + 1
          
          // Find parent category and add to parent count
          const category = FACILITY_CATEGORIES.find(cat => cat.id === categoryId)
          if (category?.parentCategory) {
            parentCountsTemp[category.parentCategory] = (parentCountsTemp[category.parentCategory] || 0) + 1
          }
        })
        
        setCategoryCounts(counts)
        setParentCounts(parentCountsTemp)
      } catch (err) {
        console.error('Error loading category counts:', err)
        setError('Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    loadCategoryCounts()
  }, [])

  const toggleCategory = (parentId: string) => {
    if (expandedCategories.includes(parentId)) {
      setExpandedCategories(expandedCategories.filter(id => id !== parentId))
    } else {
      setExpandedCategories([...expandedCategories, parentId])
    }
  }

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Find the perfect facility for your activity. From gyms to courts, we have spaces for every sport and occasion.
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
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Browse by Category
            </h2>
            <p className="text-red-600">{error}</p>
          </div>
        </div>
      </section>
    )
  }
  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Browse by Category
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Find the perfect facility for your activity. From gyms to courts, we have spaces for every sport and occasion.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {PARENT_CATEGORIES.map((parentCategory) => {
            const IconComponent = parentIconMap[parentCategory.id] || Activity
            const colorClass = parentColorMap[parentCategory.id] || 'bg-primary-600 group-hover:bg-primary-700'
            const isExpanded = expandedCategories.includes(parentCategory.id)
            const childCategories = FACILITY_CATEGORIES.filter(cat => cat.parentCategory === parentCategory.id)
            const totalCount = parentCounts[parentCategory.id] || 0
            
            return (
              <div key={parentCategory.id} className="card overflow-hidden">
                {/* Parent Category Header */}
                <button
                  onClick={() => toggleCategory(parentCategory.id)}
                  className="w-full p-6 text-left hover:bg-gray-50 transition-colors duration-200 group"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`${colorClass} p-3 rounded-lg transition-colors duration-200`}>
                        <IconComponent className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                          {parentCategory.name}
                        </h3>
                        <p className="text-primary-600 text-sm font-medium mt-1">
                          {totalCount} {totalCount === 1 ? 'facility' : 'facilities'} • {childCategories.length} types
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-gray-500">
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </span>
                      {isExpanded ? (
                        <ChevronDown className="w-5 h-5 text-gray-400" />
                      ) : (
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Child Categories */}
                {isExpanded && (
                  <div className="border-t border-gray-200 bg-gray-50">
                    <div className="p-4 space-y-2">
                      {childCategories.map((category) => {
                        const count = categoryCounts[category.id] || 0
                        
                        return (
                          <Link
                            key={category.id}
                            href={`/browse?categories=${category.id}`}
                            className="block p-3 rounded-lg hover:bg-white hover:shadow-sm transition-all duration-200 group"
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <h4 className="font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                                  {category.name}
                                </h4>
                                <p className="text-sm text-gray-600 mt-0.5">
                                  {category.description}
                                </p>
                              </div>
                              <div className="text-sm text-primary-600 font-medium">
                                {count}
                              </div>
                            </div>
                          </Link>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
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