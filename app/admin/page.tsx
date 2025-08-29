'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')

  const testConnection = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const { data, error } = await supabase
        .from('facility_categories')
        .select('count')
        .limit(1)
      
      if (error) {
        setMessage(`❌ Connection failed: ${error.message}`)
      } else {
        setMessage('✅ Successfully connected to Supabase!')
      }
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const createSampleUser = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // First try to create a Supabase auth user
      const email = `test.user.${Date.now()}@example.com`
      const password = 'testpassword123'
      
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: 'Test',
            last_name: 'User',
            user_type: 'owner'
          }
        }
      })

      if (authError) {
        setMessage(`❌ Failed to create auth user: ${authError.message}`)
        return
      }

      // If auth user creation succeeded, the facility_user should be created automatically
      // by our auth context, but let's also try direct insertion for testing
      const { data, error } = await supabase
        .from('facility_users')
        .insert({
          auth_user_id: authData.user?.id,
          first_name: 'Test',
          last_name: 'User',
          email: email,
          user_type: 'owner',
          city: 'Test City',
          state: 'TS',
          country: 'US'
        })
        .select()
        .single()
      
      if (error) {
        setMessage(`❌ Failed to create facility user: ${error.message}\n\n💡 This might be due to RLS policies. Try running the fix-rls-policies.sql script in your Supabase SQL editor.`)
      } else {
        setMessage(`✅ Created test user: ${data.first_name} ${data.last_name} (${data.email})\n✅ Auth user ID: ${authData.user?.id}`)
      }
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const createSampleFacility = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      // First, get or create a user
      let { data: users, error: userError } = await supabase
        .from('facility_users')
        .select('id')
        .eq('user_type', 'owner')
        .limit(1)
      
      if (userError || !users || users.length === 0) {
        setMessage('❌ No owner users found. Create a user first.')
        setLoading(false)
        return
      }

      const { data, error } = await supabase
        .from('facility_facilities')
        .insert({
          owner_id: users[0].id,
          category_id: 'gyms',
          name: `Test Facility ${Date.now()}`,
          type: 'Test Gym',
          description: 'A test facility for development',
          address: '123 Test Street',
          city: 'Test City',
          state: 'TS',
          zip_code: '12345',
          price: 25.00,
          price_unit: 'hour',
          capacity: 20,
          status: 'active',
          is_featured: true
        })
        .select()
        .single()
      
      if (error) {
        setMessage(`❌ Failed to create facility: ${error.message}`)
      } else {
        setMessage(`✅ Created test facility: ${data.name}`)
      }
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  const checkTables = async () => {
    setLoading(true)
    setMessage('')
    
    try {
      const tables = [
        'facility_categories',
        'facility_users', 
        'facility_facilities',
        'facility_images',
        'facility_amenities',
        'facility_features'
      ]
      
      const results = []
      
      for (const table of tables) {
        const { count, error } = await supabase
          .from(table)
          .select('*', { count: 'exact', head: true })
        
        if (error) {
          results.push(`❌ ${table}: Error - ${error.message}`)
        } else {
          results.push(`✅ ${table}: ${count} records`)
        }
      }
      
      setMessage(results.join('\n'))
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Admin Panel - Database Testing
          </h1>
          
          <div className="space-y-6">
            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Database Connection</h2>
              <p className="text-gray-600 mb-4">
                Test the connection to your Supabase database.
              </p>
              <button
                onClick={testConnection}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Check Tables</h2>
              <p className="text-gray-600 mb-4">
                Check if all facility tables exist and show record counts.
              </p>
              <button
                onClick={checkTables}
                disabled={loading}
                className="btn-primary"
              >
                {loading ? 'Checking...' : 'Check Tables'}
              </button>
            </div>

            <div className="border-b pb-6">
              <h2 className="text-xl font-semibold mb-4">Create Sample Data</h2>
              <p className="text-gray-600 mb-4">
                Create sample users and facilities for testing.
              </p>
              <div className="space-x-4">
                <button
                  onClick={createSampleUser}
                  disabled={loading}
                  className="btn-primary"
                >
                  {loading ? 'Creating...' : 'Create Sample User'}
                </button>
                <button
                  onClick={createSampleFacility}
                  disabled={loading}
                  className="btn-secondary"
                >
                  {loading ? 'Creating...' : 'Create Sample Facility'}
                </button>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Setup Instructions</h2>
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
                  <h3 className="font-medium text-yellow-800 mb-2">Required Environment Variables:</h3>
                  <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• NEXT_PUBLIC_SUPABASE_URL</li>
                    <li>• NEXT_PUBLIC_SUPABASE_ANON_KEY</li>
                  </ul>
                  <p className="text-sm text-yellow-700 mt-2">
                    Make sure these are set in your .env.local file with your actual Supabase project values.
                  </p>
                </div>
                
                <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
                  <h3 className="font-medium text-blue-800 mb-2">Fix RLS Policies (if getting permission errors):</h3>
                  <p className="text-sm text-blue-700 mb-2">
                    If you're getting "row-level security policy" errors, run the fix-rls-policies.sql script:
                  </p>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Go to your Supabase dashboard</li>
                    <li>Open the SQL Editor</li>
                    <li>Copy and paste the contents of <code className="bg-blue-100 px-1 rounded">fix-rls-policies.sql</code></li>
                    <li>Run the SQL script</li>
                    <li>Try creating sample data again</li>
                  </ol>
                </div>
              </div>
            </div>
          </div>

          {message && (
            <div className="mt-8 p-4 bg-gray-100 rounded-md">
              <h3 className="font-medium mb-2">Result:</h3>
              <pre className="text-sm whitespace-pre-wrap">{message}</pre>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}