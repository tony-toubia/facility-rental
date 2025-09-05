'use client'

import { useState, useEffect } from 'react'
import { Calendar, Clock, DollarSign, Users, AlertCircle, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface TimeSlot {
  start_time: string
  end_time: string
  is_available: boolean
  exception_type?: string
}

interface AvailabilityData {
  availability_date: string
  day_of_week: number
  time_slots: TimeSlot[]
}

interface BookingAvailabilityProps {
  facilityId: string
  price: number
  priceUnit: string
  capacity?: number
  availabilityIncrement?: number
  minimumRentalDuration?: number
}

export default function BookingAvailability({
  facilityId,
  price,
  priceUnit,
  capacity,
  availabilityIncrement = 30,
  minimumRentalDuration
}: BookingAvailabilityProps) {
  const [selectedDate, setSelectedDate] = useState<string>('')
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<(TimeSlot & { display: string; value: string }) | null>(null)
  const [duration, setDuration] = useState<number>(minimumRentalDuration || availabilityIncrement)
  const [availability, setAvailability] = useState<AvailabilityData[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [bookingStep, setBookingStep] = useState<'date' | 'time' | 'confirm'>('date')

  // Generate duration options based on facility settings
  const generateDurationOptions = () => {
    const options = []
    const minDuration = minimumRentalDuration || availabilityIncrement
    const increment = availabilityIncrement
    
    // Generate options from minimum duration up to 8 hours in increments
    for (let duration = minDuration; duration <= 480; duration += increment) {
      options.push(duration)
    }
    
    return options
  }

  const durationOptions = generateDurationOptions()

  // Generate next 30 days for date selection - only include dates with availability
  const generateDateOptions = () => {
    const dates = []
    const today = new Date()
    for (let i = 0; i < 30; i++) {
      const date = new Date(today)
      date.setDate(today.getDate() + i)
      const dateString = date.toISOString().split('T')[0]
      
      dates.push({
        value: dateString,
        label: date.toLocaleDateString('en-US', { 
          weekday: 'short', 
          month: 'short', 
          day: 'numeric' 
        }),
        isToday: i === 0
      })
    }
    return dates
  }

  const allDateOptions = generateDateOptions()
  
  // Filter dates to only show those with available time slots
  const dateOptions = allDateOptions.filter(dateOption => {
    const dateAvailability = availability.find(a => a.availability_date === dateOption.value)
    return dateAvailability?.time_slots.some(slot => slot.is_available) || availability.length === 0
  })

  // Load availability data for all dates on component mount
  useEffect(() => {
    loadAllAvailability()
  }, [facilityId])

  // Load availability for selected date
  useEffect(() => {
    if (selectedDate) {
      loadAvailability()
    }
  }, [selectedDate])

  const loadAllAvailability = async () => {
    try {
      setLoading(true)
      setError(null)

      // Load availability for all days of the week
      const { data: defaultAvailability, error: defaultError } = await supabase
        .from('facility_default_availability')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('is_available', true)

      if (defaultError) {
        console.error('Error loading default availability:', defaultError)
        setError('Failed to load availability')
        return
      }

      // Load all exceptions for the next 30 days
      const today = new Date()
      const endDate = new Date(today)
      endDate.setDate(today.getDate() + 30)

      const { data: exceptions, error: exceptionsError } = await supabase
        .from('facility_availability_exceptions')
        .select('*')
        .eq('facility_id', facilityId)
        .gte('exception_date', today.toISOString().split('T')[0])
        .lte('exception_date', endDate.toISOString().split('T')[0])

      if (exceptionsError) {
        console.error('Error loading availability exceptions:', exceptionsError)
      }

      // Process availability for all dates
      const availabilityData: AvailabilityData[] = []
      
      for (let i = 0; i < 30; i++) {
        const date = new Date(today)
        date.setDate(today.getDate() + i)
        const dateString = date.toISOString().split('T')[0]
        const dayOfWeek = date.getDay()

        // Get default availability for this day of week
        const dayAvailability = (defaultAvailability || []).filter(slot => slot.day_of_week === dayOfWeek)
        
        // Check for exceptions on this date
        const dateExceptions = (exceptions || []).filter(ex => ex.exception_date === dateString)
        
        // Process time slots
        const timeSlots: TimeSlot[] = dayAvailability.map(slot => ({
          start_time: slot.start_time,
          end_time: slot.end_time,
          is_available: slot.is_available,
          exception_type: undefined
        }))

        // Apply exceptions
        dateExceptions.forEach(exception => {
          if (exception.exception_type === 'manual') {
            // Manual exceptions override default availability
            const existingSlotIndex = timeSlots.findIndex(slot => 
              slot.start_time === exception.start_time && slot.end_time === exception.end_time
            )
            
            if (existingSlotIndex >= 0) {
              timeSlots[existingSlotIndex].is_available = exception.is_available
              timeSlots[existingSlotIndex].exception_type = 'manual'
            } else if (exception.is_available) {
              // Add new available slot
              timeSlots.push({
                start_time: exception.start_time,
                end_time: exception.end_time,
                is_available: true,
                exception_type: 'manual'
              })
            }
          }
        })

        if (timeSlots.length > 0) {
          availabilityData.push({
            availability_date: dateString,
            day_of_week: dayOfWeek,
            time_slots: timeSlots
          })
        }
      }

      setAvailability(availabilityData)
    } catch (err: any) {
      console.error('Error loading all availability:', err)
      setError(err.message || 'Failed to load availability')
    } finally {
      setLoading(false)
    }
  }

  const loadAvailability = async () => {
    if (!selectedDate) return

    try {
      setLoading(true)
      setError(null)

      // Get the day of week for the selected date (0=Sunday, 1=Monday, etc.)
      const selectedDateObj = new Date(selectedDate)
      const dayOfWeek = selectedDateObj.getDay()

      // Query default availability for this day of week
      const { data: defaultAvailability, error: defaultError } = await supabase
        .from('facility_default_availability')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true)

      if (defaultError) {
        console.error('Error loading default availability:', defaultError)
        setError('Failed to load availability')
        return
      }

      console.log('Loaded default availability:', defaultAvailability)

      // Check for exceptions on this specific date
      const { data: exceptions, error: exceptionsError } = await supabase
        .from('facility_availability_exceptions')
        .select('*')
        .eq('facility_id', facilityId)
        .eq('exception_date', selectedDate)

      if (exceptionsError) {
        console.error('Error loading availability exceptions:', exceptionsError)
        // Continue without exceptions
      }

      // Process the availability data
      const timeSlots = (defaultAvailability || []).map(slot => ({
        start_time: slot.start_time,
        end_time: slot.end_time,
        is_available: slot.is_available,
        exception_type: undefined
      }))

      // Apply exceptions
      if (exceptions && exceptions.length > 0) {
        exceptions.forEach(exception => {
          if (exception.start_time === null && exception.end_time === null) {
            // All day exception - mark all slots as per exception
            timeSlots.forEach(slot => {
              slot.is_available = exception.is_available
              slot.exception_type = exception.exception_type || undefined
            })
          } else {
            // Specific time exception - find overlapping slots
            timeSlots.forEach(slot => {
              if (slot.start_time >= exception.start_time && slot.end_time <= exception.end_time) {
                slot.is_available = exception.is_available
                slot.exception_type = exception.exception_type || undefined
              }
            })
          }
        })
      }

      const availabilityData = [{
        availability_date: selectedDate,
        day_of_week: dayOfWeek,
        time_slots: timeSlots
      }]

      console.log('Final availability data:', availabilityData)
      setAvailability(availabilityData)
    } catch (err) {
      console.error('Error:', err)
      setError('Failed to load availability')
    } finally {
      setLoading(false)
    }
  }

  // Generate time slots based on availability and increment
  const generateTimeSlots = (availabilityData: AvailabilityData) => {
    if (!availabilityData.time_slots || availabilityData.time_slots.length === 0) {
      return []
    }

    const slots: (TimeSlot & { display: string; value: string })[] = []

    availabilityData.time_slots.forEach(slot => {
      if (!slot.is_available) return

      const startTime = new Date(`2000-01-01T${slot.start_time}`)
      const endTime = new Date(`2000-01-01T${slot.end_time}`)
      
      // Generate slots based on increment
      let currentTime = new Date(startTime)
      while (currentTime < endTime) {
        const nextTime = new Date(currentTime)
        nextTime.setMinutes(currentTime.getMinutes() + availabilityIncrement)
        
        if (nextTime <= endTime) {
          const timeString = currentTime.toTimeString().slice(0, 5)
          const endTimeString = nextTime.toTimeString().slice(0, 5)
          
          slots.push({
            start_time: timeString,
            end_time: endTimeString,
            is_available: true,
            display: formatTime(timeString),
            value: timeString
          })
        }
        
        currentTime = nextTime
      }
    })

    return slots
  }

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
    return `${displayHour}:${minutes} ${ampm}`
  }

  const calculateTotalPrice = () => {
    if (!selectedTimeSlot) return 0
    
    const hours = duration / 60
    if (priceUnit === 'hour') {
      return price * hours
    } else if (priceUnit === 'day') {
      return price
    }
    return price
  }

  const handleDateSelect = (date: string) => {
    setSelectedDate(date)
    setSelectedTimeSlot(null)
    setBookingStep('time')
  }

  const handleTimeSelect = (slot: TimeSlot & { display: string; value: string }) => {
    setSelectedTimeSlot(slot)
    setBookingStep('confirm')
  }

  const handleBookingConfirm = async () => {
    if (!selectedDate || !selectedTimeSlot) return

    // TODO: Implement actual booking logic
    alert(`Booking confirmed!\nDate: ${selectedDate}\nTime: ${selectedTimeSlot.display}\nDuration: ${duration} minutes\nTotal: $${calculateTotalPrice()}`)
  }

  const currentAvailability = availability.find(a => a.availability_date === selectedDate)
  const timeSlots = currentAvailability ? generateTimeSlots(currentAvailability) : []

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 sticky top-8">
      {/* Price Display */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <DollarSign className="w-6 h-6 text-gray-900" />
          <span className="text-2xl font-bold text-gray-900">{price}</span>
          <span className="text-gray-600">/{priceUnit}</span>
        </div>
        {capacity && (
          <div className="flex items-center text-gray-600">
            <Users className="w-4 h-4 mr-1" />
            <span className="text-sm">Up to {capacity}</span>
          </div>
        )}
      </div>

      {/* Booking Steps */}
      <div className="space-y-6">
        {/* Step 1: Date Selection */}
        <div className={`${bookingStep !== 'date' ? 'opacity-50' : ''}`}>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Calendar className="w-4 h-4 inline mr-1" />
            Select Date
          </label>
          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto">
            {dateOptions.map(date => (
              <button
                key={date.value}
                onClick={() => handleDateSelect(date.value)}
                disabled={bookingStep !== 'date'}
                className={`p-2 text-sm rounded-lg border transition-colors ${
                  selectedDate === date.value
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                } ${date.isToday ? 'font-medium' : ''}`}
              >
                {date.label}
                {date.isToday && <span className="block text-xs opacity-75">Today</span>}
              </button>
            ))}
          </div>
        </div>

        {/* Step 2: Time Selection */}
        {selectedDate && (
          <div className={`${bookingStep !== 'time' ? 'opacity-50' : ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Clock className="w-4 h-4 inline mr-1" />
              Start Time
            </label>
            
            {loading ? (
              <div className="text-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                <p className="text-sm text-gray-500 mt-2">Loading availability...</p>
              </div>
            ) : error ? (
              <div className="text-center py-4">
                <AlertCircle className="w-6 h-6 text-red-500 mx-auto mb-2" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            ) : timeSlots.length === 0 ? (
              <div className="text-center py-4">
                <AlertCircle className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                <p className="text-sm text-gray-500">No availability for this date</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-2 max-h-48 overflow-y-auto">
                {timeSlots.map((slot, index) => (
                  <button
                    key={index}
                    onClick={() => handleTimeSelect(slot)}
                    disabled={bookingStep !== 'time'}
                    className={`p-2 text-sm rounded-lg border transition-colors text-left ${
                      selectedTimeSlot?.value === slot.value
                        ? 'bg-primary-600 text-white border-primary-600'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-primary-300'
                    }`}
                  >
                    {slot.display}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 3: Duration & Confirmation */}
        {selectedTimeSlot && (
          <div className={`${bookingStep !== 'confirm' ? 'opacity-50' : ''}`}>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Duration
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(parseInt(e.target.value))}
              disabled={bookingStep !== 'confirm'}
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              {durationOptions.map(mins => (
                <option key={mins} value={mins}>
                  {mins < 60 ? `${mins} minutes` : `${mins / 60} hour${mins > 60 ? 's' : ''}`}
                </option>
              ))}
            </select>

            {/* Booking Summary */}
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Booking Summary</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Date:</span>
                  <span>{new Date(selectedDate).toLocaleDateString()}</span>
                </div>
                <div className="flex justify-between">
                  <span>Time:</span>
                  <span>{selectedTimeSlot.display}</span>
                </div>
                <div className="flex justify-between">
                  <span>Duration:</span>
                  <span>{duration < 60 ? `${duration} min` : `${duration / 60} hr`}</span>
                </div>
                <div className="flex justify-between font-medium text-gray-900 pt-2 border-t">
                  <span>Total:</span>
                  <span>${calculateTotalPrice()}</span>
                </div>
              </div>
            </div>

            <button
              onClick={handleBookingConfirm}
              disabled={bookingStep !== 'confirm'}
              className="w-full btn-primary text-lg py-3 mt-4"
            >
              <CheckCircle className="w-5 h-5 inline mr-2" />
              Confirm Booking
            </button>
          </div>
        )}

        {/* Reset Button */}
        {bookingStep !== 'date' && (
          <button
            onClick={() => {
              setSelectedDate('')
              setSelectedTimeSlot(null)
              setBookingStep('date')
              setDuration(minimumRentalDuration || availabilityIncrement) // Reset duration to minimum
            }}
            className="w-full text-sm text-gray-600 hover:text-gray-800 py-2"
          >
            Start Over
          </button>
        )}
      </div>
    </div>
  )
}