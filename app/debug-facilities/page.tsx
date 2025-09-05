'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export default function DebugFacilitiesPage() {
  const [facilities, setFacilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadAllFacilities = async () => {
      try {
        setLoading(true)
        
        // Load ALL facilities regardless of status
        const { data, error } = await supabase
          .from('facility_facilities')
          .select('id, name, status, created_at, city, state')
          .order('created_at', { ascending: false })

        if (error) {
          setError(`Error: ${error.message}`)
        } else {
          setFacilities(data || [])
        }
      } catch (err) {
        setError(`Error: ${err}`)
      } finally {
        setLoading(false)
      }
    }

    loadAllFacilities()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p>Loading facilities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">
            Debug: All Facilities in Database
          </h1>
          
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
            </div>
          )}

          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Total facilities found: <strong>{facilities.length}</strong>
            </p>
          </div>

          {facilities.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-600">No facilities found in the database.</p>
              <p className="text-sm text-gray-500 mt-2">
                Try creating a facility using the &quot;List Your Facility&quot; page.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {facilities.map((facility) => (
                    <tr key={facility.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {facility.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          facility.status === 'active' 
                            ? 'bg-green-100 text-green-800'
                            : facility.status === 'pending_approval'
                            ? 'bg-yellow-100 text-yellow-800'
                            : facility.status === 'rejected'
                            ? 'bg-red-100 text-red-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {facility.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {facility.city}, {facility.state}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(facility.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <h3 className="text-sm font-medium text-blue-900 mb-2">Status Meanings:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li><strong>pending_approval:</strong> Facility submitted, waiting for admin review</li>
              <li><strong>active:</strong> Facility approved by admin and visible on browse page</li>
              <li><strong>rejected:</strong> Facility rejected by admin</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}