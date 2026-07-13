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
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl font-bold text-white mb-4">Bible (KJV)</h1>

        <div className="bg-white rounded-2xl p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <select value={book} onChange={e => setBook(e.target.value)} className="p-2 border rounded w-full sm:w-1/2">
              {BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <input value={chapter} onChange={e => setChapter(e.target.value)} className="p-2 border rounded w-24" />
            <button onClick={handleFetch} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Loading...' : 'Go'}</button>
          </div>

          <div className="mt-4 flex flex-wrap gap-3 items-center border-t pt-4" role="toolbar" aria-label="Audio controls">
            <button
              onClick={toggleAudio}
              disabled={!data?.verses?.length}
              className="px-4 py-3 min-w-[44px] min-h-[44px] bg-emerald-600 text-white rounded disabled:opacity-60"
              aria-pressed={audioStatus === 'playing'}
              aria-label={audioStatus === 'playing' ? 'Pause reading' : audioStatus === 'paused' ? 'Resume reading' : 'Read chapter aloud'}
              onKeyDown={(e) => { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggleAudio() } }}
            >
              {audioStatus === 'playing' ? 'Pause' : audioStatus === 'paused' ? 'Resume' : 'Read'}
            </button>
            <button
              onClick={stopAudio}
              disabled={!data?.verses?.length}
              className="px-4 py-3 min-w-[44px] min-h-[44px] bg-slate-700 text-white rounded disabled:opacity-60"
              aria-label="Stop reading"
            >Stop</button>
            <button
              onClick={() => setAutoPlay(!autoPlay)}
              className={`px-4 py-3 min-w-[44px] min-h-[44px] rounded ${autoPlay ? 'bg-amber-600 text-white' : 'bg-slate-200 text-slate-800'}`}
              aria-pressed={autoPlay}
              aria-label={autoPlay ? 'Auto-play enabled' : 'Enable auto-play'}
            >
              {autoPlay ? 'Auto-on' : 'Auto-off'}
            </button>
            <label className="text-sm text-gray-600 flex items-center" htmlFor="speechRate">
              Speed
              <select id="speechRate" value={speechRate} onChange={e => setSpeechRate(Number(e.target.value))} className="ml-2 p-2 border rounded">
                <option value={0.8}>0.8×</option>
                <option value={1}>1.0×</option>
                <option value={1.2}>1.2×</option>
                <option value={1.5}>1.5×</option>
              </select>
            </label>
            <span className="text-sm text-gray-500" aria-live="polite">{audioStatus === 'playing' ? 'Listening now…' : audioStatus === 'paused' ? 'Paused' : audioStatus === 'stopped' ? 'Stopped' : 'Ready to read'}</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div ref={versesRef} className="bg-white rounded-2xl p-4">
              {data ? (
                <>
                  <h2 className="text-xl font-semibold mb-3">{data.reference}</h2>
                  <div>
                    {data.verses && data.verses.map(v => (
                      <div key={v.verse} id={`verse-${book}-${chapter}-${v.verse}`} className={`py-2 border-b last:border-b-0 ${ (bookmarks[`${book}-${chapter}`]||[]).includes(v.verse) ? 'bg-yellow-200' : ''} ${activeVerse === v.verse ? 'bg-emerald-50 ring-1 ring-emerald-200' : ''}`}>
                        <button
                          onClick={() => toggleBookmark(v.verse)}
                          aria-pressed={(bookmarks[`${book}-${chapter}`]||[]).includes(v.verse)}
                          title="Toggle bookmark"
                          className={`mr-3 text-sm focus:outline-none ${ (bookmarks[`${book}-${chapter}`]||[]).includes(v.verse) ? 'text-yellow-700 text-lg' : 'text-gray-500' }`}
                        >
                          {(bookmarks[`${book}-${chapter}`]||[]).includes(v.verse) ? '★' : '☆'}
                        </button>
                        <span className="font-semibold mr-2">{v.verse}.</span>
                        <span className="text-black">{v.text}</span>
                        <button onClick={() => speakVerse(v.verse)} className="ml-3 text-xs text-emerald-700 underline">Read verse</button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-gray-600">No chapter loaded.</div>
              )}
            </div>
          </div>

          <aside className="bg-white rounded-2xl p-4">
            <h3 className="font-semibold mb-3">Bookmarks</h3>
            {Object.keys(bookmarks).length === 0 ? (
              <div className="text-sm text-gray-600">No bookmarks yet. Click the star next to a verse to save it.</div>
            ) : (
              <ul className="space-y-2">
                {Object.entries(bookmarks).map(([key, verses]) => (
                  <li key={key} className="text-sm">
                    <div className="font-medium">{key}</div>
                    <div className="text-gray-700">{verses.map(v => (
                      <button key={v} className="mr-2 text-blue-600" onClick={() => openBookmark(key, v)}>{v}</button>
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
