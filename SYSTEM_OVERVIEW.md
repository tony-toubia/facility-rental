# Facility Rental Platform - System Overview

## Table of Contents
1. [System Overview](#system-overview)
2. [Core Capabilities](#core-capabilities)
3. [User Roles & Governance](#user-roles--governance)
4. [Technical Architecture](#technical-architecture)
5. [Database Structure](#database-structure)
6. [API Endpoints](#api-endpoints)
7. [Component Architecture](#component-architecture)
8. [Data Management](#data-management)
9. [Security & Authentication](#security--authentication)
10. [Deployment & Maintenance](#deployment--maintenance)

## System Overview

The Facility Rental Platform is a modern web application that connects facility owners with people looking to rent sports and recreation spaces. Built with Next.js 14, TypeScript, and Supabase, it provides a comprehensive solution for facility booking and management.

### Key Features
- **Multi-tenant facility listings** with detailed information and photos
- **Real-time availability management** with calendar integration
- **Location-based search** using Google Maps API
- **User reviews and ratings** system
- **Admin dashboard** for platform management
- **Responsive design** for mobile and desktop
- **Secure payment processing** (planned)
- **Real-time notifications** (planned)

## Core Capabilities

### For Facility Owners
- **Facility Listing Management**: Create, edit, and manage facility listings
- **Availability Control**: Set custom availability schedules and blocked dates
- **Pricing Management**: Flexible pricing per hour/day/session
- **Photo Gallery**: Upload and manage facility images
- **Booking Management**: Track reservations and customer communication
- **Analytics Dashboard**: View booking statistics and revenue

### For Renters
- **Advanced Search**: Filter by location, type, price, and availability
- **Real-time Availability**: Check current availability and book instantly
- **Secure Booking**: Confirmed reservations with payment processing
- **Review System**: Rate and review facilities after use
- **Booking History**: Track past and upcoming reservations
- **Favorites**: Save preferred facilities for quick access

### For Administrators
- **User Management**: Approve new facility owners and manage accounts
- **Content Moderation**: Review listings and handle disputes
- **Platform Analytics**: Monitor usage, revenue, and performance
- **System Configuration**: Manage categories, pricing, and policies
- **Database Management**: Access to database schema and maintenance tools

## User Roles & Governance

### User Types
1. **Renters**: End users who book facilities
2. **Facility Owners**: Business users who list and manage facilities
3. **Administrators**: Platform operators with full system access

### User Lifecycle
1. **Registration**: Email verification required
2. **Profile Completion**: Required information based on user type
3. **Verification**: Identity and facility verification for owners
4. **Approval Process**: Admin review for new facility listings
5. **Ongoing Management**: Regular activity monitoring

### Governance Policies
- **Content Standards**: Facility listings must meet quality standards
- **User Conduct**: Code of conduct for all platform users
- **Dispute Resolution**: Process for handling booking conflicts
- **Data Privacy**: GDPR/CCPA compliance for user data
- **Payment Security**: PCI compliance for financial transactions

## Technical Architecture

### Frontend Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript for type safety
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React hooks and context
- **Icons**: Lucide React icon library

### Backend Stack
- **Database**: PostgreSQL via Supabase
- **Authentication**: Supabase Auth with email/password
- **File Storage**: Supabase Storage for images
- **Real-time**: Supabase real-time subscriptions
- **API**: RESTful API with Next.js API routes

### External Integrations
- **Google Maps API**: Location services and geocoding
- **Google Places API**: Address autocomplete and validation
- **Payment Processing**: Stripe (planned)
- **Email Service**: Supabase Auth (built-in)

### Infrastructure
- **Hosting**: Vercel for frontend and serverless functions
- **Database**: Supabase managed PostgreSQL
- **CDN**: Vercel CDN for static assets
- **Monitoring**: Vercel Analytics and error tracking

## Database Structure

### Core Tables

#### facility_users
User profiles for all platform users
```sql
- id: UUID (Primary Key)
- auth_user_id: UUID (Supabase Auth reference)
- first_name, last_name: VARCHAR
- email: VARCHAR (unique)
- phone: VARCHAR
- user_type: ENUM ('renter', 'owner', 'admin')
- avatar_url: VARCHAR
- bio: TEXT
- address, city, state, zip_code, country: VARCHAR
- is_verified: BOOLEAN
- rating: DECIMAL
- total_bookings, total_listings: INTEGER
- joined_date, last_active: TIMESTAMP
- created_at, updated_at: TIMESTAMP
```

#### facility_facilities
Main facilities table with comprehensive information
```sql
- id: UUID (Primary Key)
- owner_id: UUID (Foreign Key)
- category_id: UUID (Foreign Key)
- name, type: VARCHAR
- description: TEXT
- address, city, state, zip_code, country: VARCHAR
- latitude, longitude: DECIMAL
- price: DECIMAL
- price_unit: ENUM ('hour', 'day', 'session')
- capacity: INTEGER
- min_booking_duration, max_booking_duration: INTEGER
- advance_booking_days: INTEGER
- cancellation_policy, house_rules: TEXT
- status: ENUM ('active', 'inactive', 'pending_approval', etc.)
- is_active, is_featured: BOOLEAN
- rating: DECIMAL
- review_count, total_bookings, views_count: INTEGER
- created_at, updated_at: TIMESTAMP
```

#### facility_categories
Facility type classifications
```sql
- id: UUID (Primary Key)
- name, description: VARCHAR
- icon_name, color: VARCHAR
- is_active: BOOLEAN
- sort_order: INTEGER
- created_at, updated_at: TIMESTAMP
```

#### facility_availability
Recurring availability schedules
```sql
- facility_id: UUID (Foreign Key)
- day_of_week: INTEGER (0-6)
- start_time, end_time: TIME
- is_available: BOOLEAN
- timezone: VARCHAR
```

#### facility_bookings
Reservation management
```sql
- id: UUID (Primary Key)
- facility_id, user_id: UUID (Foreign Keys)
- booking_date: DATE
- start_time, end_time: TIME
- duration_hours: DECIMAL
- total_price: DECIMAL
- status: ENUM ('pending', 'confirmed', 'cancelled', 'completed')
- special_requests: TEXT
- cancellation_reason: TEXT
- cancelled_at, confirmed_at, completed_at: TIMESTAMP
- created_at, updated_at: TIMESTAMP
```

#### facility_reviews
User feedback system
```sql
- id: UUID (Primary Key)
- facility_id, user_id: UUID (Foreign Keys)
- booking_id: UUID (Foreign Key, nullable)
- rating: INTEGER (1-5)
- comment: TEXT
- is_verified: BOOLEAN
- owner_response: TEXT
- owner_response_date: TIMESTAMP
- created_at, updated_at: TIMESTAMP
```

### Supporting Tables
- **facility_images**: Photo gallery management
- **facility_amenities**: Facility features and amenities
- **facility_features**: Additional facility capabilities
- **facility_blocked_dates**: Specific unavailable dates
- **facility_favorites**: User saved facilities
- **facility_messages**: Communication between users
- **facility_notifications**: System notifications
- **facility_transactions**: Payment records

## API Endpoints

### Public Endpoints
- `GET /api/facilities` - Search and filter facilities
- `GET /api/facilities/[id]` - Get facility details
- `GET /api/categories` - Get facility categories
- `GET /api/reviews/[facilityId]` - Get facility reviews

### Protected Endpoints (Authentication Required)
- `POST /api/facilities` - Create new facility (owners only)
- `PUT /api/facilities/[id]` - Update facility (owner only)
- `POST /api/bookings` - Create booking
- `GET /api/bookings` - Get user bookings
- `POST /api/reviews` - Submit review

### Admin Endpoints
- `GET /api/admin/users` - User management
- `PUT /api/admin/facilities/[id]/status` - Approve/reject facilities
- `GET /api/admin/analytics` - Platform analytics
- `GET /api/database-schema` - Database structure reference

## Component Architecture

### Page Components
- **Home (`/`)**: Landing page with search and featured facilities
- **Browse (`/browse`)**: Facility search and filtering
- **Facility Details (`/facility/[id]`)**: Individual facility page
- **List Facility (`/list-facility`)**: Facility creation form
- **Dashboard (`/dashboard`)**: User dashboard
- **Admin (`/admin`)**: Admin management interface

### Reusable Components
- **Header**: Navigation and user menu
- **Footer**: Site footer with links
- **Hero**: Homepage hero section
- **Categories**: Facility type selector
- **FeaturedFacilities**: Popular facilities display
- **BookingAvailability**: Booking interface
- **LocationAutocomplete**: Address search
- **FacilityLocationPicker**: Location management
- **SearchFilters**: Advanced filtering options

### Layout Components
- **Root Layout**: Main application wrapper
- **Auth Layout**: Authentication pages
- **Admin Layout**: Admin interface wrapper

## Data Management

### Data Flow
1. **User Input** → Component State → API Call
2. **API Response** → State Update → UI Re-render
3. **Database Changes** → Real-time Updates (planned)

### State Management
- **Local State**: React useState for component-specific data
- **Server State**: React Query/SWR for API data (planned)
- **Global State**: Context API for user authentication
- **Form State**: React Hook Form for complex forms

### Data Validation
- **Client-side**: HTML5 validation + custom rules
- **Server-side**: API endpoint validation
- **Database**: PostgreSQL constraints and triggers
- **Type Safety**: TypeScript interfaces throughout

### Caching Strategy
- **Static Generation**: Next.js ISR for public pages
- **API Response Caching**: Supabase query caching
- **Image Optimization**: Next.js Image component
- **CDN**: Vercel CDN for static assets

## Security & Authentication

### Authentication
- **Provider**: Supabase Auth
- **Methods**: Email/password, OAuth (planned)
- **Session Management**: JWT tokens with automatic refresh
- **Password Security**: Bcrypt hashing, strength requirements

### Authorization
- **Role-based Access**: Renter, Owner, Admin roles
- **Row Level Security**: PostgreSQL RLS policies
- **API Guards**: Middleware for route protection
- **Permission Checks**: Database-level and application-level

### Data Security
- **Encryption**: TLS 1.3 for data in transit
- **Data Sanitization**: Input validation and SQL injection prevention
- **CSRF Protection**: Next.js built-in CSRF protection
- **XSS Prevention**: React's automatic escaping

### Privacy & Compliance
- **Data Retention**: Configurable data retention policies
- **User Consent**: GDPR-compliant consent management
- **Audit Logging**: User action tracking for security
- **Data Export**: User data export functionality

## Deployment & Maintenance

### Development Workflow
1. **Local Development**: `npm run dev` with hot reload
2. **Code Quality**: ESLint + Prettier for consistency
3. **Testing**: Unit tests with Jest (planned)
4. **Code Review**: Pull request reviews required

### Deployment Process
1. **Build**: `npm run build` creates optimized production build
2. **Testing**: Automated tests and manual QA
3. **Deployment**: Vercel automatic deployments from main branch
4. **Monitoring**: Error tracking and performance monitoring

### Environment Management
- **Development**: Local Supabase instance
- **Staging**: Separate Supabase project for testing
- **Production**: Production Supabase project
- **Environment Variables**: Secure secret management

### Monitoring & Analytics
- **Performance**: Vercel Analytics and Core Web Vitals
- **Errors**: Sentry error tracking (planned)
- **Usage**: Custom analytics dashboard
- **Database**: Supabase monitoring and query optimization

### Backup & Recovery
- **Database Backups**: Supabase automated backups
- **Code Repository**: Git version control with GitHub
- **Asset Backups**: Supabase Storage backups
- **Disaster Recovery**: Multi-region deployment (planned)

### Maintenance Tasks
- **Database Optimization**: Regular query performance monitoring
- **Security Updates**: Dependency updates and security patches
- **Content Moderation**: Regular review of user-generated content
- **User Support**: Help desk and user communication
- **Feature Updates**: Regular feature releases and improvements

---

## Quick Reference

### Database Schema Viewer
Visit `/database-schema` to view the current database structure with live data from your Supabase instance.

### Admin Panel
Access `/admin` for platform management and user administration.

### API Documentation
All API endpoints are documented in the code with TypeScript interfaces for request/response types.

### Environment Setup
```bash
cp .env.local.example .env.local
# Add your Supabase credentials
npm install
npm run dev
```

This documentation serves as a comprehensive reference for developers, administrators, and stakeholders working with the Facility Rental Platform.