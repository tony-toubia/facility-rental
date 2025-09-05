'use client'

import { useState } from 'react'
import { Check, X } from 'lucide-react'
import { FACILITY_CATEGORIES, PARENT_CATEGORIES } from '@/data/facility-categories'

interface CategoryButtonSelectorProps {
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  maxSelections?: number
  allowMultiple?: boolean
  className?: string
}

// Icon mapping for categories
const getCategoryIcon = (categoryId: string): string => {
  const iconMap: { [key: string]: string } = {
    // Court Sports
    'basketball': '🏀',
    'volleyball-indoor': '🏐',
    'volleyball-outdoor': '🏐',
    'tennis': '🎾',
    'pickleball': '🏓',
    'badminton': '🏸',
    'squash': '🎾',
    
    // Field Sports
    'soccer': '⚽',
    'american-football': '🏈',
    'baseball': '⚾',
    'softball': '🥎',
    'lacrosse': '🥍',
    'field-hockey': '🏑',
    
    // Track & Field
    'track': '🏃',
    
    // Aquatic Sports
    'swimming-pool': '🏊',
    'diving-pool': '🤿',
    
    // Fitness & Training
    'gym-fitness': '💪',
    'dance-studio': '💃',
    'martial-arts': '🥋',
    'yoga-studio': '🧘',
    
    // Multi-Purpose
    'gymnasium': '🏟️',
    'community-center': '🏢',
    'event-hall': '🎪',
    
    // Outdoor Recreation
    'park-field': '🌳',
    'playground': '🛝',
    
    // Specialized Sports
    'ice-rink': '⛸️',
    'bowling': '🎳',
    'golf': '⛳'
  }
  
  return iconMap[categoryId] || '🏃'
}

export default function CategoryButtonSelector({
  selectedCategories,
  onCategoriesChange,
  maxSelections = 5,
  allowMultiple = true,
  className = ""
}: CategoryButtonSelectorProps) {
  const [expandedParents, setExpandedParents] = useState<string[]>([])

  const toggleCategory = (categoryId: string) => {
    if (!allowMultiple) {
      onCategoriesChange([categoryId])
      return
    }

    if (selectedCategories.includes(categoryId)) {
      onCategoriesChange(selectedCategories.filter(id => id !== categoryId))
    } else if (selectedCategories.length < maxSelections) {
      onCategoriesChange([...selectedCategories, categoryId])
    }
  }

  const toggleParentExpansion = (parentId: string) => {
    if (expandedParents.includes(parentId)) {
      setExpandedParents(expandedParents.filter(id => id !== parentId))
    } else {
      setExpandedParents([...expandedParents, parentId])
    }
  }

  const clearAll = () => {
    onCategoriesChange([])
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header with selection count and clear button */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedCategories.length > 0 ? (
            <span>
              <strong>{selectedCategories.length}</strong> selected 
              {allowMultiple && ` (max ${maxSelections})`}
            </span>
          ) : (
            <span>Select categories that best describe your facility</span>
          )}
        </div>
        {selectedCategories.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-sm text-red-600 hover:text-red-500 flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            Clear all
          </button>
        )}
      </div>

      {/* Selected categories preview */}
      {selectedCategories.length > 0 && (
        <div className="flex flex-wrap gap-2 p-4 bg-primary-50 rounded-lg border border-primary-200">
          <span className="text-sm font-medium text-primary-700">Selected:</span>
          {selectedCategories.map(categoryId => {
            const category = FACILITY_CATEGORIES.find(cat => cat.id === categoryId)
            if (!category) return null
            
            return (
              <span
                key={categoryId}
                className="inline-flex items-center gap-1 px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full"
              >
                <span>{getCategoryIcon(categoryId)}</span>
                {category.name}
                <button
                  type="button"
                  onClick={() => toggleCategory(categoryId)}
                  className="ml-1 hover:text-primary-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )
          })}
        </div>
      )}

      {/* Category groups */}
      <div className="space-y-4">
        {PARENT_CATEGORIES.map(parent => {
          const childCategories = FACILITY_CATEGORIES.filter(cat => cat.parentCategory === parent.id)
          const isExpanded = expandedParents.includes(parent.id)
          const selectedInGroup = childCategories.filter(cat => selectedCategories.includes(cat.id)).length
          
          return (
            <div key={parent.id} className="border border-gray-200 rounded-lg overflow-hidden">
              {/* Parent category header */}
              <button
                type="button"
                onClick={() => toggleParentExpansion(parent.id)}
                className="w-full p-4 text-left hover:bg-gray-50 flex items-center justify-between bg-gray-50 border-b border-gray-200"
              >
                <div className="flex items-center space-x-3">
                  <span className="font-semibold text-gray-900">{parent.name}</span>
                  <span className="text-sm text-gray-500">({childCategories.length} options)</span>
                  {selectedInGroup > 0 && (
                    <span className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs rounded-full">
                      {selectedInGroup} selected
                    </span>
                  )}
                </div>
                <div className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
                  ▼
                </div>
              </button>

              {/* Child categories */}
              {isExpanded && (
                <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {childCategories.map(category => {
                    const isSelected = selectedCategories.includes(category.id)
                    const isDisabled = !isSelected && selectedCategories.length >= maxSelections && allowMultiple
                    
                    return (
                      <button
                        key={category.id}
                        type="button"
                        onClick={() => !isDisabled && toggleCategory(category.id)}
                        disabled={isDisabled}
                        className={`
                          relative p-4 rounded-lg border-2 text-left transition-all duration-200
                          ${isSelected 
                            ? 'border-primary-500 bg-primary-50 shadow-md' 
                            : 'border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm'
                          }
                          ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {/* Selection indicator */}
                        {isSelected && (
                          <div className="absolute top-2 right-2">
                            <div className="w-5 h-5 bg-primary-500 rounded-full flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          </div>
                        )}
                        
                        {/* Category content */}
                        <div className="flex items-start space-x-3">
                          <div className="text-2xl flex-shrink-0">
                            {getCategoryIcon(category.id)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className={`font-medium text-sm ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                              {category.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {category.description}
                            </div>
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Help text */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
        <strong>💡 Tip:</strong> Choose categories that accurately reflect your facility's <strong>intended use</strong>. 
        Focus on what your space is designed for, not alternative uses. Most facilities will have 1-3 relevant categories.
      </div>
    </div>
  )
}