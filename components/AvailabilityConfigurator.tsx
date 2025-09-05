'use client'

import { useState, useEffect, useRef } from 'react'
import { Clock, Calendar, Settings, Plus, Trash2, AlertCircle } from 'lucide-react'

interface TimeSlot {
  start: string
  end: string
}

interface DayAvailability {
  day: number
  dayName: string
  isAvailable: boolean
  timeSlots: TimeSlot[]
}

interface AvailabilityTemplate {
  id: string
  name: string
  description: string
  pattern: Array<{
    day: number
    start: string
    end: string
  }>
}

interface Holiday {
  id: string
  name: string
  description: string
  holiday_date: string
}

interface AvailabilityConfiguratorProps {
  facilityId?: string
  onAvailabilityChange: (config: AvailabilityConfig) => void
  initialConfig?: AvailabilityConfig
  facilityCity?: string
  facilityState?: string
}

export interface AvailabilityConfig {
  availabilityIncrement: number // minutes
  minimumRentalDuration: number | null // minutes, null means use increment
  timezone: string
  weeklySchedule: DayAvailability[]
  selectedHolidays: string[]
  notes?: string
}

const DAYS_OF_WEEK = [
  { day: 1, name: 'Monday', short: 'Mon' },
  { day: 2, name: 'Tuesday', short: 'Tue' },
  { day: 3, name: 'Wednesday', short: 'Wed' },
  { day: 4, name: 'Thursday', short: 'Thu' },
  { day: 5, name: 'Friday', short: 'Fri' },
  { day: 6, name: 'Saturday', short: 'Sat' },
  { day: 0, name: 'Sunday', short: 'Sun' }
]

const INCREMENT_OPTIONS = [
  { value: 15, label: '15 minutes' },
  { value: 30, label: '30 minutes' },
  { value: 60, label: '1 hour' },
  { value: 120, label: '2 hours' },
  { value: 240, label: '4 hours' }
]

const getMinimumDurationOptions = (increment: number) => {
  const baseOptions = [
    { value: null, label: 'Same as increment' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 240, label: '4 hours' },
    { value: 480, label: 'Half day (8 hours)' },
    { value: 960, label: 'Full day (16 hours)' }
  ]
  
  // Filter out options that are less than or equal to the increment
  return baseOptions.filter(option => 
    option.value === null || option.value > increment
  )
}

// Simple timezone detection based on US states
const getTimezoneFromLocation = (city?: string, state?: string): string => {
  if (!state) return 'America/New_York' // Default to Eastern
  
  const stateTimezones: Record<string, string> = {
    // Eastern Time
    'CT': 'America/New_York', 'DE': 'America/New_York', 'FL': 'America/New_York',
    'GA': 'America/New_York', 'ME': 'America/New_York', 'MD': 'America/New_York',
    'MA': 'America/New_York', 'NH': 'America/New_York', 'NJ': 'America/New_York',
    'NY': 'America/New_York', 'NC': 'America/New_York', 'OH': 'America/New_York',
    'PA': 'America/New_York', 'RI': 'America/New_York', 'SC': 'America/New_York',
    'VT': 'America/New_York', 'VA': 'America/New_York', 'WV': 'America/New_York',
    'DC': 'America/New_York',
    
    // Central Time
    'AL': 'America/Chicago', 'AR': 'America/Chicago', 'IL': 'America/Chicago',
    'IA': 'America/Chicago', 'KS': 'America/Chicago', 'KY': 'America/Chicago',
    'LA': 'America/Chicago', 'MN': 'America/Chicago', 'MS': 'America/Chicago',
    'MO': 'America/Chicago', 'NE': 'America/Chicago', 'ND': 'America/Chicago',
    'OK': 'America/Chicago', 'SD': 'America/Chicago', 'TN': 'America/Chicago',
    'TX': 'America/Chicago', 'WI': 'America/Chicago',
    
    // Mountain Time
    'AZ': 'America/Phoenix', 'CO': 'America/Denver', 'ID': 'America/Denver',
    'MT': 'America/Denver', 'NV': 'America/Denver', 'NM': 'America/Denver',
    'UT': 'America/Denver', 'WY': 'America/Denver',
    
    // Pacific Time
    'CA': 'America/Los_Angeles', 'OR': 'America/Los_Angeles', 'WA': 'America/Los_Angeles',
    
    // Alaska Time
    'AK': 'America/Anchorage',
    
    // Hawaii Time
    'HI': 'Pacific/Honolulu'
  }
  
  return stateTimezones[state.toUpperCase()] || 'America/New_York'
}

