# 🌍 Geolocation Setup Guide

This guide will help you set up the advanced geolocation features for the facility rental platform, including Google Places autocomplete and PostGIS-powered distance calculations.

## 🎯 Features Implemented

### ✅ **Google Places Autocomplete**
- **Predictive search** like Airbnb/Zillow
- **Real-time suggestions** as users type
- **Accurate geocoding** with latitude/longitude
- **Address validation** and standardization

### ✅ **PostGIS Distance Calculations**
- **Accurate radius search** (5, 10, 25, 50, 100 miles)
- **Distance sorting** by proximity
- **Performance optimized** with spatial indexes
- **Fallback support** for basic coordinate filtering

### ✅ **Enhanced User Experience**
- **Location-aware browsing** with distance display
- **Configurable search radius**
- **Browser geolocation** support
- **Manual location entry** with geocoding

## 🚀 Setup Instructions

### **Step 1: Google Maps API Setup**

1. **Go to Google Cloud Console**: https://console.cloud.google.com/
2. **Create or select a project**
3. **Enable required APIs**:
   - Maps JavaScript API
   - Places API
   - Geocoding API
4. **Create API credentials**:
   - Go to "Credentials" → "Create Credentials" → "API Key"
   - Restrict the key to your domain for security
5. **Add API key to environment**:
   ```bash
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_actual_api_key_here
   ```

### **Step 2: Supabase PostGIS Setup**

1. **Enable PostGIS extension**:
   - Go to Supabase Dashboard → Database → Extensions
   - Search for "postgis" and enable it

2. **Get service role key**:
   - Go to Supabase Dashboard → Settings → API
   - Copy the "service_role" key (not anon key)
   - Add to `.env.local`:
   ```bash
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   ```

3. **Run setup script**:
   ```bash
   npm install dotenv
   node scripts/setup-postgis.js
   ```

### **Step 3: Update Environment Variables**

Your `.env.local` should include:
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Google Maps API
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### **Step 4: Test the Implementation**

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Test location search**:
   - Go to `/browse` page
   - Try typing a city name in the location search
   - Verify autocomplete suggestions appear
   - Select a location and check if facilities are filtered

3. **Check console logs**:
   - Open browser developer tools
   - Look for geolocation debug messages
   - Verify PostGIS queries are working

## 🔧 How It Works

### **Location Search Flow**
1. **User types** in location search box
2. **Google Places API** provides autocomplete suggestions
3. **User selects** a location from suggestions
4. **Coordinates extracted** (latitude/longitude)
5. **PostGIS query** finds facilities within radius
6. **Results sorted** by distance

### **Database Architecture**
```sql
-- PostGIS function for radius search
get_facilities_within_radius(
  center_lat: DOUBLE PRECISION,
  center_lng: DOUBLE PRECISION, 
  radius_meters: DOUBLE PRECISION
)

-- Returns facilities with distance calculations
-- Sorted by proximity to search location
```

### **Component Architecture**
```
LocationAutocomplete.tsx     → Google Places integration
FacilityLocationPicker.tsx   → For facility owners to set coordinates
geolocation.ts              → Core geolocation utilities
browse/page.tsx             → Updated with location filtering
```

## 📊 Facility Coordinate Management

### **For New Facilities**
- Use `FacilityLocationPicker` component in facility creation form
- Automatically geocodes addresses to coordinates
- Validates location accuracy

### **For Existing Facilities**
- Run coordinate update script (if needed)
- Use admin interface to bulk update locations
- Manual geocoding for facilities without coordinates

### **Geocoding Process**
1. **Address input** → Google Geocoding API
2. **Coordinates returned** → Stored in database
3. **Validation** → Ensures accuracy
4. **Fallback** → Manual coordinate entry if needed

## 🎨 UI/UX Features

### **Browse Page Enhancements**
- **Location banner** showing current search area
- **Radius selector** (5-100 miles)
- **Distance display** on facility cards
- **"Show All" button** to disable location filtering

### **Search Experience**
- **Predictive typing** with instant suggestions
- **Location validation** with error handling
- **Clear location** functionality
- **Browser geolocation** as fallback

## 🐛 Troubleshooting

### **Common Issues**

1. **No autocomplete suggestions**:
   - Check Google Maps API key
   - Verify Places API is enabled
   - Check browser console for errors

2. **PostGIS functions not working**:
   - Ensure PostGIS extension is enabled
   - Run setup script with service role key
   - Check Supabase function logs

3. **No distance calculations**:
   - Verify facilities have latitude/longitude
   - Check PostGIS function exists
   - Test with known coordinates

4. **Location search not filtering**:
   - Check console logs for query details
   - Verify user location is set
   - Test with different radius values

### **Debug Commands**

```bash
# Test PostGIS function directly
SELECT * FROM get_facilities_within_radius(39.0458, -76.6413, 40233.6);

# Check facility coordinates
SELECT id, name, city, state, latitude, longitude 
FROM facility_facilities 
WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

# Verify PostGIS extension
SELECT * FROM pg_extension WHERE extname = 'postgis';
```

## 🚀 Performance Optimization

### **Database Indexes**
- Spatial index on facility coordinates
- Composite indexes for common queries
- Query optimization for large datasets

### **API Rate Limiting**
- Google Places API has usage limits
- Implement caching for repeated searches
- Consider upgrading API plan for high traffic

### **Frontend Optimization**
- Debounced autocomplete requests
- Cached location results
- Lazy loading of map components

## 🔮 Future Enhancements

### **Potential Improvements**
- **Map view** with facility markers
- **Geofencing** for automatic location detection
- **Route optimization** for multiple facilities
- **Location-based recommendations**
- **Advanced filtering** by neighborhood/landmarks

### **Integration Opportunities**
- **Real-time availability** based on location
- **Dynamic pricing** by area demand
- **Location analytics** for owners
- **Multi-location facility chains**

## 📞 Support

If you encounter issues:
1. Check the troubleshooting section above
2. Review browser console for error messages
3. Verify all environment variables are set
4. Test with a fresh browser session
5. Check Supabase and Google Cloud Console logs

The geolocation system is now ready to provide a professional, Airbnb-like location search experience! 🎉