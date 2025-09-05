-- Test with exact parameters from your app
-- Your location: 39.01840527402992, -94.63570913935384
-- Radius: 25 miles = 40233.6 meters

SELECT * FROM get_facilities_within_radius(
    39.01840527402992,  -- center_lat
    -94.63570913935384, -- center_lng  
    40233.6             -- radius_meters (25 miles)
);

-- Also test with a smaller radius to see if any facilities show up
SELECT * FROM get_facilities_within_radius(
    39.01840527402992,  -- center_lat
    -94.63570913935384, -- center_lng  
    5000                -- radius_meters (~3 miles)
);