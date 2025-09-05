import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Supabase doesn't expose information_schema, so we'll use a different approach
    // Try to query known facility tables directly
    const knownTables = [
      'facility_users',
      'facility_categories',
      'facility_facilities',
      'facility_images',
      'facility_amenities',
      'facility_features',
      'facility_availability',
      'facility_bookings',
      'facility_reviews',
      'facility_favorites',
      'facility_messages',
      'facility_notifications',
      'facility_transactions'
    ]

    const schema: Record<string, any> = {}
    const availableTables: string[] = []

    // Check each table and get basic info
    for (const tableName of knownTables) {
      try {
        // Try to get a count from the table to verify it exists
        const { count, error } = await supabase
          .from(tableName)
          .select('*', { count: 'exact', head: true })

        if (!error) {
          availableTables.push(tableName)
          schema[tableName] = {
            exists: true,
            rowCount: count || 0,
            columns: [] // We can't easily get column info without information_schema
          }
        }
      } catch (error) {
        // Table doesn't exist or we don't have access
        console.log(`Table ${tableName} not accessible:`, error)
      }
    }

    return NextResponse.json({
      success: true,
      schema,
      tables: availableTables,
      timestamp: new Date().toISOString(),
      note: 'Column details not available due to Supabase restrictions'
    })

  } catch (error) {
    console.error('Database schema fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}