import { supabase } from '../lib/supabase'

async function populateTestData() {
  console.log('🚀 Starting test data population...')

  try {
    // 1. Create test users
    console.log('📝 Creating test users...')
    
    const testUsers = [
      {
        auth_user_id: 'd5ceb263-2c16-4053-b5b8-b1a488856bab', // This matches the auth ID from logs
        first_name: 'John',
        last_name: 'Doe',
        email: 'john.doe@example.com',
        phone: '+1234567890',
        user_type: 'owner' as const,
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        country: 'USA',
        is_verified: true
      },
      {
        auth_user_id: null,
        first_name: 'Jane',
        last_name: 'Smith',
        email: 'jane.smith@example.com',
        phone: '+1234567891',
        user_type: 'owner' as const,
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90210',
        country: 'USA',
        is_verified: true
      },
      {
        auth_user_id: null,
        first_name: 'Mike',
        last_name: 'Johnson',
        email: 'mike.johnson@example.com',
        phone: '+1234567892',
        user_type: 'renter' as const,
        city: 'Chicago',
        state: 'IL',
        zip_code: '60601',
        country: 'USA',
        is_verified: true
      }
    ]

    const { data: users, error: usersError } = await supabase
      .from('facility_users')
      .insert(testUsers)
      .select()

    if (usersError) {
      console.error('❌ Error creating users:', usersError)
      return
    }

    console.log('✅ Created users:', users?.length)

    // 2. Create facility categories
    console.log('📝 Creating facility categories...')
    
    const categories = [
      {
        name: 'Conference Rooms',
        description: 'Professional meeting and conference spaces',
        icon_name: 'building',
        color: '#3B82F6',
        is_active: true,
        sort_order: 1
      },
      {
        name: 'Event Halls',
        description: 'Large spaces for events and celebrations',
        icon_name: 'calendar',
        color: '#10B981',
        is_active: true,
        sort_order: 2
      },
      {
        name: 'Sports Facilities',
        description: 'Athletic and recreational facilities',
        icon_name: 'activity',
        color: '#F59E0B',
        is_active: true,
        sort_order: 3
      },
      {
        name: 'Studios',
        description: 'Creative and production spaces',
        icon_name: 'camera',
        color: '#EF4444',
        is_active: true,
        sort_order: 4
      }
    ]

    const { data: categoriesData, error: categoriesError } = await supabase
      .from('facility_categories')
      .insert(categories)
      .select()

    if (categoriesError) {
      console.error('❌ Error creating categories:', categoriesError)
      return
    }

    console.log('✅ Created categories:', categoriesData?.length)

    // 3. Create test facilities
    console.log('📝 Creating test facilities...')
    
    const facilities = [
      {
        owner_id: users![0].id,
        category_id: categoriesData![0].id,
        name: 'Downtown Conference Center',
        type: 'Conference Room',
        description: 'Modern conference room in the heart of downtown with state-of-the-art AV equipment and high-speed internet.',
        address: '123 Business Ave',
        city: 'New York',
        state: 'NY',
        zip_code: '10001',
        country: 'USA',
        latitude: 40.7128,
        longitude: -74.0060,
        price: 150,
        price_unit: 'hour' as const,
        capacity: 20,
        min_booking_duration: 60,
        max_booking_duration: 480,
        advance_booking_days: 30,
        cancellation_policy: '24 hours notice required for full refund',
        house_rules: 'No smoking, no food or drinks except water',
        status: 'active' as const,
        is_active: true,
        is_featured: true
      },
      {
        owner_id: users![1].id,
        category_id: categoriesData![1].id,
        name: 'Grand Ballroom',
        type: 'Event Hall',
        description: 'Elegant ballroom perfect for weddings, corporate events, and celebrations. Features crystal chandeliers and a dance floor.',
        address: '456 Celebration Blvd',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90210',
        country: 'USA',
        latitude: 34.0522,
        longitude: -118.2437,
        price: 500,
        price_unit: 'day' as const,
        capacity: 200,
        min_booking_duration: 240,
        max_booking_duration: 720,
        advance_booking_days: 60,
        cancellation_policy: '7 days notice required for full refund',
        house_rules: 'Professional event management required for events over 100 people',
        status: 'active' as const,
        is_active: true,
        is_featured: true
      },
      {
        owner_id: users![0].id,
        category_id: categoriesData![2].id,
        name: 'Fitness Studio Pro',
        type: 'Fitness Studio',
        description: 'Fully equipped fitness studio with mirrors, sound system, and professional lighting. Perfect for classes and personal training.',
        address: '789 Fitness Way',
        city: 'New York',
        state: 'NY',
        zip_code: '10002',
        country: 'USA',
        latitude: 40.7589,
        longitude: -73.9851,
        price: 75,
        price_unit: 'hour' as const,
        capacity: 30,
        min_booking_duration: 60,
        max_booking_duration: 240,
        advance_booking_days: 14,
        cancellation_policy: '2 hours notice required',
        house_rules: 'Clean equipment after use, no street shoes on mats',
        status: 'active' as const,
        is_active: true,
        is_featured: false
      },
      {
        owner_id: users![1].id,
        category_id: categoriesData![3].id,
        name: 'Creative Studio Space',
        type: 'Photo Studio',
        description: 'Professional photography and video studio with lighting equipment, backdrops, and editing station.',
        address: '321 Creative St',
        city: 'Los Angeles',
        state: 'CA',
        zip_code: '90211',
        country: 'USA',
        latitude: 34.0736,
        longitude: -118.4004,
        price: 100,
        price_unit: 'hour' as const,
        capacity: 10,
        min_booking_duration: 120,
        max_booking_duration: 480,
        advance_booking_days: 21,
        cancellation_policy: '24 hours notice required',
        house_rules: 'Handle equipment with care, clean up after shoots',
        status: 'active' as const,
        is_active: true,
        is_featured: false
      }
    ]

    const { data: facilitiesData, error: facilitiesError } = await supabase
      .from('facility_facilities')
      .insert(facilities)
      .select()

    if (facilitiesError) {
      console.error('❌ Error creating facilities:', facilitiesError)
      return
    }

    console.log('✅ Created facilities:', facilitiesData?.length)

    // 4. Create amenities and features
    console.log('📝 Creating amenities and features...')
    
    const amenities = [
      { name: 'WiFi', icon_name: 'wifi' },
      { name: 'Parking', icon_name: 'car' },
      { name: 'Air Conditioning', icon_name: 'wind' },
      { name: 'Kitchen', icon_name: 'chef-hat' },
      { name: 'Restrooms', icon_name: 'home' },
      { name: 'Wheelchair Accessible', icon_name: 'accessibility' }
    ]

    const { data: amenitiesData, error: amenitiesError } = await supabase
      .from('facility_amenities')
      .insert(amenities)
      .select()

    if (amenitiesError) {
      console.error('❌ Error creating amenities:', amenitiesError)
      return
    }

    const features = [
      { name: 'Projector', icon_name: 'monitor' },
      { name: 'Sound System', icon_name: 'volume-2' },
      { name: 'Whiteboard', icon_name: 'edit-3' },
      { name: 'Video Conferencing', icon_name: 'video' },
      { name: 'Catering Available', icon_name: 'utensils' },
      { name: '24/7 Access', icon_name: 'clock' }
    ]

    const { data: featuresData, error: featuresError } = await supabase
      .from('facility_features')
      .insert(features)
      .select()

    if (featuresError) {
      console.error('❌ Error creating features:', featuresError)
      return
    }

    console.log('✅ Created amenities:', amenitiesData?.length)
    console.log('✅ Created features:', featuresData?.length)

    // 5. Link facilities with amenities and features
    console.log('📝 Linking facilities with amenities and features...')
    
    const facilityAmenities = []
    const facilityFeatures = []

    facilitiesData?.forEach((facility, index) => {
      // Add 3-4 random amenities per facility
      const amenityCount = 3 + Math.floor(Math.random() * 2)
      const selectedAmenities = amenitiesData?.slice(0, amenityCount) || []
      
      selectedAmenities.forEach(amenity => {
        facilityAmenities.push({
          facility_id: facility.id,
          amenity_id: amenity.id
        })
      })

      // Add 2-3 random features per facility
      const featureCount = 2 + Math.floor(Math.random() * 2)
      const selectedFeatures = featuresData?.slice(0, featureCount) || []
      
      selectedFeatures.forEach(feature => {
        facilityFeatures.push({
          facility_id: facility.id,
          feature_id: feature.id
        })
      })
    })

    if (facilityAmenities.length > 0) {
      const { error: facilityAmenitiesError } = await supabase
        .from('facility_facility_amenities')
        .insert(facilityAmenities)

      if (facilityAmenitiesError) {
        console.error('❌ Error linking facility amenities:', facilityAmenitiesError)
      } else {
        console.log('✅ Linked facility amenities:', facilityAmenities.length)
      }
    }

    if (facilityFeatures.length > 0) {
      const { error: facilityFeaturesError } = await supabase
        .from('facility_facility_features')
        .insert(facilityFeatures)

      if (facilityFeaturesError) {
        console.error('❌ Error linking facility features:', facilityFeaturesError)
      } else {
        console.log('✅ Linked facility features:', facilityFeatures.length)
      }
    }

    // 6. Create sample images
    console.log('📝 Creating sample images...')
    
    const sampleImages = []
    facilitiesData?.forEach((facility, index) => {
      // Add 2-3 images per facility
      const imageCount = 2 + Math.floor(Math.random() * 2)
      for (let i = 0; i < imageCount; i++) {
        sampleImages.push({
          facility_id: facility.id,
          image_url: `https://images.unsplash.com/photo-${1500000000000 + index * 1000 + i}?w=800&h=600&fit=crop`,
          alt_text: `${facility.name} - Image ${i + 1}`,
          is_primary: i === 0
        })
      }
    })

    if (sampleImages.length > 0) {
      const { error: imagesError } = await supabase
        .from('facility_images')
        .insert(sampleImages)

      if (imagesError) {
        console.error('❌ Error creating images:', imagesError)
      } else {
        console.log('✅ Created images:', sampleImages.length)
      }
    }

    // 7. Create availability data
    console.log('📝 Creating availability data...')
    
    const availabilityData = []
    facilitiesData?.forEach(facility => {
      // Create availability for each day of the week
      for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek++) {
        availabilityData.push({
          facility_id: facility.id,
          day_of_week: dayOfWeek,
          start_time: '09:00',
          end_time: '18:00',
          is_available: true,
          timezone: 'America/New_York'
        })
      }
    })

    if (availabilityData.length > 0) {
      const { error: availabilityError } = await supabase
        .from('facility_availability')
        .insert(availabilityData)

      if (availabilityError) {
        console.error('❌ Error creating availability:', availabilityError)
      } else {
        console.log('✅ Created availability records:', availabilityData.length)
      }
    }

    console.log('🎉 Test data population completed successfully!')
    console.log('📊 Summary:')
    console.log(`   - Users: ${users?.length || 0}`)
    console.log(`   - Categories: ${categoriesData?.length || 0}`)
    console.log(`   - Facilities: ${facilitiesData?.length || 0}`)
    console.log(`   - Amenities: ${amenitiesData?.length || 0}`)
    console.log(`   - Features: ${featuresData?.length || 0}`)
    console.log(`   - Images: ${sampleImages.length}`)
    console.log(`   - Availability: ${availabilityData.length}`)

  } catch (error) {
    console.error('💥 Error populating test data:', error)
  }
}

// Run the script
populateTestData()