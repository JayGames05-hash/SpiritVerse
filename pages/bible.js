import { useEffect, useState, useRef } from 'react'
import Header from '../components/Header'

const BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
]

export default function BiblePage() {
  const [book, setBook] = useState('John')
  const [chapter, setChapter] = useState('3')
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [bookmarks, setBookmarks] = useState({})
  const [audioStatus, setAudioStatus] = useState('idle')
  const [speechRate, setSpeechRate] = useState(1)
  const [activeVerse, setActiveVerse] = useState(null)
  const [autoPlay, setAutoPlay] = useState(false)
  const versesRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('bible_bookmarks')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) || {}
        const cleaned = Object.fromEntries(Object.entries(parsed).filter(([k, v]) => Array.isArray(v) && v.length > 0))
        setBookmarks(cleaned)
      } catch (e) {
        setBookmarks({})
      }
    }
  }, [])

  useEffect(() => {
    const hash = decodeURIComponent(window.location.hash || '')
    if (hash) {
      const parts = hash.replace('#', '').split('-')
      if (parts.length === 3) {
        setBook(parts[0])
        setChapter(parts[1])
      }
    }
  }, [])

  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && window.speechSynthesis) {
        window.speechSynthesis.cancel()
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setAudioStatus('idle')
    setActiveVerse(null)
  }, [book, chapter])

  useEffect(() => {
    if (!activeVerse) return
    const el = document.getElementById(`verse-${book}-${chapter}-${activeVerse}`)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }
  }, [activeVerse, book, chapter])

  const saveBookmarks = (b) => {
    const cleaned = Object.fromEntries(Object.entries(b).filter(([k, v]) => Array.isArray(v) && v.length > 0))
    setBookmarks(cleaned)
    localStorage.setItem('bible_bookmarks', JSON.stringify(cleaned))
  }

  const toggleBookmark = (verseNum) => {
    const key = `${book}-${chapter}`
    const cur = bookmarks[key] || []
    const exists = cur.includes(verseNum)
    const next = exists ? cur.filter(v => v !== verseNum) : [...cur, verseNum]
    const updated = { ...bookmarks }
    if (next.length === 0) {
      delete updated[key]
    } else {
      updated[key] = next
    }
    saveBookmarks(updated)
  }

  const handleFetch = async () => {
    setLoading(true)
    setData(null)
    try {
      const res = await fetch(`/api/bible?book=${encodeURIComponent(book)}&chapter=${encodeURIComponent(chapter)}`)
      if (!res.ok) throw new Error('Failed to fetch')
      const json = await res.json()
      setData(json)
      setTimeout(() => {
        const hash = decodeURIComponent(window.location.hash || '')
        if (hash) {
          const parts = hash.replace('#', '').split('-')
          if (parts.length === 3 && parts[0] === book && parts[1] === chapter) {
            const v = document.getElementById(`verse-${parts.join('-')}`)
            if (v) v.scrollIntoView({ behavior: 'smooth', block: 'center' })
          }
        }
      }, 50)
    } catch (err) {
      console.error(err)
      alert('Failed to load chapter')
    } finally {
      setLoading(false)
    }
  }

  const openBookmark = (key, verseNum) => {
    const [b, c] = key.split('-')
    setBook(b)
    setChapter(c)
    window.location.hash = `${b}-${c}-${verseNum}`
    setTimeout(handleFetch, 100)
  }

  const speakChapter = () => {
    if (!data?.verses?.length) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not available in this browser.')
      return
    }

    setAutoPlay(true)
    const text = data.verses.map(v => `${v.verse}. ${v.text}`).join(' ')
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = 'en-US'
    utterance.rate = speechRate
    utterance.pitch = 1
    utterance.onstart = () => setAudioStatus('playing')
    utterance.onend = () => setAudioStatus('finished')
    utterance.onerror = () => setAudioStatus('error')

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setAudioStatus('playing')
    setActiveVerse(null)
  }

  const speakVerse = (verseNum) => {
    if (!data?.verses?.length) return
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      alert('Text-to-speech is not available in this browser.')
      return
    }

    const verse = data.verses.find(v => v.verse === verseNum)
    if (!verse) return

    const utterance = new SpeechSynthesisUtterance(`${verse.verse}. ${verse.text}`)
    utterance.lang = 'en-US'
    utterance.rate = speechRate
    utterance.pitch = 1
    utterance.onstart = () => {
      setActiveVerse(verseNum)
      setAudioStatus('playing')
    }
    utterance.onend = () => {
      setActiveVerse(null)
      setAudioStatus('finished')
      if (autoPlay) {
        const nextVerse = data?.verses?.find(v => v.verse === verseNum + 1)
        if (nextVerse) {
          setTimeout(() => speakVerse(nextVerse.verse), 120)
        } else {
          setAutoPlay(false)
        }
      }
    }
    utterance.onerror = () => {
      setActiveVerse(null)
      setAudioStatus('error')
    }

    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
    setAudioStatus('playing')
  }

  const toggleAudio = () => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return

    if (audioStatus === 'paused') {
      window.speechSynthesis.resume()
      setAudioStatus('playing')
      return
    }

    if (audioStatus === 'playing') {
      window.speechSynthesis.pause()
      setAudioStatus('paused')
      return
    }

    speakChapter()
  }

  const stopAudio = () => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel()
    }
    setActiveVerse(null)
    setAudioStatus('stopped')
    setAutoPlay(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main id="content" className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-white">Bible (KJV)</h1>
          <div className="text-sm text-gray-300">Tip: click a verse to focus or use audio controls below</div>
        </div>

        <section className="bg-white rounded-2xl p-4 mb-6 church-panel">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-center">
            <div className="sm:col-span-2">
              <select value={book} onChange={e => setBook(e.target.value)} className="p-3 border rounded w-full text-sm">
                {BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-2">
              <input value={chapter} onChange={e => setChapter(e.target.value)} className="p-3 border rounded w-24 text-sm" />
              <button onClick={handleFetch} disabled={loading} className="px-4 py-2 church-button rounded text-sm">{loading ? 'Loading...' : 'Go'}</button>
            </div>
          </div>

          <div className="mt-4 border-t pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div className="flex items-center gap-2" role="toolbar" aria-label="Audio controls">
              <button onClick={toggleAudio} disabled={!data?.verses?.length} className="px-4 py-2 church-button rounded text-sm" aria-pressed={audioStatus === 'playing'}>{audioStatus === 'playing' ? 'Pause' : 'Play'}</button>
              <button onClick={stopAudio} disabled={!data?.verses?.length} className="px-4 py-2 rounded bg-slate-700 text-white text-sm">Stop</button>
              <button onClick={() => setAutoPlay(!autoPlay)} className={`px-3 py-2 rounded text-sm ${autoPlay ? 'bg-amber-600 text-white' : 'bg-slate-100 text-slate-800'}`}>{autoPlay ? 'Auto' : 'Manual'}</button>
            </div>

            <div className="flex items-center gap-3">
              <label className="text-sm text-gray-600">Speed</label>
              <select id="speechRate" value={speechRate} onChange={e => setSpeechRate(Number(e.target.value))} className="p-2 border rounded text-sm">
                <option value={0.8}>0.8×</option>
                <option value={1}>1.0×</option>
                <option value={1.2}>1.2×</option>
                <option value={1.5}>1.5×</option>
              </select>
              <div className="text-sm text-gray-500" aria-live="polite">{audioStatus === 'playing' ? 'Listening…' : audioStatus === 'paused' ? 'Paused' : audioStatus === 'stopped' ? 'Stopped' : 'Ready'}</div>
            </div>
          </div>
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <div ref={versesRef} className="bg-white rounded-2xl p-6 church-panel">
              {data ? (
                <>
                  <h2 className="text-2xl font-semibold mb-4 church-title text-[#3b1b17]">{data.reference}</h2>
                  <div className="space-y-3">
                    {data.verses && data.verses.map(v => (
                      <article key={v.verse} id={`verse-${book}-${chapter}-${v.verse}`} className={`p-4 rounded-lg border ${ (bookmarks[`${book}-${chapter}`]||[]).includes(v.verse) ? 'bg-yellow-50' : 'bg-white' } ${activeVerse === v.verse ? 'ring-2 ring-emerald-200 bg-emerald-50' : 'shadow-sm'}`}>
                        <div className="flex items-start gap-3">
                          <button onClick={() => toggleBookmark(v.verse)} aria-pressed={(bookmarks[`${book}-${chapter}`]||[]).includes(v.verse)} className="text-lg mt-1" title="Toggle bookmark">{(bookmarks[`${book}-${chapter}`]||[]).includes(v.verse) ? '★' : '☆'}</button>
                          <div>
                            <div className="text-sm text-gray-600 mb-1"><strong>{v.verse}.</strong></div>
                            <p className="text-base text-[#2b1b17] leading-relaxed">{v.text}</p>
                            <div className="mt-2">
                              <button onClick={() => speakVerse(v.verse)} className="text-sm text-emerald-700 underline">Read</button>
                            </div>
                          </div>
                        </div>
                      </article>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-gray-600">No chapter loaded.</div>
              )}
            </div>
          </div>

          <aside className="bg-white rounded-2xl p-4 church-panel">
            <h3 className="font-semibold mb-3">Bookmarks</h3>
            {Object.keys(bookmarks).length === 0 ? (
              <div className="text-sm text-gray-600">No bookmarks yet. Click the star next to a verse to save it.</div>
            ) : (
              <ul className="space-y-2 text-sm">
                {Object.entries(bookmarks).map(([key, verses]) => (
                  <li key={key}>
                    <div className="font-medium">{key}</div>
                    <div className="text-gray-700 mt-1">{verses.map(v => (
                      <button key={v} className="mr-2 text-blue-600 underline" onClick={() => openBookmark(key, v)}>{v}</button>
                    ))}</div>
                  </li>
                ))}
              </ul>
            )}
          </aside>
        </div>
      </main>
    </div>
  )
}
