import Head from 'next/head'
import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import LITURGY from '../../data/liturgy_full.json'

export default function Follow() {
  const sections = LITURGY.sections || []
  const [activeIndex, setActiveIndex] = useState(0)
  const [activeParagraph, setActiveParagraph] = useState(0)

  useEffect(() => {
    // reset paragraph when section changes
    setActiveParagraph(0)
  }, [activeIndex])

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') next()
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') prev()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [activeParagraph, activeIndex])

  const active = sections[activeIndex] || { title: '', content: '' }
  const paragraphs = active.content.split('\n\n').map(p => p.trim()).filter(Boolean)

  function next() {
    if (activeParagraph < paragraphs.length - 1) {
      setActiveParagraph(activeParagraph + 1)
    } else if (activeIndex < sections.length - 1) {
      setActiveIndex(activeIndex + 1)
    }
  }

  function prev() {
    if (activeParagraph > 0) {
      setActiveParagraph(activeParagraph - 1)
    } else if (activeIndex > 0) {
      setActiveIndex(activeIndex - 1)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1d232e] via-[#2c3142] to-[#141922] text-white">
      <Head>
        <title>Follow the Liturgy</title>
      </Head>

      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-4 gap-6">
        <aside className="col-span-1 lg:col-span-1">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-4 sticky top-20">
            <h2 className="text-lg font-semibold mb-3">Liturgy Sections</h2>
            <div className="flex flex-col gap-2 max-h-[70vh] overflow-auto">
              {sections.map((s, i) => (
                <button
                  key={s.title + i}
                  onClick={() => setActiveIndex(i)}
                  className={`text-left p-3 rounded-lg transition ${i === activeIndex ? 'bg-[#6c1d18] text-white' : 'bg-white/5 hover:bg-white/10'}`}
                >
                  <div className="text-sm font-semibold">{s.title}</div>
                </button>
              ))}
            </div>
            <div className="mt-4 text-sm text-slate-300">
              <p>Use arrow keys → / ← to navigate paragraphs, or click below.</p>
            </div>
          </div>
        </aside>

        <section className="col-span-1 lg:col-span-3">
          <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold">{active.title}</h1>
                <p className="mt-2 text-sm text-slate-300">Source: {LITURGY.source}</p>
              </div>
              <div className="flex gap-2">
                <button onClick={prev} className="px-3 py-2 rounded bg-white/6">Previous</button>
                <button onClick={next} className="px-3 py-2 rounded bg-white/6">Next</button>
              </div>
            </div>

            <div className="mt-6 space-y-4">
              {paragraphs.length === 0 && (
                <p className="text-slate-300">No text available for this section.</p>
              )}

              {paragraphs.map((p, idx) => (
                <div
                  key={idx}
                  onClick={() => setActiveParagraph(idx)}
                  className={`p-4 rounded-lg transition ${idx === activeParagraph ? 'bg-[#ffdca8] text-[#3b1a00] shadow-md' : 'bg-white/5 text-slate-200 hover:bg-white/10'}`}
                >
                  <div dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br/>') }} />
                </div>
              ))}
            </div>

            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-slate-300">Paragraph {activeParagraph + 1} of {paragraphs.length}</div>
              <div className="flex gap-2">
                <button onClick={() => setActiveParagraph(0)} className="px-3 py-2 rounded bg-white/6">Start</button>
                <button onClick={() => setActiveParagraph(paragraphs.length - 1)} className="px-3 py-2 rounded bg-white/6">End</button>
              </div>
            </div>

          </div>
        </section>
      </main>

    </div>
  )
}
