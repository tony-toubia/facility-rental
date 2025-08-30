'use client'

import { useState } from 'react'
import { Check, ChevronDown } from 'lucide-react'
import { FACILITY_CATEGORIES, PARENT_CATEGORIES } from '@/data/facility-categories'

interface CategorySelectorProps {
  selectedCategories: string[]
  onCategoriesChange: (categories: string[]) => void
  maxSelections?: number
  allowMultiple?: boolean
  placeholder?: string
  className?: string
}

export default function CategorySelector({
  selectedCategories,
  onCategoriesChange,
  maxSelections = 5,
  allowMultiple = true,
  placeholder = "Select categories...",
  className = ""
}: CategorySelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedParents, setExpandedParents] = useState<string[]>(['court-sports', 'multi-purpose'])

  const toggleCategory = (categoryId: string) => {
    if (!allowMultiple) {
      onCategoriesChange([categoryId])
      setIsOpen(false)
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

  const getSelectedCategoryNames = () => {
    return selectedCategories
      .map(id => FACILITY_CATEGORIES.find(cat => cat.id === id)?.name)
      .filter(Boolean)
      .join(', ')
  }

  const clearAll = () => {
    onCategoriesChange([])
  }

  return (
    <div className={`relative ${className}`}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full input-field text-left flex items-center justify-between"
      >
        <span className={selectedCategories.length > 0 ? 'text-gray-900' : 'text-gray-500'}>
          {selectedCategories.length > 0 ? getSelectedCategoryNames() : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
          {/* Header with clear button */}
          {selectedCategories.length > 0 && (
            <div className="p-3 border-b border-gray-100 flex items-center justify-between">
              <span className="text-sm text-gray-600">
                {selectedCategories.length} selected {allowMultiple && `(max ${maxSelections})`}
              </span>
              <button
                onClick={clearAll}
                className="text-sm text-primary-600 hover:text-primary-500"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Categories grouped by parent */}
          {PARENT_CATEGORIES.map(parent => {
            const childCategories = FACILITY_CATEGORIES.filter(cat => cat.parentCategory === parent.id)
            const isExpanded = expandedParents.includes(parent.id)
            
            return (
              <div key={parent.id} className="border-b border-gray-100 last:border-b-0">
                {/* Parent category header */}
                <button
                  onClick={() => toggleParentExpansion(parent.id)}
                  className="w-full p-3 text-left hover:bg-gray-50 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-lg">{parent.icon}</span>
                    <span className="font-medium text-gray-900">{parent.name}</span>
                    <span className="text-sm text-gray-500">({childCategories.length})</span>
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
                </button>

                {/* Child categories */}
                {isExpanded && (
                  <div className="bg-gray-50">
                    {childCategories.map(category => {
                      const isSelected = selectedCategories.includes(category.id)
                      const isDisabled = !isSelected && selectedCategories.length >= maxSelections && allowMultiple
                      
                      return (
                        <button
                          key={category.id}
                          onClick={() => !isDisabled && toggleCategory(category.id)}
                          disabled={isDisabled}
                          className={`w-full p-3 pl-12 text-left hover:bg-gray-100 flex items-center justify-between transition-colors ${
                            isDisabled ? 'opacity-50 cursor-not-allowed' : ''
                          } ${isSelected ? 'bg-primary-50' : ''}`}
                        >
                          <div className="flex items-center space-x-3">
                            <span className="text-base">{category.icon}</span>
                            <div>
                              <div className={`font-medium ${isSelected ? 'text-primary-700' : 'text-gray-900'}`}>
                                {category.name}
                              </div>
                              <div className="text-sm text-gray-500">{category.description}</div>
                            </div>
                          </div>
                          {isSelected && (
                            <Check className="w-4 h-4 text-primary-600" />
                          )}
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}

          {/* Close button */}
          <div className="p-3 border-t border-gray-100">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full btn-primary text-sm py-2"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  )
}