import { useEffect, useState } from 'react'
import Header from '../components/Header'
import { getDailyLiturgyForDate } from '../data/dailyLiturgy'
import { findFeastFastForDate } from '../data/fastsFeasts2026'

export default function LiturgyTodayPage() {
  const [liturgy, setLiturgy] = useState(null)
  const [season, setSeason] = useState(null)
  const [dateString, setDateString] = useState('')
  const [passages, setPassages] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadLiturgy() {
      const today = new Date()
      setDateString(today.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }))
      const entry = getDailyLiturgyForDate(today)
      setLiturgy(entry)
      setSeason(findFeastFastForDate(today))

      if (!entry) {
        setLoading(false)
        return
      }

      try {
        const keys = ['old_testament', 'epistle', 'gospel']
        const responses = await Promise.all(keys.map(async (key) => {
          const ref = entry[key]
          if (!ref) return { key, error: 'Missing reference' }
          const apiRes = await fetch(`/api/bible?ref=${encodeURIComponent(ref)}`)
          if (!apiRes.ok) {
            const errorBody = await apiRes.json().catch(() => ({}))
            return { key, error: errorBody.error || 'Bible API error' }
          }
          const data = await apiRes.json()
          return { key, data }
        }))

        const formatted = responses.reduce((acc, item) => {
          acc[item.key] = item.error ? { error: item.error } : item.data
          return acc
        }, {})

        setPassages(formatted)
      } catch (err) {
        console.error('Failed to fetch liturgy passages:', err)
      } finally {
        setLoading(false)
      }
    }

    loadLiturgy()
  }, [])

  const renderPassage = (label, entryKey) => {
    if (!liturgy) return null
    const ref = liturgy[entryKey]
    const result = passages?.[entryKey]

    return (
      <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
        <h3 className="font-semibold text-white mb-2">{label}</h3>
        <p className="text-slate-300 mb-3">{ref}</p>
        {loading ? (
          <p className="text-slate-400">Loading passage…</p>
        ) : result?.error ? (
          <p className="text-rose-300">{result.error}</p>
        ) : result?.data?.verses ? (
          <div className="space-y-3 text-slate-200">
            {result.data.verses.map((verse) => (
              <p key={verse.verse}><span className="font-semibold">{verse.verse}.</span> {verse.text}</p>
            ))}
          </div>
        ) : (
          <p className="text-slate-400">No passage available.</p>
        )}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d232e] via-[#2c3142] to-[#141922] text-white">
      <Header />
      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="rounded-3xl bg-white/5 border border-white/10 p-8">
          <h1 className="text-4xl font-bold mb-3">Today’s Liturgy</h1>
          <p className="text-slate-300 mb-6">{dateString}</p>

          {season && (
            <div className="rounded-3xl bg-slate-800/90 p-5 border border-slate-700 mb-6">
              <div className="flex items-start justify-between gap-4 flex-col sm:flex-row">
                <div>
                  <p className="text-sm uppercase tracking-[0.22em] text-slate-400">Current Fast/Feast</p>
                  <h2 className="text-2xl font-semibold text-white mt-1">{season.name}</h2>
                  <p className="text-slate-300 mt-1">{season.feast_date}</p>
                </div>
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${season.type === 'fast' ? 'bg-cyan-100 text-cyan-900' : 'bg-amber-100 text-amber-900'}`}>
                  {season.type === 'fast' ? 'Fast' : 'Feast'}
                </span>
              </div>
              <p className="text-slate-400 mt-3">{season.note}</p>
            </div>
          )}

          {liturgy ? (
            <div className="space-y-6">
              <div className="rounded-3xl bg-slate-900/80 p-6 border border-slate-700">
                <h2 className="text-2xl font-semibold text-white">{liturgy.liturgy}</h2>
                <p className="text-slate-300 mt-2">{liturgy.title}</p>
              </div>

              <div className="space-y-4">
                {renderPassage('Old Testament', 'old_testament')}
                {renderPassage('Epistle', 'epistle')}
                {renderPassage('Gospel', 'gospel')}
              </div>

              <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                <h3 className="font-semibold text-white mb-2">Notes</h3>
                <p className="text-slate-300 whitespace-pre-wrap">{liturgy.note}</p>
              </div>
            </div>
          ) : (
            <div className="rounded-3xl bg-white/5 p-6 border border-white/10">
              <p className="text-slate-300">No liturgy readings are loaded for today. Add the proper daily readings to <code className="text-white">data/dailyLiturgy.js</code> for accurate results.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
