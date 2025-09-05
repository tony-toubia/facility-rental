// Fix facility statuses
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function fixFacilityStatus() {
  try {
    console.log('Checking facility statuses...')

    // First, see what statuses we have
    const { data: facilities, error: facilitiesError } = await supabase
      .from('facility_facilities')
      .select('id, name, status, is_active')
      .limit(10)

    if (facilitiesError) {
      console.error('Error fetching facilities:', facilitiesError)
      return
    }

    console.log('Sample facilities:')
    facilities.forEach(f => {
      console.log(`  ${f.name}: status=${f.status}, is_active=${f.is_active}`)
    })

    // Update facilities with status 'approved' to 'active'
    const { data: updateResult, error: updateError } = await supabase
      .from('facility_facilities')
      .update({
        status: 'active',
        is_active: true
      })
      .eq('status', 'approved')
      .select('id, name')

    if (updateError) {
      console.error('Error updating facilities:', updateError)
    } else {
      console.log('Updated facility statuses')
    }

    // Verify the update
    const { data: verifyFacilities, error: verifyError } = await supabase
      .from('facility_facilities')
      .select('id, name, status, is_active')
      .eq('status', 'active')
      .eq('is_active', true)
      .limit(5)

    if (verifyError) {
      console.error('Error verifying facilities:', verifyError)
    } else {
      console.log(`\nVerification: Found ${verifyFacilities.length} active facilities`)
      verifyFacilities.forEach(f => {
        console.log(`  ${f.name}: status=${f.status}, is_active=${f.is_active}`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  }
}

fixFacilityStatus()