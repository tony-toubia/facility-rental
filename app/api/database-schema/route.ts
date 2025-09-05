import { supabase } from '@/lib/supabase'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Get all tables in the public schema
    const { data: tables, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .like('table_name', 'facility_%')

    if (tablesError) {
      console.error('Error fetching tables:', tablesError)
      return NextResponse.json({ error: 'Failed to fetch database schema' }, { status: 500 })
    }

    const schema: Record<string, any> = {}

    // Get column information for each table
    for (const table of tables || []) {
      const { data: columns, error: columnsError } = await supabase
        .from('information_schema.columns')
        .select('column_name, data_type, is_nullable, column_default')
        .eq('table_schema', 'public')
        .eq('table_name', table.table_name)
        .order('ordinal_position')

      if (columnsError) {
        console.error(`Error fetching columns for ${table.table_name}:`, columnsError)
        continue
      }

      schema[table.table_name] = {
        columns: columns || [],
        rowCount: 0 // Could be populated if needed
      }
    }

    return NextResponse.json({
      success: true,
      schema,
      tables: tables?.map(t => t.table_name) || [],
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Database schema fetch error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}