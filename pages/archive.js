import { useState, useEffect } from 'react'
import Header from '../components/Header'

export default function Archive() {
  const [readings, setReadings] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const readings = require('../data/readings').default || []
    setReadings(readings)
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold text-white mb-8">Reading Archive</h1>

        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : readings.length === 0 ? (
          <div className="bg-purple-700 rounded-lg p-8 text-white text-center">
            <p>No readings available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {readings.map(reading => (
              <div key={reading.id} className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-purple-900">{reading.title || reading.scripture_ref}</h2>
                    <p className="text-sm text-gray-500">{reading.scripture_ref}</p>
                  </div>
                  <p className="text-sm text-gray-600">{reading.date}</p>
                </div>
                <div className="text-gray-800 mb-4 whitespace-pre-wrap leading-relaxed">{reading.reading_text}</div>
                {reading.reflection && (
                  <div className="bg-purple-50 border border-purple-100 rounded-lg p-4">
                    <h3 className="text-sm font-semibold text-purple-900 mb-2">Reflection</h3>
                    <p className="text-gray-700 italic whitespace-pre-wrap">{reading.reflection}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
