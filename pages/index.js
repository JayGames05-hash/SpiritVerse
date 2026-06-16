import { useState, useEffect } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import ReadingCard from '../components/ReadingCard'
import readings from '../data/readings'
import saints from '../data/saints'
import { logHistory } from '../lib/apiClient'

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

  const monthOrder = {
    January: 1,
    February: 2,
    March: 3,
    April: 4,
    May: 5,
    June: 6,
    July: 7,
    August: 8,
    September: 9,
    October: 10,
    November: 11,
    December: 12,
  }

  const parseDatePart = (dateString) => {
    const [month, day] = dateString.trim().split(' ')
    return {
      month,
      day: Number(day),
      monthIndex: monthOrder[month] || 0,
    }
  }

  const isDateInRange = (range, today) => {
    const parts = range.split('-').map((part) => part.trim())
    const start = parseDatePart(parts[0])
    const end = parseDatePart(parts[1] || parts[0])
    const current = { monthIndex: today.getMonth() + 1, day: today.getDate() }

    if (
      start.monthIndex < end.monthIndex ||
      (start.monthIndex === end.monthIndex && start.day <= end.day)
    ) {
      return (
        (current.monthIndex > start.monthIndex ||
          (current.monthIndex === start.monthIndex && current.day >= start.day)) &&
        (current.monthIndex < end.monthIndex ||
          (current.monthIndex === end.monthIndex && current.day <= end.day))
      )
    }

    return (
      current.monthIndex > start.monthIndex ||
      (current.monthIndex === start.monthIndex && current.day >= start.day) ||
      current.monthIndex < end.monthIndex ||
      (current.monthIndex === end.monthIndex && current.day <= end.day)
    )
  }

  const getEntryType = (entry) => entry.id.startsWith('fast-') ? 'fast' : 'feast'
  const getBadgeClasses = (entry) => entry.id.startsWith('fast-')
    ? 'bg-cyan-100 text-cyan-900'
    : 'bg-amber-100 text-amber-900'

  const liturgicalItems = saints.filter((item) => item.id.startsWith('feast-') || item.id.startsWith('fast-'))
  const today = new Date()
  const todayLiturgical = liturgicalItems.find((item) => isDateInRange(item.feast_date, today))

  const sortedLiturgical = liturgicalItems.slice().sort((a, b) => {
    const aDate = parseDatePart(a.feast_date.split('-')[0].trim())
    const bDate = parseDatePart(b.feast_date.split('-')[0].trim())
    if (aDate.monthIndex !== bDate.monthIndex) return aDate.monthIndex - bDate.monthIndex
    return aDate.day - bDate.day
  })

  const nextLiturgical = sortedLiturgical.find((item) => {
    const date = parseDatePart(item.feast_date.split('-')[0].trim())
    if (date.monthIndex > today.getMonth() + 1) return true
    if (date.monthIndex < today.getMonth() + 1) return false
    return date.day >= today.getDate()
  })

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

  const [verseIntervalMinutes, setVerseIntervalMinutes] = useState(120)

  useEffect(() => {
    async function loadUserPreferences() {
      try {
        const res = await fetch('/api/auth/user', { credentials: 'include' })
        if (!res.ok) return
        const data = await res.json()
        if (data.user?.verse_interval_minutes) {
          setVerseIntervalMinutes(data.user.verse_interval_minutes)
        }
      } catch (err) {
        console.error('Failed to load user preferences:', err)
      }
      // Fallback to locally saved preference if present (works for unauthenticated or when API doesn't return)
      try {
        const local = localStorage.getItem('verse_interval_minutes')
        if (local) {
          const v = Number(local)
          if (Number.isFinite(v) && v > 0) setVerseIntervalMinutes(v)
        }
      } catch (e) {
        // ignore (SSR / restricted storage)
      }
    }

    loadUserPreferences()
  }, [])

  useEffect(() => {
    if (!availableReadings || availableReadings.length === 0) return

    const selectReading = () => {
      const now = new Date()
      const cycleNumber = Math.floor(now.getTime() / (verseIntervalMinutes * 60 * 1000))
      const seededRandom = Math.abs(Math.sin(cycleNumber * 12.9898) * 43758.5453) % 1
      const readingIndex = Math.floor(seededRandom * availableReadings.length)
      return availableReadings[readingIndex]
    }

    const getRemainingSeconds = () => {
      const now = new Date()
      const cycleLengthMs = verseIntervalMinutes * 60 * 1000
      const elapsed = now.getTime() % cycleLengthMs
      return Math.max(0, Math.floor((cycleLengthMs - elapsed) / 1000))
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
  }, [availableReadings, verseIntervalMinutes])

  // Listen for interval changes from other tabs or the profile page
  useEffect(() => {
    const onStorage = (e) => {
      if (e.key === 'verse_interval_minutes') {
        const v = Number(e.newValue)
        if (Number.isFinite(v) && v > 0) setVerseIntervalMinutes(v)
      }
    }
    const onCustom = (e) => {
      const v = Number(e.detail)
      if (Number.isFinite(v) && v > 0) setVerseIntervalMinutes(v)
    }
    try {
      window.addEventListener('storage', onStorage)
      window.addEventListener('verseIntervalChanged', onCustom)
    } catch (e) {}
    return () => {
      try {
        window.removeEventListener('storage', onStorage)
        window.removeEventListener('verseIntervalChanged', onCustom)
      } catch (e) {}
    }
  }, [])

  useEffect(() => {
    if (!currentReading?.id) return
    logHistory(currentReading.id).catch(() => {})
  }, [currentReading])

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
            {/* Calendar preview inserted between the verse and Ask button */}
            <div className="mt-6">
              <Link href="/calendar" className="block bg-white/5 backdrop-blur-sm rounded-2xl p-4 hover:bg-white/10 transition border border-white/10">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-[#f4e5d7]">Liturgical Calendar</p>
                    <h3 className="mt-1 text-white font-semibold">{todayLiturgical ? todayLiturgical.name : (nextLiturgical ? `Next: ${nextLiturgical.name}` : 'View calendar')}</h3>
                    <p className="text-sm text-[#f4e5d7] mt-1">{todayLiturgical ? todayLiturgical.feast_date : (nextLiturgical ? nextLiturgical.feast_date : '')}</p>
                  </div>
                  <div>
                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ml-4 ${getBadgeClasses(todayLiturgical || nextLiturgical)}`}>
                      {getEntryType(todayLiturgical || nextLiturgical) === 'fast' ? 'Fast' : 'Feast'}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
            <div className="flex justify-center mt-8">
              <Link href="/ask" className="bg-white text-[#8b1e1e] px-6 py-2 rounded-2xl font-semibold hover:opacity-90 transition">
                Ask a Question
              </Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
