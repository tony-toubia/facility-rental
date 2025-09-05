import { supabase } from './supabase'
import { AvailabilityConfig } from '@/components/AvailabilityConfigurator'

export interface FacilityAvailabilityData {
  facility_id: string
  availability_increment: number
  minimum_rental_duration: number | null
  availability_timezone: string
  availability_notes: string | null
}

export interface DefaultAvailabilitySlot {
  facility_id: string
  day_of_week: number
  start_time: string
  end_time: string
  is_available: boolean
}

export interface SelectedHoliday {
  facility_id: string
  holiday_template_id: string
}

// Map holiday IDs to database IDs (this would come from the database in a real app)
const HOLIDAY_ID_MAP: Record<string, string> = {
  'new-years': 'new-years-day',
  'mlk-day': 'martin-luther-king-jr-day',
  'presidents-day': 'presidents-day',
  'memorial-day': 'memorial-day',
  'independence-day': 'independence-day',
  'labor-day': 'labor-day',
  'columbus-day': 'columbus-day',
  'veterans-day': 'veterans-day',
  'thanksgiving': 'thanksgiving',
  'christmas-eve': 'christmas-eve',
  'christmas': 'christmas-day',
  'new-years-eve': 'new-years-eve'
}

export async function saveFacilityAvailability(
  facilityId: string, 
  config: AvailabilityConfig
): Promise<void> {
  try {
    // 1. Update facility table with availability settings
    const { error: updateError } = await supabase
      .from('facility_facilities')
      .update({
        availability_increment: config.availabilityIncrement,
        minimum_rental_duration: config.minimumRentalDuration,
        availability_timezone: config.timezone,
        availability_notes: config.notes
      })
      .eq('id', facilityId)

    if (updateError) {
      throw new Error(`Failed to update facility availability settings: ${updateError.message}`)
    }

    // 2. Clear existing default availability
    const { error: clearError } = await supabase
      .from('facility_default_availability')
      .delete()
      .eq('facility_id', facilityId)

    if (clearError) {
      throw new Error(`Failed to clear existing availability: ${clearError.message}`)
    }

    // 3. Insert new default availability slots
    const availabilitySlots: DefaultAvailabilitySlot[] = []
    
    config.weeklySchedule.forEach(day => {
      if (day.isAvailable && day.timeSlots.length > 0) {
        day.timeSlots.forEach(slot => {
          availabilitySlots.push({
            facility_id: facilityId,
            day_of_week: day.day,
            start_time: slot.start,
            end_time: slot.end,
            is_available: true
          })
        })
      }
    })

    if (availabilitySlots.length > 0) {
      const { error: slotsError } = await supabase
        .from('facility_default_availability')
        .insert(availabilitySlots)

      if (slotsError) {
        throw new Error(`Failed to save availability slots: ${slotsError.message}`)
      }
    }

    // 4. Clear existing holiday selections
    const { error: clearHolidaysError } = await supabase
      .from('facility_selected_holidays')
      .delete()
      .eq('facility_id', facilityId)

    if (clearHolidaysError) {
      throw new Error(`Failed to clear existing holidays: ${clearHolidaysError.message}`)
    }

    // 5. Get holiday template IDs from database
    if (config.selectedHolidays.length > 0) {
      const holidayNames = config.selectedHolidays.map(id => HOLIDAY_ID_MAP[id] || id)
      
      const { data: holidayTemplates, error: holidayFetchError } = await supabase
        .from('facility_holiday_templates')
        .select('id, name')
        .in('name', holidayNames.map(name => name.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())))

      if (holidayFetchError) {
        throw new Error(`Failed to fetch holiday templates: ${holidayFetchError.message}`)
      }

      // 6. Insert selected holidays
      if (holidayTemplates && holidayTemplates.length > 0) {
        const selectedHolidays: SelectedHoliday[] = holidayTemplates.map(template => ({
          facility_id: facilityId,
          holiday_template_id: template.id
        }))

        const { error: holidaysError } = await supabase
          .from('facility_selected_holidays')
          .insert(selectedHolidays)

        if (holidaysError) {
          throw new Error(`Failed to save selected holidays: ${holidaysError.message}`)
        }
      }
    }

  } catch (error) {
    console.error('Error saving facility availability:', error)
    throw error
  }
}

