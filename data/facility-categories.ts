export interface FacilityCategory {
  id: string
  name: string
  description: string
  parentCategory?: string
  searchKeywords: string[]
}

export const FACILITY_CATEGORIES: FacilityCategory[] = [
  // Court Sports
  {
    id: 'basketball',
    name: 'Basketball',
    description: 'Indoor and outdoor basketball courts',
    parentCategory: 'court-sports',
    searchKeywords: ['basketball', 'court', 'hoop', 'gym']
  },
  {
    id: 'volleyball-indoor',
    name: 'Indoor Volleyball',
    description: 'Indoor volleyball courts with nets',
    parentCategory: 'court-sports',
    searchKeywords: ['volleyball', 'indoor', 'court', 'net', 'gym']
  },
  {
    id: 'volleyball-outdoor',
    name: 'Outdoor Volleyball',
    description: 'Beach or outdoor volleyball courts',
    parentCategory: 'court-sports',
    searchKeywords: ['volleyball', 'outdoor', 'beach', 'sand', 'court']
  },
  {
    id: 'tennis',
    name: 'Tennis',
    description: 'Tennis courts indoor or outdoor',
    parentCategory: 'court-sports',
    searchKeywords: ['tennis', 'court', 'racquet', 'net']
  },
  {
    id: 'pickleball',
    name: 'Pickleball',
    description: 'Pickleball courts',

    parentCategory: 'court-sports',
    searchKeywords: ['pickleball', 'paddle', 'court']
  },
  {
    id: 'badminton',
    name: 'Badminton',
    description: 'Badminton courts',

    parentCategory: 'court-sports',
    searchKeywords: ['badminton', 'shuttlecock', 'court', 'racquet']
  },
  {
    id: 'squash',
    name: 'Squash',
    description: 'Squash courts',

    parentCategory: 'court-sports',
    searchKeywords: ['squash', 'court', 'racquetball']
  },

  // Field Sports
  {
    id: 'soccer',
    name: 'Soccer/Football',
    description: 'Soccer fields and futsal courts',

    parentCategory: 'field-sports',
    searchKeywords: ['soccer', 'football', 'futsal', 'field', 'pitch']
  },
  {
    id: 'american-football',
    name: 'American Football',
    description: 'Football fields',

    parentCategory: 'field-sports',
    searchKeywords: ['football', 'field', 'gridiron']
  },
  {
    id: 'baseball',
    name: 'Baseball',
    description: 'Baseball diamonds and fields',

    parentCategory: 'field-sports',
    searchKeywords: ['baseball', 'diamond', 'field', 'batting']
  },
  {
    id: 'softball',
    name: 'Softball',
    description: 'Softball fields',

    parentCategory: 'field-sports',
    searchKeywords: ['softball', 'field', 'diamond']
  },
  {
    id: 'lacrosse',
    name: 'Lacrosse',
    description: 'Lacrosse fields',

    parentCategory: 'field-sports',
    searchKeywords: ['lacrosse', 'field']
  },
  {
    id: 'field-hockey',
    name: 'Field Hockey',
    description: 'Field hockey pitches',
    parentCategory: 'field-sports',
    searchKeywords: ['field hockey', 'hockey', 'pitch']
  },

  // Track & Field
  {
    id: 'track',
    name: 'Track & Field',
    description: 'Running tracks and field event areas',
    parentCategory: 'track-field',
    searchKeywords: ['track', 'running', 'athletics', 'field events']
  },

  // Aquatic Sports
  {
    id: 'swimming-pool',
    name: 'Swimming Pool',
    description: 'Swimming pools for laps, training, or recreation',
    parentCategory: 'aquatic',
    searchKeywords: ['swimming', 'pool', 'aquatic', 'water']
  },
  {
    id: 'diving-pool',
    name: 'Diving Pool',
    description: 'Pools with diving boards or platforms',
    parentCategory: 'aquatic',
    searchKeywords: ['diving', 'pool', 'platform', 'board']
  },

  // Fitness & Training
  {
    id: 'gym-fitness',
    name: 'Fitness Gym',
    description: 'Weight rooms and fitness centers',
    parentCategory: 'fitness',
    searchKeywords: ['gym', 'fitness', 'weights', 'cardio', 'training']
  },
  {
    id: 'dance-studio',
    name: 'Dance Studio',
    description: 'Dance and movement studios',
    parentCategory: 'fitness',
    searchKeywords: ['dance', 'studio', 'movement', 'choreography']
  },
  {
    id: 'martial-arts',
    name: 'Martial Arts',
    description: 'Martial arts dojos and training spaces',
    parentCategory: 'fitness',
    searchKeywords: ['martial arts', 'dojo', 'karate', 'judo', 'taekwondo']
  },
  {
    id: 'yoga-studio',
    name: 'Yoga Studio',
    description: 'Yoga and meditation spaces',
    parentCategory: 'fitness',
    searchKeywords: ['yoga', 'meditation', 'studio', 'wellness']
  },

  // Multi-Purpose
  {
    id: 'gymnasium',
    name: 'Multi-Purpose Gymnasium',
    description: 'Large gym spaces that can accommodate multiple sports',
    parentCategory: 'multi-purpose',
    searchKeywords: ['gymnasium', 'gym', 'multi-purpose', 'sports hall']
  },
  {
    id: 'community-center',
    name: 'Community Center',
    description: 'Community centers with various activity spaces',
    parentCategory: 'multi-purpose',
    searchKeywords: ['community center', 'recreation center', 'multi-use']
  },
  {
    id: 'event-hall',
    name: 'Event Hall',
    description: 'Large halls for events, tournaments, or gatherings',
    parentCategory: 'multi-purpose',
    searchKeywords: ['event hall', 'banquet', 'conference', 'meeting']
  },

  // Outdoor Recreation
  {
    id: 'park-field',
    name: 'Park Field',
    description: 'Open park fields for various activities',
    parentCategory: 'outdoor',
    searchKeywords: ['park', 'field', 'outdoor', 'recreation']
  },
  {
    id: 'playground',
    name: 'Playground',
    description: 'Playgrounds and play areas',
    parentCategory: 'outdoor',
    searchKeywords: ['playground', 'play area', 'children', 'kids']
  },

  // Specialized Sports
  {
    id: 'ice-rink',
    name: 'Ice Rink',
    description: 'Ice skating and hockey rinks',
    parentCategory: 'specialized',
    searchKeywords: ['ice rink', 'hockey', 'skating', 'ice']
  },
  {
    id: 'bowling',
    name: 'Bowling Alley',
    description: 'Bowling lanes',
    parentCategory: 'specialized',
    searchKeywords: ['bowling', 'lanes', 'alley']
  },
  {
    id: 'golf',
    name: 'Golf Course/Range',
    description: 'Golf courses and driving ranges',
    parentCategory: 'specialized',
    searchKeywords: ['golf', 'course', 'driving range', 'putting']
  }
]

export const PARENT_CATEGORIES = [
  { id: 'court-sports', name: 'Court Sports' },
  { id: 'field-sports', name: 'Field Sports' },
  { id: 'track-field', name: 'Track & Field' },
  { id: 'aquatic', name: 'Aquatic Sports' },
  { id: 'fitness', name: 'Fitness & Training' },
  { id: 'multi-purpose', name: 'Multi-Purpose' },
  { id: 'outdoor', name: 'Outdoor Recreation' },
  { id: 'specialized', name: 'Specialized Sports' }
]