const DEFAULT_TEMPLATES: AvailabilityTemplate[] = [
  {
    id: 'business-hours',
    name: 'Business Hours',
    description: 'Monday-Friday 9am-5pm',
    pattern: [
      { day: 1, start: '09:00', end: '17:00' },
      { day: 2, start: '09:00', end: '17:00' },
      { day: 3, start: '09:00', end: '17:00' },
      { day: 4, start: '09:00', end: '17:00' },
      { day: 5, start: '09:00', end: '17:00' }
    ]
  },
  {
    id: 'extended-hours',
    name: 'Extended Business Hours',
    description: 'Monday-Friday 8am-6pm',
    pattern: [
      { day: 1, start: '08:00', end: '18:00' },
      { day: 2, start: '08:00', end: '18:00' },
      { day: 3, start: '08:00', end: '18:00' },
      { day: 4, start: '08:00', end: '18:00' },
      { day: 5, start: '08:00', end: '18:00' }
    ]
  },
  {
    id: 'weekends-only',
    name: 'Weekends Only',
    description: 'Saturday-Sunday 10am-8pm',
    pattern: [
      { day: 0, start: '10:00', end: '20:00' },
      { day: 6, start: '10:00', end: '20:00' }
    ]
  },
  {
    id: 'after-school',
    name: 'After School & Weekends',
    description: 'Monday-Friday 3:30pm-9pm, Weekends 9am-9pm',
    pattern: [
      { day: 0, start: '09:00', end: '21:00' },
      { day: 1, start: '15:30', end: '21:00' },
      { day: 2, start: '15:30', end: '21:00' },
      { day: 3, start: '15:30', end: '21:00' },
      { day: 4, start: '15:30', end: '21:00' },
      { day: 5, start: '15:30', end: '21:00' },
      { day: 6, start: '09:00', end: '21:00' }
    ]
  },
  {
    id: 'full-week',
    name: 'Full Week',
    description: 'Monday-Sunday 8am-10pm',
    pattern: [
      { day: 0, start: '08:00', end: '22:00' },
      { day: 1, start: '08:00', end: '22:00' },
      { day: 2, start: '08:00', end: '22:00' },
      { day: 3, start: '08:00', end: '22:00' },
      { day: 4, start: '08:00', end: '22:00' },
      { day: 5, start: '08:00', end: '22:00' },
      { day: 6, start: '08:00', end: '22:00' }
    ]
  }
]

const COMMON_HOLIDAYS: Holiday[] = [
  { id: 'new-years', name: "New Year's Day", description: 'January 1st', holiday_date: '2024-01-01' },
  { id: 'mlk-day', name: 'Martin Luther King Jr. Day', description: 'Third Monday in January', holiday_date: '2024-01-15' },
  { id: 'presidents-day', name: 'Presidents Day', description: 'Third Monday in February', holiday_date: '2024-02-19' },
  { id: 'memorial-day', name: 'Memorial Day', description: 'Last Monday in May', holiday_date: '2024-05-27' },
  { id: 'independence-day', name: 'Independence Day', description: 'July 4th', holiday_date: '2024-07-04' },
  { id: 'labor-day', name: 'Labor Day', description: 'First Monday in September', holiday_date: '2024-09-02' },
  { id: 'columbus-day', name: 'Columbus Day', description: 'Second Monday in October', holiday_date: '2024-10-14' },
  { id: 'veterans-day', name: 'Veterans Day', description: 'November 11th', holiday_date: '2024-11-11' },
  { id: 'thanksgiving', name: 'Thanksgiving', description: 'Fourth Thursday in November', holiday_date: '2024-11-28' },
  { id: 'christmas-eve', name: 'Christmas Eve', description: 'December 24th', holiday_date: '2024-12-24' },
  { id: 'christmas', name: 'Christmas Day', description: 'December 25th', holiday_date: '2024-12-25' },
  { id: 'new-years-eve', name: "New Year's Eve", description: 'December 31st', holiday_date: '2024-12-31' }
]

