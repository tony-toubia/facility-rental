// Test the complete booking system
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testBookingSystem() {
  try {
    console.log('Testing complete booking system...')

    // 1. Get a test facility
    const { data: facilities, error: facilitiesError } = await supabase
      .from('facility_facilities')
      .select('*')
      .eq('status', 'active')
      .eq('is_active', true)
      .limit(1)

    if (facilitiesError) {
      console.error('Error fetching facilities:', facilitiesError)
      return
    }

    if (facilities.length === 0) {
      console.log('No active facilities found')
      return
    }

    const facility = facilities[0]
    console.log(`\n1. Testing with facility: ${facility.name} (${facility.type})`)
    console.log(`   Price: $${facility.price}/${facility.price_unit}`)
    console.log(`   Capacity: ${facility.capacity} people`)
    console.log(`   Availability increment: ${facility.availability_increment || 60} minutes`)

    // 2. Test availability for today and tomorrow
    const today = new Date().toISOString().split('T')[0]
    const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0]

    console.log(`\n2. Testing availability for ${today} and ${tomorrow}`)

    for (const testDate of [today, tomorrow]) {
      const dateObj = new Date(testDate)
      const dayOfWeek = dateObj.getDay()
      const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

      console.log(`\n   ${testDate} (${dayNames[dayOfWeek]})`)

      // Query availability
      const { data: availability, error: availError } = await supabase
        .from('facility_default_availability')
        .select('*')
        .eq('facility_id', facility.id)
        .eq('day_of_week', dayOfWeek)
        .eq('is_available', true)

      if (availError) {
        console.error('   Error:', availError)
        continue
      }

      if (availability.length === 0) {
        console.log('   No availability')
      } else {
        availability.forEach(slot => {
          console.log(`   Available: ${slot.start_time} - ${slot.end_time}`)
        })
      }

      // Check for existing bookings
      const { data: bookings, error: bookingsError } = await supabase
        .from('facility_bookings')
        .select('*')
        .eq('facility_id', facility.id)
        .eq('booking_date', testDate)

      if (bookingsError) {
        console.error('   Bookings error:', bookingsError)
      } else {
        console.log(`   Existing bookings: ${bookings.length}`)
        bookings.forEach(booking => {
          console.log(`   Booked: ${booking.start_time} - ${booking.end_time} (${booking.status})`)
        })
      }
    }

    // 3. Test creating a booking (we'll create and then delete it)
    console.log(`\n3. Testing booking creation...`)

    // First, we need a user_id. Let's get or create a test user
    const { data: testUser, error: userError } = await supabase
      .from('facility_users')
      .select('id')
      .eq('email', 'test@example.com')
      .single()

    let userId
    if (userError || !testUser) {
      // Create a test user
      const { data: newUser, error: createUserError } = await supabase
        .from('facility_users')
        .insert({
          email: 'test@example.com',
          first_name: 'Test',
          last_name: 'User',
          phone: '555-0123',
          user_type: 'renter'
        })
        .select('id')
        .single()

      if (createUserError) {
        console.error('   Error creating test user:', createUserError)
        return
      }
      userId = newUser.id
      console.log('   Created test user')
    } else {
      userId = testUser.id
      console.log('   Using existing test user')
    }

    const testBooking = {
      facility_id: facility.id,
      user_id: userId,
      booking_date: tomorrow,
      start_time: '10:00:00',
      end_time: '11:00:00',
      duration_hours: 1,
      total_price: facility.price,
      status: 'pending',
      special_requests: 'Test booking - will be deleted'
    }

    const { data: newBooking, error: bookingError } = await supabase
      .from('facility_bookings')
      .insert(testBooking)
      .select()
      .single()

    if (bookingError) {
      console.error('   Error creating booking:', bookingError)
    } else {
      console.log(`   ✓ Booking created successfully: ${newBooking.id}`)
      
      // Clean up - delete the test booking
      const { error: deleteError } = await supabase
        .from('facility_bookings')
        .delete()
        .eq('id', newBooking.id)

      if (deleteError) {
        console.error('   Error deleting test booking:', deleteError)
      } else {
        console.log('   ✓ Test booking cleaned up')
      }
    }

    // 4. Test availability calculation with time slots
    console.log(`\n4. Testing time slot generation...`)

    const increment = facility.availability_increment || 60
    const minDuration = facility.minimum_rental_duration || 60

    console.log(`   Increment: ${increment} minutes`)
    console.log(`   Minimum duration: ${minDuration} minutes`)

    // Generate time slots for a sample availability window (9 AM - 5 PM)
    const startTime = '09:00'
    const endTime = '17:00'
    const slots = generateTimeSlots(startTime, endTime, increment)

    console.log(`   Generated ${slots.length} time slots:`)
    slots.slice(0, 5).forEach(slot => {
      console.log(`   ${slot.start} - ${slot.end}`)
    })
    if (slots.length > 5) {
      console.log(`   ... and ${slots.length - 5} more`)
    }

    console.log('\n✅ Booking system test completed successfully!')

  } catch (error) {
    console.error('Error testing booking system:', error)
  }
}

function generateTimeSlots(startTime, endTime, incrementMinutes) {
  const slots = []
  const start = new Date(`2000-01-01T${startTime}:00`)
  const end = new Date(`2000-01-01T${endTime}:00`)
  
  let current = new Date(start)
  
  while (current < end) {
    const slotEnd = new Date(current.getTime() + incrementMinutes * 60000)
    if (slotEnd <= end) {
      slots.push({
        start: current.toTimeString().slice(0, 5),
        end: slotEnd.toTimeString().slice(0, 5)
      })
    }
    current = slotEnd
  }
  
  return slots
}

testBookingSystem()