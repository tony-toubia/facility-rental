'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { CheckCircle, XCircle, Eye, Clock, MapPin, DollarSign } from 'lucide-react'
import Image from 'next/image'

interface Facility {
  id: string
  name: string
  type: string
  description: string
  address: string
  city: string
  state: string
  price: number
  price_unit: string
  capacity: number
  status: string
  created_at: string
  owner_id: string
  facility_users?: {
    first_name: string
    last_name: string
    email: string
  }
  facility_images?: {
    image_url: string
    is_primary: boolean
  }[]
}

export default function AdminPage() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [activeTab, setActiveTab] = useState<'review' | 'testing'>('review')
  const [pendingFacilities, setPendingFacilities] = useState<Facility[]>([])
  const [reviewLoading, setReviewLoading] = useState(false)

  // Load pending facilities on component mount
  useEffect(() => {
    if (activeTab === 'review') {
      loadPendingFacilities()
    }
  }, [activeTab])

  const loadPendingFacilities = async () => {
    setReviewLoading(true)
    try {
      const { data, error } = await supabase
        .from('facility_facilities')
        .select(`
          *,
          facility_users:owner_id (
            first_name,
            last_name,
            email
          ),
          facility_images (
            image_url,
            is_primary
          )
        `)
        .eq('status', 'pending_approval')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading pending facilities:', error)
        setMessage(`❌ Error loading facilities: ${error.message}`)
      } else {
        setPendingFacilities(data || [])
      }
    } catch (err) {
      console.error('Error:', err)
      setMessage(`❌ Error: ${err}`)
    } finally {
      setReviewLoading(false)
    }
  }

  const updateFacilityStatus = async (facilityId: string, newStatus: 'active' | 'rejected') => {
    try {
      const { error } = await supabase
        .from('facility_facilities')
        .update({ status: newStatus, updated_at: new Date().toISOString() })
        .eq('id', facilityId)

      if (error) {
        setMessage(`❌ Error updating facility: ${error.message}`)
      } else {
        setMessage(`✅ Facility ${newStatus === 'active' ? 'approved' : 'rejected'} successfully!`)
        // Reload the pending facilities list
        loadPendingFacilities()
      }
    } catch (err) {
      setMessage(`❌ Error: ${err}`)
    }
  }

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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Admin Panel
          </h1>
          
          {/* Tab Navigation */}
          <div className="border-b border-gray-200 mb-8">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('review')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'review'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Clock className="w-4 h-4 inline mr-2" />
                Facility Reviews
              </button>
              <button
                onClick={() => setActiveTab('testing')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'testing'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Database Testing
              </button>
            </nav>
          </div>

          {/* Facility Review Tab */}
          {activeTab === 'review' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  Pending Facility Reviews
                </h2>
                <button
                  onClick={loadPendingFacilities}
                  disabled={reviewLoading}
                  className="btn-secondary"
                >
                  {reviewLoading ? 'Loading...' : 'Refresh'}
                </button>
              </div>

              {reviewLoading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  <p className="mt-2 text-gray-600">Loading pending facilities...</p>
                </div>
              ) : pendingFacilities.length === 0 ? (
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending reviews</h3>
                  <p className="text-gray-600">All facilities have been reviewed!</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {pendingFacilities.map((facility) => {
                    const primaryImage = facility.facility_images?.find(img => img.is_primary)?.image_url || 
                                       facility.facility_images?.[0]?.image_url
                    
                    return (
                    <div key={facility.id} className="border border-gray-200 rounded-lg p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex space-x-4">
                          {primaryImage && (
                            <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0">
                              <Image
                                src={primaryImage}
                                alt={facility.name}
                                fill
                                className="object-cover"
                                sizes="96px"
                              />
                            </div>
                          )}
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900">{facility.name}</h3>
                            <p className="text-sm text-gray-600">{facility.type}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => updateFacilityStatus(facility.id, 'active')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Approve
                          </button>
                          <button
                            onClick={() => updateFacilityStatus(facility.id, 'rejected')}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                          >
                            <XCircle className="w-4 h-4 mr-1" />
                            Reject
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Facility Details</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              {facility.address}, {facility.city}, {facility.state}
                            </div>
                            <div className="flex items-center">
                              <DollarSign className="w-4 h-4 mr-2" />
                              ${facility.price}/{facility.price_unit}
                            </div>
                            <div className="flex items-center">
                              <Eye className="w-4 h-4 mr-2" />
                              Capacity: {facility.capacity} people
                            </div>
                          </div>
                        </div>

                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Owner Information</h4>
                          <div className="space-y-1 text-sm text-gray-600">
                            <p>
                              {facility.facility_users?.first_name} {facility.facility_users?.last_name}
                            </p>
                            <p>{facility.facility_users?.email}</p>
                            <p className="text-xs">
                              Submitted: {new Date(facility.created_at).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                      </div>

                      {facility.description && (
                        <div>
                          <h4 className="font-medium text-gray-900 mb-2">Description</h4>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                            {facility.description}
                          </p>
                        </div>
                      )}
                    </div>
                    )
                  })}
                </div>
              )}
            </div>
          )}

          {/* Database Testing Tab */}
          {activeTab === 'testing' && (
          
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
                    If you&apos;re getting &quot;row-level security policy&quot; errors, run the fix-rls-policies.sql script:
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
          )}

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