export async function getFacilityAvailability(facilityId: string): Promise<AvailabilityConfig | null> {
  try {
    // Get facility availability settings
    const { data: facility, error: facilityError } = await supabase
      .from('facility_facilities')
      .select('availability_increment, minimum_rental_duration, availability_timezone, availability_notes')
      .eq('id', facilityId)
      .single()

    if (facilityError) {
      throw new Error(`Failed to fetch facility: ${facilityError.message}`)
    }

    // Get default availability schedule
    const { data: schedule, error: scheduleError } = await supabase
      .from('facility_default_availability')
      .select('day_of_week, start_time, end_time, is_available')
      .eq('facility_id', facilityId)
      .order('day_of_week')

    if (scheduleError) {
      throw new Error(`Failed to fetch schedule: ${scheduleError.message}`)
    }

    // Get selected holidays
    const { data: holidays, error: holidaysError } = await supabase
      .from('facility_selected_holidays')
      .select(`
        holiday_template_id,
        facility_holiday_templates (
          name
        )
      `)
      .eq('facility_id', facilityId)

    if (holidaysError) {
      throw new Error(`Failed to fetch holidays: ${holidaysError.message}`)
    }

    // Build weekly schedule
    const DAYS_OF_WEEK = [
      { day: 1, name: 'Monday' },
      { day: 2, name: 'Tuesday' },
      { day: 3, name: 'Wednesday' },
      { day: 4, name: 'Thursday' },
      { day: 5, name: 'Friday' },
      { day: 6, name: 'Saturday' },
      { day: 0, name: 'Sunday' }
    ]

    const weeklySchedule = DAYS_OF_WEEK.map(day => {
      const daySlots = schedule?.filter(slot => slot.day_of_week === day.day) || []
      return {
        day: day.day,
        dayName: day.name,
        isAvailable: daySlots.length > 0,
        timeSlots: daySlots.map(slot => ({
          start: slot.start_time,
          end: slot.end_time
        }))
      }
    })

    // Map holiday names back to IDs
    const reverseHolidayMap = Object.fromEntries(
      Object.entries(HOLIDAY_ID_MAP).map(([key, value]) => [value, key])
    )

    const selectedHolidays = holidays?.map(h => {
      const holidayName = (h.facility_holiday_templates as any)?.name?.toLowerCase().replace(/\s+/g, '-')
      return reverseHolidayMap[holidayName] || holidayName
    }) || []

    return {
      availabilityIncrement: facility.availability_increment || 30,
      minimumRentalDuration: facility.minimum_rental_duration,
      timezone: facility.availability_timezone || 'America/New_York',
      weeklySchedule,
      selectedHolidays,
      notes: facility.availability_notes
    }

  } catch (error) {
    console.error('Error fetching facility availability:', error)
    return null
  }
}

export async function getAvailabilityTemplates() {
  const { data, error } = await supabase
    .from('facility_availability_templates')
    .select('*')
    .eq('is_system_template', true)
    .order('name')

  if (error) {
    throw new Error(`Failed to fetch availability templates: ${error.message}`)
  }

  return data
}

export async function getHolidayTemplates() {
  const { data, error } = await supabase
    .from('facility_holiday_templates')
    .select('*')
    .eq('is_system_holiday', true)
    .order('holiday_date')

  if (error) {
    throw new Error(`Failed to fetch holiday templates: ${error.message}`)
  }

  return data
}

export async function createAvailabilityException(
  facilityId: string,
  exception: Omit<AvailabilityException, 'id'>
): Promise<void> {
  const { error } = await supabase
    .from('facility_availability_exceptions')
    .insert({
      facility_id: facilityId,
      exception_date: exception.exception_date,
      start_time: exception.start_time || null,
      end_time: exception.end_time || null,
      is_available: exception.is_available,
      exception_type: exception.exception_type,
      notes: exception.notes || null
    })

  if (error) {
    throw new Error(`Failed to create availability exception: ${error.message}`)
  }
}

export async function getAvailabilityExceptions(
  facilityId: string,
  startDate?: string,
  endDate?: string
): Promise<AvailabilityException[]> {
  let query = supabase
    .from('facility_availability_exceptions')
    .select('*')
    .eq('facility_id', facilityId)

  if (startDate) {
    query = query.gte('exception_date', startDate)
  }
  
  if (endDate) {
    query = query.lte('exception_date', endDate)
  }

  const { data, error } = await query.order('exception_date')

  if (error) {
    throw new Error(`Failed to fetch availability exceptions: ${error.message}`)
  }

  return data || []
}

export async function deleteAvailabilityException(exceptionId: string): Promise<void> {
  const { error } = await supabase
    .from('facility_availability_exceptions')
    .delete()
    .eq('id', exceptionId)

  if (error) {
    throw new Error(`Failed to delete availability exception: ${error.message}`)
  }
}

export interface AvailabilityException {
  id?: string
  facility_id?: string
  exception_date: string
  start_time?: string
  end_time?: string
  is_available: boolean
  exception_type: 'manual' | 'holiday' | 'maintenance' | 'recurring'
  recurring_pattern?: string
  recurring_end_date?: string
  notes?: string
  created_at?: string
  updated_at?: string
}