export default function AvailabilityConfigurator({ 
  facilityId, 
  onAvailabilityChange, 
  initialConfig,
  facilityCity,
  facilityState
}: AvailabilityConfiguratorProps) {
  const [currentStep, setCurrentStep] = useState(1)
  const [config, setConfig] = useState<AvailabilityConfig>({
    availabilityIncrement: 30,
    minimumRentalDuration: null,
    timezone: getTimezoneFromLocation(facilityCity, facilityState),
    weeklySchedule: DAYS_OF_WEEK.map(day => ({
      day: day.day,
      dayName: day.name,
      isAvailable: false,
      timeSlots: []
    })),
    selectedHolidays: [],
    notes: ''
  })

  useEffect(() => {
    if (initialConfig) {
      setConfig(initialConfig)
    }
  }, [initialConfig])

  // Use a ref to store the previous config to avoid unnecessary calls
  const prevConfigRef = useRef<AvailabilityConfig | null>(null)
  
  useEffect(() => {
    // Only call onAvailabilityChange if the config actually changed
    if (prevConfigRef.current && JSON.stringify(prevConfigRef.current) !== JSON.stringify(config)) {
      onAvailabilityChange(config)
    }
    prevConfigRef.current = config
  }, [config]) // Removed onAvailabilityChange from dependencies

  // Update timezone when city/state changes
  useEffect(() => {
    if (facilityCity || facilityState) {
      const detectedTimezone = getTimezoneFromLocation(facilityCity, facilityState)
      setConfig(prev => ({
        ...prev,
        timezone: detectedTimezone
      }))
    }
  }, [facilityCity, facilityState])

  // Reset minimum rental duration if it becomes invalid when increment changes
  useEffect(() => {
    if (config.minimumRentalDuration && config.minimumRentalDuration <= config.availabilityIncrement) {
      setConfig(prev => ({
        ...prev,
        minimumRentalDuration: null
      }))
    }
  }, [config.availabilityIncrement, config.minimumRentalDuration])

  const applyTemplate = (template: AvailabilityTemplate) => {
    const newSchedule = DAYS_OF_WEEK.map(day => {
      const templateDay = template.pattern.find(p => p.day === day.day)
      return {
        day: day.day,
        dayName: day.name,
        isAvailable: !!templateDay,
        timeSlots: templateDay ? [{ start: templateDay.start, end: templateDay.end }] : []
      }
    })

    setConfig(prev => ({
      ...prev,
      weeklySchedule: newSchedule
    }))
  }

  const updateDayAvailability = (dayIndex: number, isAvailable: boolean) => {
    setConfig(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((day, index) => 
        index === dayIndex 
          ? { 
              ...day, 
              isAvailable,
              timeSlots: isAvailable && day.timeSlots.length === 0 
                ? [{ start: '09:00', end: '17:00' }] 
                : day.timeSlots
            }
          : day
      )
    }))
  }

  const addTimeSlot = (dayIndex: number) => {
    setConfig(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((day, index) => 
        index === dayIndex 
          ? { 
              ...day, 
              timeSlots: [...day.timeSlots, { start: '09:00', end: '17:00' }]
            }
          : day
      )
    }))
  }

  const updateTimeSlot = (dayIndex: number, slotIndex: number, field: 'start' | 'end', value: string) => {
    setConfig(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((day, dIndex) => 
        dIndex === dayIndex 
          ? { 
              ...day, 
              timeSlots: day.timeSlots.map((slot, sIndex) =>
                sIndex === slotIndex ? { ...slot, [field]: value } : slot
              )
            }
          : day
      )
    }))
  }

  const removeTimeSlot = (dayIndex: number, slotIndex: number) => {
    setConfig(prev => ({
      ...prev,
      weeklySchedule: prev.weeklySchedule.map((day, dIndex) => 
        dIndex === dayIndex 
          ? { 
              ...day, 
              timeSlots: day.timeSlots.filter((_, sIndex) => sIndex !== slotIndex)
            }
          : day
      )
    }))
  }

  const toggleHoliday = (holidayId: string) => {
    setConfig(prev => ({
      ...prev,
      selectedHolidays: prev.selectedHolidays.includes(holidayId)
        ? prev.selectedHolidays.filter(id => id !== holidayId)
        : [...prev.selectedHolidays, holidayId]
    }))
  }

  const selectAllHolidays = () => {
    setConfig(prev => ({
      ...prev,
      selectedHolidays: COMMON_HOLIDAYS.map(h => h.id)
    }))
  }

  const clearAllHolidays = () => {
    setConfig(prev => ({
      ...prev,
      selectedHolidays: []
    }))
  }

  return (
    <div className="space-y-8">
      {/* Step Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          {[1, 2, 3].map((step) => (
            <div key={step} className="flex items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                currentStep >= step 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-600'
              }`}>
                {step}
              </div>
              {step < 3 && (
                <div className={`w-12 h-0.5 ${
                  currentStep > step ? 'bg-blue-600' : 'bg-gray-200'
                }`} />
              )}
            </div>
          ))}
        </div>
        <div className="text-sm text-gray-500">
          Step {currentStep} of 3
        </div>
      </div>

      {/* Step 1: Basic Settings */}
      {currentStep === 1 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Settings className="w-5 h-5 mr-2" />
              Basic Availability Settings
            </h3>
            <p className="text-gray-600 mb-6">
              Configure how your facility can be booked. You&apos;ll be able to customize specific days and times in the next steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Booking Increment
              </label>
              <select
                value={config.availabilityIncrement}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  availabilityIncrement: parseInt(e.target.value) 
                }))}
                className="input-field"
              >
                {INCREMENT_OPTIONS.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                The smallest time unit customers can book (e.g., 30-minute slots)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Minimum Rental Duration
              </label>
              <select
                value={config.minimumRentalDuration || ''}
                onChange={(e) => setConfig(prev => ({ 
                  ...prev, 
                  minimumRentalDuration: e.target.value ? parseInt(e.target.value) : null
                }))}
                className="input-field"
              >
                {getMinimumDurationOptions(config.availabilityIncrement).map(option => (
                  <option key={option.value || 'null'} value={option.value || ''}>
                    {option.label}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                The minimum time customers must book your facility
              </p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={config.timezone}
              onChange={(e) => setConfig(prev => ({ ...prev, timezone: e.target.value }))}
              className="input-field max-w-md"
            >
              <option value="America/New_York">Eastern Time (ET)</option>
              <option value="America/Chicago">Central Time (CT)</option>
              <option value="America/Denver">Mountain Time (MT)</option>
              <option value="America/Los_Angeles">Pacific Time (PT)</option>
              <option value="America/Anchorage">Alaska Time (AKT)</option>
              <option value="Pacific/Honolulu">Hawaii Time (HST)</option>
            </select>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn-primary"
            >
              Next: Set Default Schedule
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Default Schedule Template */}
      {currentStep === 2 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Default Weekly Schedule
            </h3>
            <p className="text-gray-600 mb-6">
              Start with a template or create your own weekly availability pattern. You can customize individual days in the next step.
            </p>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Quick Templates</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {DEFAULT_TEMPLATES.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => applyTemplate(template)}
                  className="p-3 text-left border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-colors"
                >
                  <div className="font-medium text-gray-900">{template.name}</div>
                  <div className="text-sm text-gray-600">{template.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Custom Schedule</h4>
            <div className="space-y-3">
              {config.weeklySchedule.map((day, dayIndex) => (
                <div key={day.day} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={day.isAvailable}
                        onChange={(e) => updateDayAvailability(dayIndex, e.target.checked)}
                        className="mr-3"
                      />
                      <span className="font-medium text-gray-900">{day.dayName}</span>
                    </div>
                    {day.isAvailable && (
                      <button
                        type="button"
                        onClick={() => addTimeSlot(dayIndex)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Time Slot
                      </button>
                    )}
                  </div>

                  {day.isAvailable && (
                    <div className="space-y-2">
                      {day.timeSlots.map((slot, slotIndex) => (
                        <div key={slotIndex} className="flex items-center space-x-3">
                          <input
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'start', e.target.value)}
                            className="input-field flex-1"
                          />
                          <span className="text-gray-500">to</span>
                          <input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateTimeSlot(dayIndex, slotIndex, 'end', e.target.value)}
                            className="input-field flex-1"
                          />
                          {day.timeSlots.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeTimeSlot(dayIndex, slotIndex)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-between">
            <button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="btn-secondary"
            >
              Back
            </button>
            <button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="btn-primary"
            >
              Next: Select Holidays
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Holiday Selection */}
      {currentStep === 3 && (
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Holiday Closures
            </h3>
            <p className="text-gray-600 mb-6">
              Select holidays when your facility will be closed. These will automatically block availability on those dates.
            </p>
          </div>

          <div className="flex justify-between items-center">
            <h4 className="text-md font-medium text-gray-900">Common Holidays</h4>
            <div className="space-x-2">
              <button
                type="button"
                onClick={selectAllHolidays}
                className="text-sm text-blue-600 hover:text-blue-800"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={clearAllHolidays}
                className="text-sm text-gray-600 hover:text-gray-800"
              >
                Clear All
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {COMMON_HOLIDAYS.map(holiday => (
              <label key={holiday.id} className="flex items-center p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
                <input
                  type="checkbox"
                  checked={config.selectedHolidays.includes(holiday.id)}
                  onChange={() => toggleHoliday(holiday.id)}
                  className="mr-3"
                />
                <div>
                  <div className="font-medium text-gray-900">{holiday.name}</div>
                  <div className="text-sm text-gray-600">{holiday.description}</div>
                </div>
              </label>
            ))}
          </div>

          <div className="flex justify-start">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="btn-secondary"
            >
              Back
            </button>
          </div>
        </div>
      )}

      {/* Notes Section - Always visible at the bottom */}
      <div className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Additional Notes (Optional)
          </label>
          <textarea
            value={config.notes || ''}
            onChange={(e) => setConfig(prev => ({ ...prev, notes: e.target.value }))}
            rows={3}
            className="input-field"
            placeholder="Any special instructions or notes about your facility's availability..."
          />
          <p className="text-xs text-gray-500 mt-1">
            These notes will be visible to potential renters when they view your facility.
          </p>
        </div>
      </div>
    </div>
  )
}