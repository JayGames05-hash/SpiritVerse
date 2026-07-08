import { useEffect, useState, useRef } from 'react'
import Header from '../components/Header'

const BOOKS = [
  'Genesis','Exodus','Leviticus','Numbers','Deuteronomy','Joshua','Judges','Ruth','1 Samuel','2 Samuel','1 Kings','2 Kings','1 Chronicles','2 Chronicles','Ezra','Nehemiah','Esther','Job','Psalms','Proverbs','Ecclesiastes','Song of Solomon','Isaiah','Jeremiah','Lamentations','Ezekiel','Daniel','Hosea','Joel','Amos','Obadiah','Jonah','Micah','Nahum','Habakkuk','Zephaniah','Haggai','Zechariah','Malachi','Matthew','Mark','Luke','John','Acts','Romans','1 Corinthians','2 Corinthians','Galatians','Ephesians','Philippians','Colossians','1 Thessalonians','2 Thessalonians','1 Timothy','2 Timothy','Titus','Philemon','Hebrews','James','1 Peter','2 Peter','1 John','2 John','3 John','Jude','Revelation'
]

// Chapter counts for each book (KJV canonical counts)
const CHAPTER_COUNTS = {
  'Genesis':50,'Exodus':40,'Leviticus':27,'Numbers':36,'Deuteronomy':34,'Joshua':24,'Judges':21,'Ruth':4,'1 Samuel':31,'2 Samuel':24,'1 Kings':22,'2 Kings':25,'1 Chronicles':29,'2 Chronicles':36,'Ezra':10,'Nehemiah':13,'Esther':10,'Job':42,'Psalms':150,'Proverbs':31,'Ecclesiastes':12,'Song of Solomon':8,'Isaiah':66,'Jeremiah':52,'Lamentations':5,'Ezekiel':48,'Daniel':12,'Hosea':14,'Joel':3,'Amos':9,'Obadiah':1,'Jonah':4,'Micah':7,'Nahum':3,'Habakkuk':3,'Zephaniah':3,'Haggai':2,'Zechariah':14,'Malachi':4,'Matthew':28,'Mark':16,'Luke':24,'John':21,'Acts':28,'Romans':16,'1 Corinthians':16,'2 Corinthians':13,'Galatians':6,'Ephesians':6,'Philippians':4,'Colossians':4,'1 Thessalonians':5,'2 Thessalonians':3,'1 Timothy':6,'2 Timothy':4,'Titus':3,'Philemon':1,'Hebrews':13,'James':5,'1 Peter':5,'2 Peter':3,'1 John':5,'2 John':1,'3 John':1,'Jude':1,'Revelation':22
}

