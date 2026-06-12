import { useState, useEffect } from 'react'
import Header from '../components/Header'
import ReadingCard from '../components/ReadingCard'
import readings from '../data/readings'

export default function Home() {
  const [currentReading, setCurrentReading] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get reading based on 6-hour rotation
    const now = new Date()
    const hours = now.getHours()
    const cycleNumber = Math.floor(hours / 6) // 0, 1, 2, or 3
    const readingIndex = cycleNumber % readings.length
    setCurrentReading(readings[readingIndex])
    setLoading(false)
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
        <Header />
        <main className="max-w-4xl mx-auto px-4 py-12">
          <div className="text-center text-white">Loading...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-indigo-900">
      <Header />
      <main className="max-w-4xl mx-auto px-4 py-12">
        {currentReading && <ReadingCard post={currentReading} />}
      </main>
    </div>
  )
}
