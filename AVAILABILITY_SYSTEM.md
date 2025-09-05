# Facility Availability System

## Overview
We've implemented a comprehensive availability/scheduling system for facility rentals that allows facility owners to:

1. **Configure basic availability settings** during facility listing
2. **Manage detailed availability** after facility approval
3. **Block specific time periods** for maintenance, holidays, or other uses
4. **Set flexible booking increments** and minimum rental durations

## Database Schema

### New Tables Created

1. **`facility_availability_templates`** - Pre-defined availability patterns
2. **`facility_default_availability`** - Weekly recurring availability schedule
3. **`facility_availability_exceptions`** - Specific date/time blocks or overrides
4. **`facility_holiday_templates`** - Common holidays that can be selected
5. **`facility_selected_holidays`** - Holidays selected by each facility

### Enhanced Facility Table
- `availability_increment` - Booking time increments (15, 30, 60, 120, 240 minutes)
- `minimum_rental_duration` - Minimum booking duration (NULL = same as increment)
- `availability_timezone` - Facility's timezone
- `availability_notes` - Additional availability notes

## Components Created

### 1. AvailabilityConfigurator (`/components/AvailabilityConfigurator.tsx`)
- **Purpose**: Used during facility listing process
- **Features**:
  - 4-step wizard interface
  - Basic settings (increment, minimum duration, timezone)
  - Weekly schedule templates and custom configuration
  - Holiday selection
  - Review and notes

### 2. AvailabilityManager (`/components/AvailabilityManager.tsx`)
- **Purpose**: Used in facility dashboard for ongoing management
- **Features**:
  - Edit weekly schedule
  - Add/remove availability exceptions
  - Block specific dates/times
  - Override default schedule for special availability
  - Calendar view (placeholder for future enhancement)

### 3. Dashboard (`/app/dashboard/page.tsx`)
- **Purpose**: Main facility owner dashboard
- **Features**:
  - Facility overview and statistics
  - Availability management interface
  - Bookings management (placeholder)
  - Analytics (placeholder)

## Database Functions

### Core Functions (`/lib/availability-database.ts`)
- `saveFacilityAvailability()` - Save complete availability configuration
- `getFacilityAvailability()` - Load facility availability settings
- `createAvailabilityException()` - Add specific date/time blocks
- `getAvailabilityExceptions()` - Load exceptions for date range
- `deleteAvailabilityException()` - Remove specific exceptions

### Helper Functions
- `getAvailabilityTemplates()` - Load system templates
- `getHolidayTemplates()` - Load common holidays
- `get_facility_availability()` - PostgreSQL function for date range queries

## Integration Points

### Facility Listing Process
1. **Step 1-4**: Basic facility information (existing)
2. **Step 5**: Availability configuration (NEW)
3. **Submission**: Saves availability along with facility data

### Facility Dashboard
- Accessible via `/dashboard` (link in header when logged in)
- Shows all facilities owned by the user
- Provides availability management interface

### Admin Review Process
- Availability settings are saved during listing
- Reviewers can see availability configuration
- No changes needed to existing review process

## Usage Flow

### For Facility Owners

1. **During Listing**:
   - Configure basic availability settings
   - Set weekly schedule using templates or custom times
   - Select applicable holidays
   - Add any special notes

2. **After Approval**:
   - Access dashboard to manage availability
   - Add exceptions for maintenance, events, etc.
   - Modify weekly schedule as needed
   - View upcoming bookings (future feature)

3. **Ongoing Management**:
   - Block specific dates/times
   - Override default schedule for special availability
   - Manage holiday closures

### For Renters (Future Implementation)
- Browse facilities with availability information
- See available time slots based on:
  - Weekly schedule
  - Availability exceptions
  - Existing bookings
  - Booking increments and minimums

## Key Features

### Flexible Scheduling
- **Booking Increments**: 15min, 30min, 1hr, 2hr, 4hr
- **Minimum Durations**: From increment up to full day
- **Multiple Time Slots**: Multiple availability windows per day
- **Timezone Support**: Proper timezone handling

### Exception Management
- **Manual Blocks**: Owner-created unavailable periods
- **Holiday Closures**: Automatic holiday blocking
- **Maintenance Windows**: Scheduled maintenance periods
- **Recurring Patterns**: Future support for recurring exceptions

### Templates & Presets
- **Business Hours**: M-F 9am-5pm
- **Extended Hours**: M-F 8am-6pm
- **Weekends Only**: Sat-Sun 10am-8pm
- **After School**: M-F 3:30pm-9pm, weekends 9am-9pm
- **Full Week**: 7 days 8am-10pm
- **School Hours**: M-F 8am-3pm

### Holiday Support
- **Common US Holidays**: New Year's, MLK Day, Presidents Day, etc.
- **Flexible Selection**: Choose which holidays apply
- **Automatic Blocking**: Selected holidays automatically block availability

## Database Migration

Run the SQL migration file:
```sql
-- Execute: /sql/add-availability-system.sql
```

This creates all necessary tables, indexes, RLS policies, and sample data.

## Next Steps

### Phase 2: Booking Integration
1. Update browse/search to show availability
2. Implement booking calendar interface
3. Check availability before allowing bookings
4. Handle booking conflicts and validation

### Phase 3: Advanced Features
1. Recurring availability exceptions
2. Seasonal schedule variations
3. Dynamic pricing based on availability
4. Bulk availability management tools
5. Integration with external calendar systems

### Phase 4: Analytics & Optimization
1. Availability utilization reports
2. Revenue optimization suggestions
3. Demand forecasting
4. Automated pricing recommendations

## Testing

### Manual Testing Steps
1. **List a new facility** - Verify availability configurator appears
2. **Complete availability setup** - Test all templates and custom schedules
3. **Submit facility** - Ensure availability data is saved
4. **Access dashboard** - Verify facility appears with availability management
5. **Edit availability** - Test adding/removing exceptions
6. **Save changes** - Verify persistence of availability updates

### Database Verification
```sql
-- Check facility availability settings
SELECT * FROM facility_facilities WHERE availability_increment IS NOT NULL;

-- Check default availability schedules
SELECT * FROM facility_default_availability;

-- Check availability exceptions
SELECT * FROM facility_availability_exceptions;

-- Check selected holidays
SELECT * FROM facility_selected_holidays;
```

## Security & Permissions

### Row Level Security (RLS)
- Facility owners can only manage their own availability
- Public can read availability for approved, active facilities
- System templates and holidays are publicly readable

### API Security
- All availability functions require proper authentication
- Facility ownership verified before allowing modifications
- Input validation on all date/time fields

## Performance Considerations

### Database Indexes
- Indexed on facility_id for all availability tables
- Date indexes for efficient range queries
- Day-of-week index for weekly schedule lookups

### Caching Strategy (Future)
- Cache availability data for frequently accessed facilities
- Invalidate cache when availability changes
- Pre-compute availability for popular date ranges

This system provides a solid foundation for facility availability management and can be extended with additional features as needed.