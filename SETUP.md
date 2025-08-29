# Facility Rental Platform Setup Guide

This guide will help you set up the facility rental platform to work with your existing Supabase project.

## Prerequisites

- Existing Supabase project (aura-link)
- Node.js and npm installed
- Access to your Supabase dashboard

## Step 1: Database Schema Setup

1. **Apply the facility rental schema to your Supabase project:**
   - Open your Supabase dashboard
   - Go to the SQL Editor
   - Copy and paste the contents of `facility-rental-addon-schema.sql`
   - Run the SQL to create all the facility tables with `FACILITY_` prefixes

2. **Optional: Add sample data for testing:**
   - In the SQL Editor, copy and paste the contents of `scripts/seed-data.sql`
   - Run the SQL to create sample facilities, users, and categories

## Step 2: Environment Configuration

1. **Create environment variables file:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Update `.env.local` with your Supabase credentials:**
   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

   You can find these values in your Supabase dashboard under Settings > API.

## Step 3: Install Dependencies

```bash
npm install
```

## Step 4: Test the Setup

1. **Start the development server:**
   ```bash
   npm run dev
   ```

2. **Test the database connection:**
   - Visit `http://localhost:3000/admin`
   - Click "Test Connection" to verify Supabase connectivity
   - Click "Check Tables" to verify all tables were created
   - Optionally create sample data using the admin panel

3. **View the application:**
   - Visit `http://localhost:3000`
   - You should see the facility rental homepage
   - If you added sample data, featured facilities should appear

## Database Tables Created

The schema creates the following tables with `facility_` prefixes:

- `facility_users` - User profiles for the facility platform
- `facility_categories` - Facility categories (gyms, pools, courts, etc.)
- `facility_facilities` - Main facilities table
- `facility_images` - Facility photos
- `facility_amenities` - Facility amenities (parking, AC, etc.)
- `facility_features` - Facility features (equipment, services, etc.)
- `facility_availability` - Recurring availability schedules
- `facility_blocked_dates` - Specific blocked dates
- `facility_bookings` - User bookings
- `facility_reviews` - Facility reviews and ratings
- `facility_favorites` - User favorite facilities
- `facility_messages` - Messages between users and owners
- `facility_notifications` - User notifications
- `facility_transactions` - Payment transactions

## Key Features Implemented

### Frontend Components
- **FeaturedFacilities**: Displays featured facilities from the database
- **Categories**: Shows facility categories with real counts
- **Database Integration**: All components now use Supabase data

### Backend Services
- **Database Functions**: Complete CRUD operations for all entities
- **Search**: Advanced facility search with filters
- **Authentication**: Ready for Supabase Auth integration
- **File Upload**: Ready for facility image uploads

### Data Types
- **TypeScript Types**: Complete type definitions matching the database schema
- **Supabase Types**: Auto-generated types for type safety

## Next Steps

1. **Authentication**: Integrate Supabase Auth for user login/registration
2. **File Upload**: Set up Supabase Storage for facility images
3. **Payments**: Integrate Stripe for booking payments
4. **Real-time**: Add real-time updates for bookings and messages
5. **Mobile**: Create responsive mobile experience

## Troubleshooting

### Common Issues

1. **Connection Error**: 
   - Verify your Supabase URL and anon key in `.env.local`
   - Check that your Supabase project is active

2. **Table Not Found Error**:
   - Ensure you ran the `facility-rental-addon-schema.sql` in your Supabase SQL editor
   - Check that all tables have the `facility_` prefix

3. **No Data Showing**:
   - Run the sample data script `scripts/seed-data.sql`
   - Or use the admin panel to create test data

4. **RLS (Row Level Security) Issues**:
   - The schema includes RLS policies
   - For testing, you can temporarily disable RLS on specific tables

### Getting Help

- Check the browser console for error messages
- Use the admin panel at `/admin` to test database operations
- Verify your Supabase project settings and API keys

## Development Workflow

1. **Database Changes**: Make schema changes in Supabase SQL editor
2. **Type Updates**: Update types in `types/index.ts` and `lib/supabase.ts`
3. **Component Updates**: Update React components to use new data structures
4. **Testing**: Use the admin panel and sample data for testing

## Production Deployment

Before deploying to production:

1. **Environment Variables**: Set up production environment variables
2. **RLS Policies**: Review and test all Row Level Security policies
3. **Performance**: Add database indexes for frequently queried columns
4. **Backup**: Set up automated database backups
5. **Monitoring**: Set up error tracking and performance monitoring