export default function BiblePage() {
  const [book, setBook] = useState('John')
  const [chapter, setChapter] = useState('3')
  const [chapterCount, setChapterCount] = useState(CHAPTER_COUNTS['John'] || 1)
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState(null)
  const [bookmarks, setBookmarks] = useState({})
  const [prefs, setPrefs] = useState({ theme: 'dark', fontSize: 'md' })
  const versesRef = useRef(null)

  useEffect(() => {
    const stored = localStorage.getItem('bible_bookmarks')
    if (stored) {
      try {
        const parsed = JSON.parse(stored) || {}
        // remove any empty arrays that may have been left behind
        const cleaned = Object.fromEntries(Object.entries(parsed).filter(([k, v]) => Array.isArray(v) && v.length > 0))
        setBookmarks(cleaned)
        // persist cleaned version back to storage
        localStorage.setItem('bible_bookmarks', JSON.stringify(cleaned))
      } catch (e) {
        // ignore parse errors
        setBookmarks({})
      }
    }
  }, [])

    useEffect(() => {
      const p = localStorage.getItem('bible_prefs')
      if (p) {
        try { setPrefs(JSON.parse(p)) } catch (e) {}
      }
    }, [])

  useEffect(() => {
    // If URL has hash like #John-3-16, jump to it
    const hash = decodeURIComponent(window.location.hash || '')
    if (hash) {
      const parts = hash.replace('#', '').split('-')
      if (parts.length === 3) {
        setBook(parts[0])
        setChapter(parts[1])
        // fetch will run via handleFetch below
      }
    }
  }, [])

  useEffect(() => {
    // update available chapter count when book changes
    const count = CHAPTER_COUNTS[book] || 1
    setChapterCount(count)
    // coerce chapter if out of range
    if (Number(chapter) > count) setChapter(String(count))
  }, [book])

  const saveBookmarks = (b) => {
    // Ensure we don't persist empty bookmark groups
    const cleaned = Object.fromEntries(Object.entries(b).filter(([k, v]) => Array.isArray(v) && v.length > 0))
    setBookmarks(cleaned)
    localStorage.setItem('bible_bookmarks', JSON.stringify(cleaned))
  }

  const toggleBookmark = (verseNum) => {
    const key = `${book}-${chapter}`
    const cur = bookmarks[key] || []
    const exists = cur.includes(verseNum)
    const next = exists ? cur.filter(v => v !== verseNum) : [...cur, verseNum]
    // If removing the last verse for this key, delete the key entirely
    const updated = { ...bookmarks }
    if (next.length === 0) {
      delete updated[key]
    } else {
      updated[key] = next
    }
    saveBookmarks(updated)
  }

  const savePrefs = (next) => {
    const merged = { ...prefs, ...next }
    setPrefs(merged)
    localStorage.setItem('bible_prefs', JSON.stringify(merged))
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
        // if hash targets verse, scroll
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
    // update hash so after fetch it will scroll
    window.location.hash = `${b}-${c}-${verseNum}`
    setTimeout(handleFetch, 100)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <h1 className="text-3xl font-bold text-white mb-4">Bible (KJV)</h1>

        <div className="bg-white rounded-2xl p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3">
            <select value={book} onChange={e => setBook(e.target.value)} className="p-2 border rounded w-full sm:w-1/2">
              {BOOKS.map(b => <option key={b} value={b}>{b}</option>)}
            </select>
            <div className="flex gap-2 w-full sm:w-auto">
              <select value={chapter} onChange={e => setChapter(e.target.value)} className="p-2 border rounded w-24">
                {Array.from({ length: chapterCount }, (_, i) => String(i + 1)).map(n => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
              <button onClick={handleFetch} disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded">{loading ? 'Loading...' : 'Go'}</button>
            </div>

            <div className="ml-auto flex gap-2 items-center">
              <label className="text-sm">Font</label>
              <select value={prefs.fontSize} onChange={e => savePrefs({ fontSize: e.target.value })} className="p-2 border rounded">
                <option value="md">Normal</option>
                <option value="lg">Large</option>
                <option value="xl">XL</option>
              </select>
              <label className="text-sm">Theme</label>
              <select value={prefs.theme} onChange={e => savePrefs({ theme: e.target.value })} className="p-2 border rounded">
                <option value="dark">Dark</option>
                <option value="light">Light</option>
              </select>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <div ref={versesRef} className={`rounded-2xl p-4 ${prefs.theme === 'light' ? 'bg-white text-black' : 'bg-white text-black'}`}>
              {data ? (
                <>
                  <h2 className="text-xl font-semibold mb-3">{data.reference}</h2>
                  <div>
                    {data.verses && data.verses.map(v => (
                      <div key={v.verse} id={`verse-${book}-${chapter}-${v.verse}`} className={`py-2 border-b last:border-b-0 ${ (bookmarks[`${book}-${chapter}`]||[]).includes(v.verse) ? 'bg-yellow-300' : ''}`}>
                        <button
                          onClick={() => toggleBookmark(v.verse)}
                          aria-pressed={(bookmarks[`${book}-${chapter}`]||[]).includes(v.verse)}
                          title="Toggle bookmark"
                          className={`mr-3 text-sm focus:outline-none ${ (bookmarks[`${book}-${chapter}`]||[]).includes(v.verse) ? 'text-yellow-700 text-lg' : 'text-gray-500' }`}
                        >
                          {(bookmarks[`${book}-${chapter}`]||[]).includes(v.verse) ? '★' : '☆'}
                        </button>
                        <span className="font-semibold mr-2">{v.verse}.</span>
                        <span className={prefs.fontSize === 'md' ? 'text-black text-base' : prefs.fontSize === 'lg' ? 'text-black text-lg' : 'text-black text-xl'}>{v.text}</span>
                        {/* Link removed per request */}
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
            <h3 className="font-semibold mb-3 text-black">Bookmarks</h3>
            {Object.keys(bookmarks).length === 0 ? (
                <div className="text-sm text-gray-800">No bookmarks yet. Click the star next to a verse to save it.</div>
            ) : (
              <ul className="space-y-2">
                {Object.entries(bookmarks).map(([key, verses]) => (
                  <li key={key} className="text-sm">
                    <div className="font-medium text-black">{key}</div>
                    <div className="text-gray-900">{verses.map(v => (
                      <button key={v} className="mr-2 text-blue-800" onClick={() => openBookmark(key, v)}>{v}</button>
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
