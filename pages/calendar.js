import React, { useMemo, useState } from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import saints from '../data/saints'

const monthOrder = {
  January: 1, February: 2, March: 3, April: 4, May: 5, June: 6,
  July: 7, August: 8, September: 9, October: 10, November: 11, December: 12,
}

const parseDateToken = (token) => {
  if (!token) return null
  const parts = token.trim().split(' ').filter(Boolean)
  if (parts.length < 2) return null
  const month = parts[0]
  const day = Number(parts[1].replace(',', '').trim())
  return { monthIndex: monthOrder[month] || 0, day }
}

const dayOfYear = (d) => {
  const start = new Date(d.getFullYear(), 0, 0)
  const diff = d - start
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

const isDateInRange = (range, date) => {
  if (!range) return false
  const parts = range.split('-').map(p => p.trim())
  const start = parseDateToken(parts[0])
  const end = parts[1] ? parseDateToken(parts[1]) : start
  if (!start || !end) return false

  const year = date.getFullYear()
  const targetDOY = dayOfYear(date)
  const startDOY = dayOfYear(new Date(year, start.monthIndex - 1, start.day))
  const endDOY = dayOfYear(new Date(year, end.monthIndex - 1, end.day))

  if (startDOY <= endDOY) {
    return targetDOY >= startDOY && targetDOY <= endDOY
  }
  return targetDOY >= startDOY || targetDOY <= endDOY
}

const getEntryType = (entry) => {
  if (entry.id.startsWith('fast-')) return 'Fast'
  if (entry.id.startsWith('feast-')) return 'Feast'
  return 'Saint'
}

const sortByDate = (a, b) => {
  const parseDate = (dateString) => {
    const token = dateString.split('-')[0].trim()
    const parsed = parseDateToken(token)
    return [parsed?.monthIndex || 0, parsed?.day || 0]
  }
  const [aM, aD] = parseDate(a.feast_date)
  const [bM, bD] = parseDate(b.feast_date)
  if (aM !== bM) return aM - bM
  return aD - bD
}

export default function CalendarPage() {
  const entries = saints.filter((item) => item.id.startsWith('fast-') || item.id.startsWith('feast-'))

  const realToday = new Date()
  const baseYear = realToday.getFullYear()
  const baseMonth = realToday.getMonth()

  const [monthOffset, setMonthOffset] = useState(0)
  const displayed = new Date(baseYear, baseMonth + monthOffset, 1)
  const year = displayed.getFullYear()
  const month = displayed.getMonth()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const firstDayIndex = new Date(year, month, 1).getDay()

  const entriesByDate = useMemo(() => {
    const map = {}
    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d)
      const key = `${year}-${month + 1}-${d}`
      map[key] = entries.filter(e => isDateInRange(e.feast_date, date))
    }
    return map
  }, [entries, year, month, daysInMonth])

  const [selectedDate, setSelectedDate] = useState(null)
  const selectedEntries = selectedDate ? entriesByDate[selectedDate] || [] : []

  const weekDayNames = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat']

  const upcoming = entries.slice().sort(sortByDate).slice(0, 8)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#4b2d23] mb-3">Liturgical Calendar</h1>
              <p className="text-gray-600">A monthly view of feasts and fasts — click a day to see details.</p>
            </div>
            <Link href="/saints" className="inline-block bg-[#8b1e1e] text-white px-5 py-3 rounded-2xl font-semibold hover:bg-[#6d1515] transition">
              View Saints
            </Link>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-4 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <button onClick={() => setMonthOffset(m => m - 1)} className="px-3 py-1 rounded-md bg-white/5 hover:bg-white/10">◀</button>
              <h2 className="text-lg font-semibold text-[#4b2d23]">{displayed.toLocaleString('default', { month: 'long' })} {year}</h2>
              <button onClick={() => setMonthOffset(m => m + 1)} className="px-3 py-1 rounded-md bg-white/5 hover:bg-white/10">▶</button>
            </div>
            <div className="text-sm text-gray-500">Click a day to view feasts/fasts</div>
          </div>

          <div className="grid grid-cols-7 gap-2 text-center text-sm text-gray-600 mb-2">
            {weekDayNames.map((w) => (
              <div key={w} className="font-medium">{w}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: firstDayIndex }).map((_, idx) => (
              <div key={`pad-${idx}`} className="p-3 rounded-lg bg-transparent" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1
              const key = `${year}-${month + 1}-${day}`
              const dayEntries = entriesByDate[key] || []
              const isToday = realToday.getFullYear() === year && realToday.getMonth() === month && realToday.getDate() === day
              return (
                <button
                  key={key}
                  onClick={() => setSelectedDate(key)}
                  className={`p-3 rounded-lg text-left border ${selectedDate === key ? 'ring-2 ring-[#8b1e1e]' : 'border-gray-100'} bg-white hover:shadow-sm`}
                >
                  <div className="flex items-center justify-between">
                    <div className={`text-sm font-medium ${isToday ? 'text-[#8b1e1e]' : 'text-gray-800'}`}>{day}</div>
                    <div className="flex items-center gap-1">
                      {dayEntries.slice(0,2).map(e => {
                        const cls = e.id.startsWith('fast-') ? 'bg-cyan-100 text-cyan-900' : 'bg-amber-100 text-amber-900'
                        return <span key={e.id} className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cls}`}>{e.id.startsWith('fast-') ? 'Fast' : 'Feast'}</span>
                      })}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-2xl p-6">
            <h3 className="text-lg font-semibold text-[#4b2d23] mb-3">{selectedDate ? `Events for ${selectedDate}` : 'Select a day'}</h3>
            {selectedEntries.length === 0 && <p className="text-gray-600">No feasts or fasts on this day.</p>}
            {selectedEntries.map((entry) => (
              <div key={entry.id} className="mb-4 border-t pt-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold text-[#4b2d23]">{entry.name}</h4>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${entry.id.startsWith('fast-') ? 'bg-cyan-100 text-cyan-900' : 'bg-amber-100 text-amber-900'}`}>
                    {entry.id.startsWith('fast-') ? 'Fast' : 'Feast'}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">{entry.feast_date}</p>
                <div className="mt-2 text-gray-700 whitespace-pre-wrap">{entry.note}</div>
                {entry.scripture_ref && <p className="mt-2 italic text-gray-600">Scripture: {entry.scripture_ref}</p>}
              </div>
            ))}
          </div>

          <aside className="bg-white rounded-2xl p-6">
            <h4 className="font-semibold text-[#4b2d23] mb-2">Upcoming</h4>
            <div className="space-y-3">
              {upcoming.map(e => (
                <div key={e.id} className="flex items-start justify-between">
                  <div>
                    <div className="text-sm font-semibold text-[#4b2d23]">{e.name}</div>
                    <div className="text-xs text-gray-500">{e.feast_date}</div>
                  </div>
                  <div className="ml-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${e.id.startsWith('fast-') ? 'bg-cyan-100 text-cyan-900' : 'bg-amber-100 text-amber-900'}`}>{e.id.startsWith('fast-') ? 'Fast' : 'Feast'}</span>
                  </div>
                </div>
              ))}
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}
