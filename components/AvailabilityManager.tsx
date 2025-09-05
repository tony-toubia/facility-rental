'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, Plus, Trash2, Edit, Save, X, AlertCircle } from 'lucide-react'
import { AvailabilityConfig } from './AvailabilityConfigurator'
import { 
  getFacilityAvailability, 
  saveFacilityAvailability, 
  getAvailabilityExceptions,
  createAvailabilityException,
  deleteAvailabilityException,
  AvailabilityException as DBAvailabilityException
} from '@/lib/availability-database'

// Use the database interface
type AvailabilityException = DBAvailabilityException

interface AvailabilityManagerProps {
  facilityId: string
  facilityName: string
}

export default function AvailabilityManager({ facilityId, facilityName }: AvailabilityManagerProps) {
  const [config, setConfig] = useState<AvailabilityConfig | null>(null)
  const [exceptions, setExceptions] = useState<AvailabilityException[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [currentView, setCurrentView] = useState<'schedule' | 'exceptions' | 'calendar'>('schedule')
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [newException, setNewException] = useState<Partial<AvailabilityException>>({
    exception_type: 'manual',
    is_available: false
  })
  const [showAddException, setShowAddException] = useState(false)

  useEffect(() => {
    loadAvailabilityData()
  }, [facilityId])

  const loadAvailabilityData = async () => {
    try {
      setIsLoading(true)
      const availabilityConfig = await getFacilityAvailability(facilityId)
      if (availabilityConfig) {
        setConfig(availabilityConfig)
      }
      
      // Load exceptions for the next 12 months
      const startDate = new Date().toISOString().split('T')[0]
      const endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      const exceptionsData = await getAvailabilityExceptions(facilityId, startDate, endDate)
      setExceptions(exceptionsData)
    } catch (err: any) {
      setError(err.message || 'Failed to load availability data')
    } finally {
      setIsLoading(false)
    }
  }

  const saveConfiguration = async () => {
    if (!config) return

    try {
      setIsSaving(true)
      setError('')
      await saveFacilityAvailability(facilityId, config)
      alert('Availability configuration saved successfully!')
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration')
    } finally {
      setIsSaving(false)
    }
  }

  const addException = async () => {
    if (!newException.exception_date) {
      setError('Please select a date for the exception')
      return
    }

    try {
      const exception: Omit<AvailabilityException, 'id'> = {
        exception_date: newException.exception_date,
        start_time: newException.start_time,
        end_time: newException.end_time,
        is_available: newException.is_available || false,
        exception_type: newException.exception_type || 'manual',
        notes: newException.notes
      }

      await createAvailabilityException(facilityId, exception)
      
      // Reload exceptions to get the new one with proper ID
      await loadAvailabilityData()
      
      setNewException({
        exception_type: 'manual',
        is_available: false
      })
      setShowAddException(false)
      setError('')
    } catch (err: any) {
      setError(err.message || 'Failed to add exception')
    }
  }

  const removeException = async (id: string) => {
    try {
      await deleteAvailabilityException(id)
      setExceptions(prev => prev.filter(ex => ex.id !== id))
    } catch (err: any) {
      setError(err.message || 'Failed to remove exception')
    }
  }

  const updateDayAvailability = (dayIndex: number, isAvailable: boolean) => {
    if (!config) return

    setConfig(prev => ({
      ...prev!,
      weeklySchedule: prev!.weeklySchedule.map((day, index) => 
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
    if (!config) return

    setConfig(prev => ({
      ...prev!,
      weeklySchedule: prev!.weeklySchedule.map((day, index) => 
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
    if (!config) return

    setConfig(prev => ({
      ...prev!,
      weeklySchedule: prev!.weeklySchedule.map((day, dIndex) => 
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
    if (!config) return

    setConfig(prev => ({
      ...prev!,
      weeklySchedule: prev!.weeklySchedule.map((day, dIndex) => 
        dIndex === dayIndex 
          ? { 
              ...day, 
              timeSlots: day.timeSlots.filter((_, sIndex) => sIndex !== slotIndex)
            }
          : day
      )
    }))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <span className="ml-2 text-gray-600">Loading availability settings...</span>
      </div>
    )
  }

  if (!config) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No Availability Configuration</h3>
        <p className="text-gray-600">This facility doesn&apos;t have availability settings configured yet.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Availability Management</h2>
          <p className="text-gray-600">{facilityName}</p>
        </div>
        <button
          onClick={saveConfiguration}
          disabled={isSaving}
          className="btn-primary flex items-center"
        >
          <Save className="w-4 h-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'schedule', name: 'Weekly Schedule', icon: Clock },
            { id: 'exceptions', name: 'Exceptions & Blocks', icon: Calendar },
            { id: 'calendar', name: 'Calendar View', icon: Calendar }
          ].map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setCurrentView(tab.id as any)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center ${
                  currentView === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="w-4 h-4 mr-2" />
                {tab.name}
              </button>
            )
          })}
        </nav>
      </div>

      {/* Weekly Schedule View */}
      {currentView === 'schedule' && (
        <div className="space-y-6">
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Basic Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="font-medium">Booking Increment:</span> {config.availabilityIncrement} minutes
              </div>
              <div>
                <span className="font-medium">Minimum Duration:</span> {
                  config.minimumRentalDuration 
                    ? `${config.minimumRentalDuration} minutes`
                    : 'Same as increment'
                }
              </div>
              <div>
                <span className="font-medium">Timezone:</span> {config.timezone}
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Weekly Availability</h3>
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
        </div>
      )}

      {/* Exceptions View */}
      {currentView === 'exceptions' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Availability Exceptions</h3>
            <button
              onClick={() => setShowAddException(true)}
              className="btn-primary flex items-center"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Exception
            </button>
          </div>

          {/* Add Exception Form */}
          {showAddException && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h4 className="font-medium text-gray-900">Add New Exception</h4>
                <button
                  onClick={() => setShowAddException(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input
                    type="date"
                    value={newException.exception_date || ''}
                    onChange={(e) => setNewException(prev => ({ ...prev, exception_date: e.target.value }))}
                    className="input-field"
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <select
                    value={newException.exception_type || 'manual'}
                    onChange={(e) => setNewException(prev => ({ 
                      ...prev, 
                      exception_type: e.target.value as AvailabilityException['exception_type']
                    }))}
                    className="input-field"
                  >
                    <option value="manual">Manual Block</option>
                    <option value="maintenance">Maintenance</option>
                    <option value="holiday">Holiday</option>
                    <option value="recurring">Recurring Event</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time (Optional)</label>
                  <input
                    type="time"
                    value={newException.start_time || ''}
                    onChange={(e) => setNewException(prev => ({ ...prev, start_time: e.target.value }))}
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty to block entire day</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time (Optional)</label>
                  <input
                    type="time"
                    value={newException.end_time || ''}
                    onChange={(e) => setNewException(prev => ({ ...prev, end_time: e.target.value }))}
                    className="input-field"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                  <input
                    type="text"
                    value={newException.notes || ''}
                    onChange={(e) => setNewException(prev => ({ ...prev, notes: e.target.value }))}
                    className="input-field"
                    placeholder="Optional notes about this exception..."
                  />
                </div>

                <div className="md:col-span-2 flex items-center">
                  <input
                    type="checkbox"
                    checked={newException.is_available || false}
                    onChange={(e) => setNewException(prev => ({ ...prev, is_available: e.target.checked }))}
                    className="mr-2"
                  />
                  <label className="text-sm text-gray-700">
                    Make available (override default schedule to add availability)
                  </label>
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-4">
                <button
                  onClick={() => setShowAddException(false)}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  onClick={addException}
                  className="btn-primary"
                >
                  Add Exception
                </button>
              </div>
            </div>
          )}

          {/* Exceptions List */}
          <div className="space-y-3">
            {exceptions.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                <p>No availability exceptions configured</p>
                <p className="text-sm">Add exceptions to block or override your regular schedule</p>
              </div>
            ) : (
              exceptions.map(exception => (
                <div key={exception.id} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">
                          {new Date(exception.exception_date).toLocaleDateString()}
                        </span>
                        <span className={`px-2 py-1 text-xs rounded-full ${
                          exception.is_available 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {exception.is_available ? 'Available' : 'Blocked'}
                        </span>
                        <span className="text-sm text-gray-500 capitalize">
                          {exception.exception_type}
                        </span>
                      </div>
                      {(exception.start_time || exception.end_time) && (
                        <div className="text-sm text-gray-600 mt-1">
                          {exception.start_time || '00:00'} - {exception.end_time || '23:59'}
                        </div>
                      )}
                      {exception.notes && (
                        <div className="text-sm text-gray-600 mt-1">{exception.notes}</div>
                      )}
                    </div>
                    <button
                      onClick={() => removeException(exception.id!)}
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Calendar View */}
      {currentView === 'calendar' && (
        <div className="space-y-6">
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Calendar View</h3>
            <p>Interactive calendar view coming soon!</p>
            <p className="text-sm">This will show your availability and bookings in a monthly calendar format.</p>
          </div>
        </div>
      )}
    </div>
  )
}