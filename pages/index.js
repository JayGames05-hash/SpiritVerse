import { useState, useEffect } from 'react'
import Header from '../components/Header'
import ReadingCard from '../components/ReadingCard'
import readings from '../data/readings'

export default function Home() {
  const [currentReading, setCurrentReading] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get reading based on 2-hour rotation with random selection
    const now = new Date()
    const hours = now.getHours()
    const cycleNumber = Math.floor(hours / 2) // 0-11 (12 cycles per day)
    
    // Use cycle number as seed for consistent random selection
    const seededRandom = Math.abs(Math.sin(cycleNumber * 12.9898) * 43758.5453) % 1
    const readingIndex = Math.floor(seededRandom * readings.length)
    
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
