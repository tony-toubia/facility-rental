'use client'

import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface StatusIconSelectorProps {
  value: 'pending' | 'approved' | 'needs_changes'
  onChange: (value: 'pending' | 'approved' | 'needs_changes') => void
  className?: string
}

export default function StatusIconSelector({
  value,
  onChange,
  className = ""
}: StatusIconSelectorProps) {
  const statuses = [
    {
      value: 'pending' as const,
      label: 'Pending',
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-200',
      selectedBg: 'bg-yellow-100',
      selectedBorder: 'border-yellow-400'
    },
    {
      value: 'approved' as const,
      label: 'Approved',
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-200',
      selectedBg: 'bg-green-100',
      selectedBorder: 'border-green-400'
    },
    {
      value: 'needs_changes' as const,
      label: 'Needs Changes',
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-200',
      selectedBg: 'bg-red-100',
      selectedBorder: 'border-red-400'
    }
  ]

  return (
    <div className={`flex gap-2 ${className}`}>
      {statuses.map((status) => {
        const Icon = status.icon
        const isSelected = value === status.value
        
        return (
          <button
            key={status.value}
            type="button"
            onClick={() => onChange(status.value)}
            className={`
              flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-all duration-200
              ${isSelected 
                ? `${status.selectedBg} ${status.selectedBorder} shadow-md` 
                : `bg-gray-50 border-gray-200 text-gray-400 hover:bg-gray-100 hover:border-gray-300 hover:text-gray-500`
              }
            `}
            title={status.label}
          >
            <Icon className={`w-5 h-5 ${isSelected ? status.color : 'text-gray-400'}`} />
            <span className={`text-xs font-medium ${isSelected ? status.color : 'text-gray-400'}`}>
              {status.label}
            </span>
          </button>
        )
      })}
    </div>
  )
}