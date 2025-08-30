const { createClient } = require('@supabase/supabase-js')
const { faker } = require('@faker-js/faker')

// Supabase configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Midwest cities with coordinates
const midwestCities = [
  // Illinois
  { city: 'Chicago', state: 'IL', lat: 41.8781, lng: -87.6298 },
  { city: 'Aurora', state: 'IL', lat: 41.7606, lng: -88.3201 },
  { city: 'Rockford', state: 'IL', lat: 42.2711, lng: -89.0940 },
  { city: 'Joliet', state: 'IL', lat: 41.5250, lng: -88.0817 },
  { city: 'Naperville', state: 'IL', lat: 41.7508, lng: -88.1535 },
  { city: 'Springfield', state: 'IL', lat: 39.7817, lng: -89.6501 },
  { city: 'Peoria', state: 'IL', lat: 40.6936, lng: -89.5890 },
  
  // Indiana
  { city: 'Indianapolis', state: 'IN', lat: 39.7684, lng: -86.1581 },
  { city: 'Fort Wayne', state: 'IN', lat: 41.0793, lng: -85.1394 },
  { city: 'Evansville', state: 'IN', lat: 37.9716, lng: -87.5710 },
  { city: 'South Bend', state: 'IN', lat: 41.6764, lng: -86.2520 },
  { city: 'Carmel', state: 'IN', lat: 39.9784, lng: -86.1180 },
  
  // Ohio
  { city: 'Columbus', state: 'OH', lat: 39.9612, lng: -82.9988 },
  { city: 'Cleveland', state: 'OH', lat: 41.4993, lng: -81.6944 },
  { city: 'Cincinnati', state: 'OH', lat: 39.1031, lng: -84.5120 },
  { city: 'Toledo', state: 'OH', lat: 41.6528, lng: -83.5379 },
  { city: 'Akron', state: 'OH', lat: 41.0814, lng: -81.5190 },
  { city: 'Dayton', state: 'OH', lat: 39.7589, lng: -84.1916 },
  
  // Michigan
  { city: 'Detroit', state: 'MI', lat: 42.3314, lng: -83.0458 },
  { city: 'Grand Rapids', state: 'MI', lat: 42.9634, lng: -85.6681 },
  { city: 'Warren', state: 'MI', lat: 42.5145, lng: -83.0146 },
  { city: 'Sterling Heights', state: 'MI', lat: 42.5803, lng: -83.0302 },
  { city: 'Ann Arbor', state: 'MI', lat: 42.2808, lng: -83.7430 },
  { city: 'Lansing', state: 'MI', lat: 42.3543, lng: -84.9551 },
  
  // Wisconsin
  { city: 'Milwaukee', state: 'WI', lat: 43.0389, lng: -87.9065 },
  { city: 'Madison', state: 'WI', lat: 43.0731, lng: -89.4012 },
  { city: 'Green Bay', state: 'WI', lat: 44.5133, lng: -88.0133 },
  { city: 'Kenosha', state: 'WI', lat: 42.5847, lng: -87.8212 },
  { city: 'Racine', state: 'WI', lat: 42.7261, lng: -87.7829 },
  
  // Minnesota
  { city: 'Minneapolis', state: 'MN', lat: 44.9778, lng: -93.2650 },
  { city: 'Saint Paul', state: 'MN', lat: 44.9537, lng: -93.0900 },
  { city: 'Rochester', state: 'MN', lat: 44.0121, lng: -92.4802 },
  { city: 'Duluth', state: 'MN', lat: 46.7867, lng: -92.1005 },
  { city: 'Bloomington', state: 'MN', lat: 44.8408, lng: -93.2982 },
  
  // Iowa
  { city: 'Des Moines', state: 'IA', lat: 41.5868, lng: -93.6250 },
  { city: 'Cedar Rapids', state: 'IA', lat: 41.9778, lng: -91.6656 },
  { city: 'Davenport', state: 'IA', lat: 41.5236, lng: -90.5776 },
  { city: 'Sioux City', state: 'IA', lat: 42.4999, lng: -96.4003 },
  { city: 'Iowa City', state: 'IA', lat: 41.6611, lng: -91.5302 },
  
  // Missouri
  { city: 'Kansas City', state: 'MO', lat: 39.0997, lng: -94.5786 },
  { city: 'Saint Louis', state: 'MO', lat: 38.6270, lng: -90.1994 },
  { city: 'Springfield', state: 'MO', lat: 37.2153, lng: -93.2982 },
  { city: 'Columbia', state: 'MO', lat: 38.9517, lng: -92.3341 },
  { city: 'Independence', state: 'MO', lat: 39.0911, lng: -94.4155 },
  
  // Nebraska
  { city: 'Omaha', state: 'NE', lat: 41.2565, lng: -95.9345 },
  { city: 'Lincoln', state: 'NE', lat: 40.8136, lng: -96.7026 },
  { city: 'Bellevue', state: 'NE', lat: 41.1370, lng: -95.9145 },
  
  // Kansas
  { city: 'Wichita', state: 'KS', lat: 37.6872, lng: -97.3301 },
  { city: 'Overland Park', state: 'KS', lat: 38.9822, lng: -94.6708 },
  { city: 'Kansas City', state: 'KS', lat: 39.1142, lng: -94.6275 },
  { city: 'Topeka', state: 'KS', lat: 39.0473, lng: -95.6890 },
  
  // North Dakota
  { city: 'Fargo', state: 'ND', lat: 46.8772, lng: -96.7898 },
  { city: 'Bismarck', state: 'ND', lat: 46.8083, lng: -100.7837 },
  
  // South Dakota
  { city: 'Sioux Falls', state: 'SD', lat: 43.5446, lng: -96.7311 },
  { city: 'Rapid City', state: 'SD', lat: 44.0805, lng: -103.2310 }
]

