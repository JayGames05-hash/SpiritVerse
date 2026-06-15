import { useState, useEffect } from 'react'
import Header from '../components/Header'
import ReadingCard from '../components/ReadingCard'
import readings from '../data/readings'

export default function Home() {
  const [availableReadings, setAvailableReadings] = useState(readings)
  const [currentReading, setCurrentReading] = useState(null)
  const [loading, setLoading] = useState(true)
  const [remainingSeconds, setRemainingSeconds] = useState(0)

  const formatDuration = seconds => {
    const h = Math.floor(seconds / 3600)
    const m = Math.floor((seconds % 3600) / 60)
    const s = seconds % 60
    if (h > 0) return `${h}h ${m}m ${s}s`
    return `${m}m ${s}s`
  }

  useEffect(() => {
    async function loadApprovedSuggestions() {
      try {
        const res = await fetch('/api/verses/suggestions?status=approved')
        if (!res.ok) return
        const data = await res.json()
        if (!Array.isArray(data.suggestions)) return

        const suggestions = data.suggestions.map((suggestion) => ({
          id: suggestion.id,
          scripture_ref: suggestion.scripture_ref,
          title: suggestion.title || suggestion.scripture_ref,
          reading_text: suggestion.reading_text,
          reflection: suggestion.reflection,
          author_name: suggestion.author_name,
          date: suggestion.author_name ? `Suggested by ${suggestion.author_name}` : 'Suggested Verse',
        }))

        setAvailableReadings([...readings, ...suggestions])
      } catch (err) {
        console.error('Failed to load approved verse suggestions:', err)
      }
    }

    loadApprovedSuggestions()
  }, [])

  useEffect(() => {
    if (!availableReadings || availableReadings.length === 0) return

    const selectReading = () => {
      const now = new Date()
      const cycleNumber = Math.floor(now.getHours() / 2)
      const seededRandom = Math.abs(Math.sin(cycleNumber * 12.9898) * 43758.5453) % 1
      const readingIndex = Math.floor(seededRandom * availableReadings.length)
      return availableReadings[readingIndex]
    }

    const getRemainingSeconds = () => {
      const now = new Date()
      const currentCycleStart = Math.floor(now.getHours() / 2) * 2
      let nextCycleHour = currentCycleStart + 2
      const nextBoundary = new Date(now)
      if (nextCycleHour >= 24) {
        nextBoundary.setDate(nextBoundary.getDate() + 1)
        nextCycleHour = 0
      }
      nextBoundary.setHours(nextCycleHour, 0, 0, 0)
      return Math.max(0, Math.floor((nextBoundary.getTime() - now.getTime()) / 1000))
    }

    const updateState = () => {
      const nextReading = selectReading()
      setCurrentReading(prev => (prev?.id === nextReading?.id ? prev : nextReading))
      setRemainingSeconds(getRemainingSeconds())
      setLoading(false)
    }

    updateState()
    const intervalId = window.setInterval(updateState, 1000)
    return () => window.clearInterval(intervalId)
  }, [availableReadings])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
        <Header />
        <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center text-white">Loading...</div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        {currentReading && (
          <div className="space-y-6">
            <div className="text-right text-sm text-[#f4e5d7] sm:text-base">
              Next verse in <span className="font-semibold text-white">{formatDuration(remainingSeconds)}</span>
            </div>
            <ReadingCard post={currentReading} />
          </div>
        )}
      </main>
    </div>
  )
}
