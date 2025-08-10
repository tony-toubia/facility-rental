# FacilityRent - Sports & Recreation Facility Rental Platform

A modern Next.js application that connects facility owners with people looking to rent sports and recreation spaces.

## Features

### For Renters
- **Browse Facilities**: Search and filter facilities by type, location, price, and availability
- **Detailed Listings**: View comprehensive facility information, photos, amenities, and reviews
- **Easy Booking**: Select dates and times with real-time availability
- **Secure Payments**: Safe and encrypted payment processing
- **Reviews & Ratings**: Read and leave reviews for facilities

### For Facility Owners
- **List Your Space**: Easy-to-use form to list your facility
- **Manage Bookings**: Track reservations and availability
- **Pricing Control**: Set your own rates and availability
- **Photo Gallery**: Upload multiple photos to showcase your space
- **Customer Communication**: Direct messaging with renters

### Facility Types Supported
- Gyms & Fitness Centers
- Swimming Pools
- Basketball Courts
- Tennis Courts
- Soccer Fields
- Baseball Fields
- Volleyball Courts
- Dance Studios
- Yoga Studios
- Event Spaces
- Meeting Rooms

## Technology Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Image Handling**: Next.js Image Optimization
- **Responsive Design**: Mobile-first approach

## Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd facility-rental
```

2. Install dependencies:
```bash
npm install
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
facility-rental/
├── app/                    # Next.js 13+ app directory
│   ├── browse/            # Browse facilities page
│   ├── facility/[id]/     # Individual facility details
│   ├── list-facility/     # List a new facility
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx          # Home page
├── components/            # Reusable React components
│   ├── Header.tsx        # Navigation header
│   ├── Footer.tsx        # Site footer
│   ├── Hero.tsx          # Homepage hero section
│   ├── Categories.tsx    # Facility categories
│   ├── FeaturedFacilities.tsx
│   └── HowItWorks.tsx    # Process explanation
├── public/               # Static assets
└── styles/              # Additional stylesheets
```

## Key Components

### Header
- Responsive navigation with mobile menu
- Search functionality
- User authentication links

### Hero Section
- Prominent search form
- Location and date selection
- Statistics display

### Categories
- Visual facility type browsing
- Quick access to filtered results

### Featured Facilities
- Showcase popular venues
- Rating and pricing display
- Quick booking access

### Browse Page
- Advanced filtering options
- Grid and list view modes
- Real-time search results

### Facility Details
- Image gallery with navigation
- Comprehensive facility information
- Booking interface with time slots
- Reviews and ratings
- Owner information

### List Facility
- Multi-step form for facility owners
- Image upload functionality
- Amenities and features selection
- Pricing and availability setup

## Styling

The application uses Tailwind CSS with a custom design system:

- **Primary Colors**: Blue theme with yellow accents
- **Typography**: Inter font family
- **Components**: Reusable button and form styles
- **Responsive**: Mobile-first design approach

## Future Enhancements

- User authentication and profiles
- Payment integration (Stripe/PayPal)
- Real-time messaging system
- Calendar integration
- Mobile app development
- Advanced search with maps
- Booking management dashboard
- Analytics and reporting
- Multi-language support

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.