// Facility categories mapping
const facilityCategories = {
  'basketball': { type: 'Basketball Court', priceRange: [15, 45] },
  'volleyball-indoor': { type: 'Indoor Volleyball Court', priceRange: [20, 50] },
  'volleyball-outdoor': { type: 'Beach Volleyball Court', priceRange: [15, 35] },
  'tennis': { type: 'Tennis Court', priceRange: [25, 60] },
  'pickleball': { type: 'Pickleball Court', priceRange: [15, 40] },
  'badminton': { type: 'Badminton Court', priceRange: [20, 45] },
  'squash': { type: 'Squash Court', priceRange: [30, 70] },
  'soccer': { type: 'Soccer Field', priceRange: [40, 120] },
  'american-football': { type: 'Football Field', priceRange: [60, 200] },
  'baseball': { type: 'Baseball Diamond', priceRange: [50, 150] },
  'softball': { type: 'Softball Field', priceRange: [35, 100] },
  'lacrosse': { type: 'Lacrosse Field', priceRange: [45, 130] },
  'field-hockey': { type: 'Field Hockey Pitch', priceRange: [40, 110] },
  'track': { type: 'Track & Field', priceRange: [30, 80] },
  'swimming-pool': { type: 'Swimming Pool', priceRange: [25, 75] },
  'diving-pool': { type: 'Diving Pool', priceRange: [35, 90] },
  'gym-fitness': { type: 'Fitness Center', priceRange: [20, 60] },
  'dance-studio': { type: 'Dance Studio', priceRange: [25, 65] },
  'martial-arts': { type: 'Martial Arts Dojo', priceRange: [30, 70] },
  'yoga-studio': { type: 'Yoga Studio', priceRange: [20, 55] },
  'gymnasium': { type: 'Multi-Purpose Gymnasium', priceRange: [40, 120] },
  'community-center': { type: 'Community Center', priceRange: [25, 80] },
  'event-hall': { type: 'Event Hall', priceRange: [60, 250] },
  'park-field': { type: 'Park Field', priceRange: [10, 30] },
  'playground': { type: 'Playground', priceRange: [5, 20] },
  'ice-rink': { type: 'Ice Rink', priceRange: [40, 100] },
  'bowling': { type: 'Bowling Alley', priceRange: [20, 50] },
  'golf': { type: 'Golf Course', priceRange: [30, 150] }
}

// Generate random coordinates within a radius of a city
function generateNearbyCoordinates(baseLat, baseLng, radiusMiles = 15) {
  const radiusInDegrees = radiusMiles / 69 // Rough conversion
  const lat = baseLat + (Math.random() - 0.5) * 2 * radiusInDegrees
  const lng = baseLng + (Math.random() - 0.5) * 2 * radiusInDegrees
  return { lat, lng }
}

