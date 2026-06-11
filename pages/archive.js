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
                <h2 className="text-2xl font-bold text-purple-900 mb-2">{reading.title}</h2>
                <p className="text-gray-600 mb-4 text-sm">{reading.date}</p>
                <p className="text-gray-800 mb-4 whitespace-pre-wrap">{reading.content}</p>
                {reading.saint && (
                  <p className="text-sm text-purple-700 font-semibold">Saint: {reading.saint}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
