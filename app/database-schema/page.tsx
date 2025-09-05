'use client'

import { useState, useEffect } from 'react'
import { Database, Table2, Columns, RefreshCw } from 'lucide-react'

interface ColumnInfo {
  column_name: string
  data_type: string
  is_nullable: string
  column_default: string | null
}

interface TableSchema {
  columns: ColumnInfo[]
  rowCount: number
}

interface DatabaseSchema {
  success: boolean
  schema: Record<string, TableSchema>
  tables: string[]
  timestamp: string
}

export default function DatabaseSchemaPage() {
  const [schema, setSchema] = useState<DatabaseSchema | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedTable, setSelectedTable] = useState<string | null>(null)

  const fetchSchema = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/database-schema')
      const data = await response.json()

      if (data.success) {
        setSchema(data)
      } else {
        setError(data.error || 'Failed to fetch schema')
      }
    } catch (err) {
      setError('Failed to connect to database')
      console.error('Schema fetch error:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchSchema()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-gray-600">Loading database schema...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">⚠️ Error loading schema</div>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchSchema}
            className="btn-primary"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Database Schema Reference</h1>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-gray-600">
              Live database structure for the Facility Rental Platform
            </p>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-500">
                Last updated: {schema?.timestamp ? new Date(schema.timestamp).toLocaleString() : 'Unknown'}
              </span>
              <button
                onClick={fetchSchema}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Tables List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Table2 className="w-5 h-5" />
                Tables ({schema?.tables.length || 0})
              </h2>
              <div className="space-y-2">
                {schema?.tables.map((tableName) => (
                  <button
                    key={tableName}
                    onClick={() => setSelectedTable(tableName)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm transition-colors ${
                      selectedTable === tableName
                        ? 'bg-blue-100 text-blue-700 font-medium'
                        : 'hover:bg-gray-100 text-gray-700'
                    }`}
                  >
                    {tableName.replace('facility_', '')}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Table Details */}
          <div className="lg:col-span-3">
            {selectedTable && schema?.schema[selectedTable] ? (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <Columns className="w-5 h-5" />
                  {selectedTable.replace('facility_', '').replace('_', ' ').toUpperCase()}
                </h2>

                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Column</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Nullable</th>
                        <th className="text-left py-3 px-4 font-medium text-gray-900">Default</th>
                      </tr>
                    </thead>
                    <tbody>
                      {schema.schema[selectedTable].columns.map((column, index) => (
                        <tr key={column.column_name} className="border-b border-gray-100">
                          <td className="py-3 px-4 font-mono text-gray-900">
                            {column.column_name}
                          </td>
                          <td className="py-3 px-4 text-gray-600">
                            {column.data_type}
                          </td>
                          <td className="py-3 px-4">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              column.is_nullable === 'YES'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-red-100 text-red-700'
                            }`}>
                              {column.is_nullable === 'YES' ? 'Yes' : 'No'}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-gray-500 font-mono text-xs">
                            {column.column_default || '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                <Table2 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Table</h3>
                <p className="text-gray-600">
                  Choose a table from the list to view its column structure and details.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}