---
description: Repository Information Overview
alwaysApply: true
---

# Facility Rental Platform Information

## Summary
A modern web application that connects facility owners with people looking to rent sports and recreation spaces. Built with Next.js 14, TypeScript, and Supabase, it provides a comprehensive solution for facility booking and management with features like multi-tenant facility listings, real-time availability management, location-based search, and user reviews.

## Structure
- **app/**: Next.js 14 App Router pages and API routes
- **components/**: Reusable React components
- **lib/**: Core functionality and utilities
- **hooks/**: Custom React hooks
- **types/**: TypeScript type definitions
- **data/**: Static data and configuration

## Language & Runtime
**Language**: TypeScript
**Version**: TypeScript 5.x
**Framework**: Next.js 14.0.4
**Build System**: Next.js built-in
**Package Manager**: npm

## Dependencies
**Main Dependencies**:
- `next`: 14.0.4 - React framework
- `react`: 18.x - UI library
- `@supabase/supabase-js`: 2.56.0 - Database and authentication
- `@googlemaps/js-api-loader`: 1.16.10 - Google Maps integration
- `date-fns`: 2.30.0 - Date manipulation
- `tailwindcss`: 3.3.0 - CSS framework

**Development Dependencies**:
- `@faker-js/faker`: 10.0.0 - Test data generation
- `@types/google.maps`: 3.58.1 - TypeScript types for Google Maps
- `eslint`: 8.x - Code linting
- `ts-node`: 10.9.2 - TypeScript execution

## Build & Installation
```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.local.example .env.local
# Edit .env.local with your Supabase credentials

# Development server
npm run dev

# Production build
npm run build

# Start production server
npm run start
```

## Database
**Provider**: Supabase (PostgreSQL)
**Authentication**: Supabase Auth with JWT
**Schema**: Comprehensive database with tables for users, facilities, bookings, reviews, and more
**Key Tables**:
- facility_users: User profiles
- facility_facilities: Main facilities table
- facility_bookings: Reservation management
- facility_reviews: User feedback system

## Frontend Architecture
**Styling**: Tailwind CSS
**State Management**: React Context API and hooks
**Routing**: Next.js App Router
**Components**: Modular React components with TypeScript
**Key Features**:
- Authentication with Supabase Auth
- Google Maps integration for location services
- Real-time availability management
- Responsive design for all devices

## API Structure
**Backend**: Next.js API routes
**Authentication**: JWT-based with Supabase
**Key Endpoints**:
- Facility management
- Booking system
- User authentication
- Reviews and ratings

## External Services
**Maps**: Google Maps API for location services
**Database**: Supabase for PostgreSQL database
**Hosting**: Vercel (implied from configuration)
**Storage**: Supabase Storage for images