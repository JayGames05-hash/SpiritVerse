import { useState, useEffect } from 'react'
import Header from '../components/Header'
import readings from '../data/readings'

export default function Archive() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setItems(readings)
    setLoading(false)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">Reading Archive</h1>

        {loading ? (
          <div className="text-center text-white">Loading...</div>
        ) : readings.length === 0 ? (
          <div className="bg-[#5a211f] rounded-3xl p-6 sm:p-8 text-white text-center">
            <p>No readings available yet.</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {readings.map(reading => (
              <div key={reading.id} className="bg-white rounded-3xl shadow-xl p-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-4 mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#4b2d23]">{reading.title || reading.scripture_ref}</h2>
                    <p className="text-sm text-gray-500">{reading.scripture_ref}</p>
                    {reading.saint && (
                      <p className="text-sm text-[#8b1e1e] mt-1">Saint of the Day: {reading.saint}{reading.feast_date ? ` — Feast ${reading.feast_date}` : ''}</p>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{reading.date}</p>
                </div>
                <div className="text-gray-800 mb-4 whitespace-pre-wrap leading-relaxed">{reading.reading_text}</div>
                {(reading.reflection || reading.saint_note) && (
                  <div className="bg-[#f5e5dc] border border-[#d7b69a] rounded-lg p-4">
                    {reading.reflection && (
                      <>
                        <h3 className="text-sm font-semibold text-[#4b2d23] mb-2">Reflection</h3>
                        <p className="text-gray-700 italic whitespace-pre-wrap">{reading.reflection}</p>
                      </>
                    )}
                    {reading.saint_note && (
                      <div className="mt-4">
                        <h3 className="text-sm font-semibold text-[#4b2d23] mb-2">Saint Note</h3>
                        <p className="text-gray-700 whitespace-pre-wrap">{reading.saint_note}</p>
                      </div>
                    )}
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