// Generate facility names
function generateFacilityName(categoryId, city) {
  const categoryData = facilityCategories[categoryId]
  const prefixes = [
    `${city}`, 'Metro', 'Central', 'Elite', 'Premier', 'Community', 'Riverside', 
    'Sunset', 'Oakwood', 'Maple', 'Pine', 'Cedar', 'Willow', 'Heritage',
    'Victory', 'Champions', 'Athletic', 'Sports', 'Fitness', 'Recreation'
  ]
  
  const suffixes = [
    'Center', 'Complex', 'Club', 'Arena', 'Facility', 'Academy', 'Institute',
    'Park', 'Fields', 'Courts', 'Zone', 'Hub', 'Place'
  ]
  
  const prefix = faker.helpers.arrayElement(prefixes)
  const suffix = faker.helpers.arrayElement(suffixes)
  
  return `${prefix} ${suffix}`
}

// Generate facility description
function generateDescription(categoryId) {
  const descriptions = {
    'basketball': [
      'Professional-grade basketball court with regulation hoops and hardwood flooring.',
      'Indoor basketball facility with climate control and spectator seating.',
      'Multi-court basketball complex perfect for games, practice, and tournaments.'
    ],
    'tennis': [
      'Well-maintained tennis courts with professional lighting for evening play.',
      'Clay and hard court tennis facility with pro shop and lessons available.',
      'Championship tennis courts with stadium seating and modern amenities.'
    ],
    'soccer': [
      'Full-size soccer field with natural grass and professional goal posts.',
      'Indoor soccer facility with artificial turf and climate control.',
      'Multi-field soccer complex suitable for leagues and tournaments.'
    ],
    'swimming-pool': [
      'Olympic-size swimming pool with lane markers and diving boards.',
      'Indoor aquatic center with heated pools and modern filtration systems.',
      'Competition-ready swimming facility with spectator areas.'
    ],
    'gym-fitness': [
      'Fully equipped fitness center with modern cardio and strength equipment.',
      'State-of-the-art gym facility with personal training services available.',
      'Complete fitness complex with group exercise rooms and locker facilities.'
    ]
  }
  
  const categoryDescriptions = descriptions[categoryId] || [
    'Modern sports facility with professional-grade equipment and amenities.',
    'Well-maintained recreational facility perfect for training and competition.',
    'Premium sports complex with excellent facilities and customer service.'
  ]
  
  return faker.helpers.arrayElement(categoryDescriptions)
}

// Generate house rules
function generateHouseRules() {
  const rules = [
    'No smoking on premises',
    'Clean up after use',
    'Proper athletic attire required',
    'No outside food or drinks',
    'Respect other users and equipment'
  ]
  
  return faker.helpers.arrayElements(rules, faker.number.int({ min: 2, max: 4 })).join('. ') + '.'
}

// Generate a single facility
function generateFacility(categoryId, city, ownerId) {
  const categoryData = facilityCategories[categoryId]
  const coords = generateNearbyCoordinates(city.lat, city.lng)
  const price = faker.number.int({ 
    min: categoryData.priceRange[0], 
    max: categoryData.priceRange[1] 
  })
  
  return {
    name: generateFacilityName(categoryId, city.city),
    type: categoryData.type,
    description: generateDescription(categoryId),
    address: faker.location.streetAddress(),
    city: city.city,
    state: city.state,
    zip_code: faker.location.zipCode(),
    latitude: coords.lat,
    longitude: coords.lng,
    price: price,
    price_unit: faker.helpers.arrayElement(['hour', 'day', 'session']),
    capacity: faker.number.int({ min: 10, max: 200 }),
    rating: faker.number.float({ min: 3.5, max: 5.0, precision: 0.1 }),
    review_count: faker.number.int({ min: 5, max: 150 }),
    status: 'active',
    house_rules: generateHouseRules(),
    cancellation_policy: 'Cancellations must be made at least 24 hours in advance for full refund.',
    min_booking_duration: faker.number.int({ min: 1, max: 2 }),
    max_booking_duration: faker.number.int({ min: 4, max: 8 }),
    advance_booking_days: faker.number.int({ min: 7, max: 60 }),
    owner_id: ownerId
  }
}

