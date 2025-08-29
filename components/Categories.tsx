'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Dumbbell, Waves, Trophy, Users, Zap, Target } from 'lucide-react'
import { getCategories, getFacilities } from '@/lib/database'
import { FacilityCategory } from '@/types'
import LoadingSpinner from './LoadingSpinner'

// Icon mapping for categories
const iconMap: Record<string, any> = {
  'Dumbbell': Dumbbell,
  'Waves': Waves,
  'Trophy': Trophy,
  'Target': Target,
  'Zap': Zap,
  'Users': Users
}

export default function Categories() {
  const [categories, setCategories] = useState<FacilityCategory[]>([])
  const [categoryCounts, setCategoryCounts] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoading(true)
        const [categoriesData, facilitiesData] = await Promise.all([
          getCategories(),
          getFacilities({ status: 'active' })
        ])
        
        setCategories(categoriesData)
        
        // Count facilities per category
        const counts: Record<string, number> = {}
        facilitiesData.forEach(facility => {
          if (facility.category_id) {
            counts[facility.category_id] = (counts[facility.category_id] || 0) + 1
          }
        })
        setCategoryCounts(counts)
      } catch (err) {
        console.error('Error loading categories:', err)
        setError('Failed to load categories')
      } finally {
        setLoading(false)
      }
    }

    loadCategories()
  }, [])

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const IconComponent = iconMap[category.icon_name || 'Users'] || Users
            const count = categoryCounts[category.id] || 0
            const colorClass = category.color || 'bg-gray-500'
            
            return (
              <Link
                key={category.id}
                href={`/browse?category=${category.id}`}
                className="card p-6 hover:shadow-lg transition-shadow duration-200 group"
              >
                <div className="flex items-start space-x-4">
                  <div className={`${colorClass} p-3 rounded-lg group-hover:scale-110 transition-transform duration-200`}>
                    <IconComponent className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">
                      {category.name}
                    </h3>
                    <p className="text-gray-600 text-sm mb-2">
                      {category.description || 'Explore facilities in this category'}
                    </p>
                    <p className="text-primary-600 text-sm font-medium">
                      {count} {count === 1 ? 'facility' : 'facilities'}
                    </p>
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