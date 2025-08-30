'use client'

import { useState } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { FACILITY_CATEGORIES, PARENT_CATEGORIES } from '@/data/facility-categories'

interface CategoryCheckboxListProps {
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  maxSelections?: number
  allowMultiple?: boolean
  className?: string
}

export default function CategoryCheckboxList({
  selectedCategories,
  onCategoriesChange,
  maxSelections = 5,
  allowMultiple = true,
  className = ""
}: CategoryCheckboxListProps) {
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
    <div className={`space-y-4 ${className}`}>
      {/* Header with clear button */}
      {selectedCategories.length > 0 && (
        <div className="flex items-center justify-between pb-2 border-b border-gray-200">
          <span className="text-sm text-gray-600">
            {selectedCategories.length} selected {allowMultiple && `(max ${maxSelections})`}
          </span>
          <button
            onClick={clearAll}
            className="text-sm text-primary-600 hover:text-primary-500 font-medium"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Categories grouped by parent */}
      <div className="space-y-3">
        {PARENT_CATEGORIES.map(parent => {
          const childCategories = FACILITY_CATEGORIES.filter(cat => cat.parentCategory === parent.id)
          const isExpanded = expandedParents.includes(parent.id)
          
          return (
            <div key={parent.id} className="border border-gray-200 rounded-lg">
              {/* Parent category header */}
              <button
                onClick={() => toggleParentExpansion(parent.id)}
                className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between rounded-t-lg"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-medium text-gray-900">{parent.name}</span>
                  <span className="text-sm text-gray-500">({childCategories.length})</span>
                </div>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                )}
              </button>

              {/* Child categories */}
              {isExpanded && (
                <div className="border-t border-gray-200 bg-gray-50 rounded-b-lg">
                  <div className="p-3 space-y-2">
                    {childCategories.map(category => {
                      const isSelected = selectedCategories.includes(category.id)
                      const isDisabled = !isSelected && selectedCategories.length >= maxSelections && allowMultiple
                      
                      return (
                        <label
                          key={category.id}
                          className={`flex items-start space-x-3 cursor-pointer p-2 rounded hover:bg-white transition-colors ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                          }`}
                        >
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => !isDisabled && toggleCategory(category.id)}
                            disabled={isDisabled}
                            className="mt-0.5 h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <div className={`text-sm font-medium ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                              {category.name}
                            </div>
                            <div className="text-xs text-gray-500 mt-0.5">
                              {category.description}
                            </div>
                          </div>
                        </label>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Selection limit warning */}
      {allowMultiple && selectedCategories.length >= maxSelections && (
        <div className="text-sm text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
          Maximum {maxSelections} categories selected. Uncheck some to select others.
        </div>
      )}
    </div>
  )
}