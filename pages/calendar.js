import React from 'react'
import Link from 'next/link'
import Header from '../components/Header'
import saints from '../data/saints'

const getEntryType = (entry) => {
  if (entry.id.startsWith('fast-')) return 'Fast'
  if (entry.id.startsWith('feast-')) return 'Feast'
  return 'Saint'
}

const sortByDate = (a, b) => {
  const parseDate = (dateString) => {
    const [month, day] = dateString.split(' - ')[0].trim().split(' ')
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
    return [monthOrder[month] || 0, Number(day)]
  }

  const [aMonth, aDay] = parseDate(a.feast_date)
  const [bMonth, bDay] = parseDate(b.feast_date)
  if (aMonth !== bMonth) return aMonth - bMonth
  return aDay - bDay
}

export default function CalendarPage() {
  const entries = saints.filter((item) => item.id.startsWith('fast-') || item.id.startsWith('feast-'))
  const sorted = entries.sort(sortByDate)

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-10">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-[#4b2d23] mb-3">Liturgical Calendar</h1>
              <p className="text-gray-600">A Coptic Orthodox feast and fast calendar with dates, themes, and scripture reminders.</p>
            </div>
            <Link href="/saints" className="inline-block bg-[#8b1e1e] text-white px-5 py-3 rounded-2xl font-semibold hover:bg-[#6d1515] transition">
              View Saints
            </Link>
          </div>
        </div>

        <div className="grid gap-6">
          {sorted.map((entry) => {
            const type = getEntryType(entry)
            const badgeClass = type === 'Fast' ? 'bg-cyan-100 text-cyan-900' : 'bg-amber-100 text-amber-900'
            return (
              <div key={entry.id} className="bg-white rounded-3xl shadow-xl p-6 border border-gray-200">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
                  <div>
                    <h2 className="text-2xl font-bold text-[#4b2d23]">{entry.name}</h2>
                    <p className="text-sm text-gray-500 mt-2">{entry.feast_date}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${badgeClass}`}>
                    {type}
                  </span>
                </div>
                <div className="mt-4 text-gray-700 leading-relaxed whitespace-pre-wrap">
                  <p>{entry.note}</p>
                  {entry.scripture_ref && <p className="mt-3 text-sm italic text-gray-600">Scripture: {entry.scripture_ref}</p>}
                </div>
              </div>
            )
          })}
        </div>
      </main>
    </div>
  )
}