// Main generation function
async function generateFakeFacilities() {
  console.log('Starting facility generation...')
  
  // Get a real user ID to use as owner
  const { data: users, error: userError } = await supabase
    .from('facility_users')
    .select('id')
    .limit(1)
  
  if (userError || !users || users.length === 0) {
    console.error('No users found in database. Please create a user first.')
    return
  }
  
  const ownerId = users[0].id
  console.log('Using owner ID:', ownerId)
  
  const facilities = []
  const categories = Object.keys(facilityCategories)
  
  // Generate 3-8 facilities per city
  for (const city of midwestCities) {
    const facilitiesPerCity = faker.number.int({ min: 3, max: 8 })
    
    for (let i = 0; i < facilitiesPerCity; i++) {
      const categoryId = faker.helpers.arrayElement(categories)
      const facility = generateFacility(categoryId, city, ownerId)
      facilities.push(facility)
    }
  }
  
  console.log(`Generated ${facilities.length} facilities`)
  
  // Insert facilities in batches
  const batchSize = 50
  for (let i = 0; i < facilities.length; i += batchSize) {
    const batch = facilities.slice(i, i + batchSize)
    
    console.log(`Inserting batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(facilities.length / batchSize)}...`)
    
    const { data, error } = await supabase
      .from('facility_facilities')
      .insert(batch)
    
    if (error) {
      console.error('Error inserting batch:', error)
      continue
    }
    
    console.log(`Successfully inserted ${batch.length} facilities`)
  }
  
  console.log('Facility generation complete!')
  
  // Now generate category assignments
  console.log('Generating category assignments...')
  await generateCategoryAssignments()
}

// Generate category assignments for facilities
async function generateCategoryAssignments() {
  // First, get all facilities
  const { data: facilities, error: facilitiesError } = await supabase
    .from('facility_facilities')
    .select('id, type')
  
  if (facilitiesError) {
    console.error('Error fetching facilities:', facilitiesError)
    return
  }
  
  // Get all categories
  const { data: categories, error: categoriesError } = await supabase
    .from('facility_categories')
    .select('category_id, name')
  
  if (categoriesError) {
    console.error('Error fetching categories:', categoriesError)
    return
  }
  
  const assignments = []
  
  for (const facility of facilities) {
    // Find matching category based on facility type
    const matchingCategory = categories.find(cat => 
      facility.type.toLowerCase().includes(cat.name.toLowerCase()) ||
      cat.name.toLowerCase().includes(facility.type.toLowerCase().split(' ')[0])
    )
    
    if (matchingCategory) {
      // Check if assignment already exists
      const existingAssignment = assignments.find(a => 
        a.facility_id === facility.id && a.category_id === matchingCategory.category_id
      )
      
      if (!existingAssignment) {
        // Add primary category assignment
        assignments.push({
          facility_id: facility.id,
          category_id: matchingCategory.category_id,
          is_primary: true
        })
        
        // Sometimes add a secondary category (30% chance)
        if (Math.random() < 0.3) {
          const secondaryCategory = faker.helpers.arrayElement(
            categories.filter(cat => cat.category_id !== matchingCategory.category_id)
          )
          
          const existingSecondary = assignments.find(a => 
            a.facility_id === facility.id && a.category_id === secondaryCategory.category_id
          )
          
          if (!existingSecondary) {
            assignments.push({
              facility_id: facility.id,
              category_id: secondaryCategory.category_id,
              is_primary: false
            })
          }
        }
      }
    }
  }
  
  // Insert category assignments in batches
  const batchSize = 100
  for (let i = 0; i < assignments.length; i += batchSize) {
    const batch = assignments.slice(i, i + batchSize)
    
    console.log(`Inserting category assignment batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(assignments.length / batchSize)}...`)
    
    const { error } = await supabase
      .from('facility_category_assignments')
      .insert(batch)
    
    if (error) {
      console.error('Error inserting category assignments:', error)
      continue
    }
    
    console.log(`Successfully inserted ${batch.length} category assignments`)
  }
  
  console.log('Category assignment generation complete!')
}

// Run the generation
generateFakeFacilities().catch(console.error)