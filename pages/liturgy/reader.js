import Head from 'next/head'
import { useEffect, useRef, useState } from 'react'
import Header from '../../components/Header'
import LITURGY from '../../data/liturgy_full.json'

export default function Reader() {
  const sections = LITURGY.sections || []
  const refs = useRef([])
  refs.current = []
  const [active, setActive] = useState(0)

  function setRef(el) {
    if (el) refs.current.push(el)
  }

  useEffect(() => {
    const onScroll = () => {
      const tops = refs.current.map(r => r.getBoundingClientRect().top)
      const idx = tops.findIndex(t => t > 120)
      setActive(idx === -1 ? refs.current.length - 1 : Math.max(0, idx - 1))
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  function scrollTo(i) {
    const el = refs.current[i]
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Head>
        <title>Liturgy Reader</title>
        <meta name="description" content="Liturgy reader built from extracted PDF text." />
      </Head>

      <Header />

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <aside className="lg:col-span-3 sticky top-20 self-start">
          <div className="rounded-xl bg-white shadow p-4 max-h-[75vh] overflow-auto">
            <h2 className="text-lg font-semibold mb-3">Contents</h2>
            <nav className="flex flex-col gap-2">
              {sections.map((s, i) => (
                <button
                  key={s.title + i}
                  onClick={() => scrollTo(i)}
                  className={`text-left w-full p-2 rounded ${i === active ? 'bg-amber-100 font-semibold' : 'hover:bg-slate-100'}`}
                >
                  {s.title}
                </button>
              ))}
            </nav>
            <div className="mt-4 text-xs text-slate-500">Source: {LITURGY.source}</div>
          </div>
        </aside>

        <section className="lg:col-span-9">
          <div className="space-y-8">
            {sections.map((s, i) => (
              <article key={s.title + i} ref={setRef} id={`section-${i}`} className="bg-white p-6 rounded-xl shadow">
                <h3 className="text-2xl font-bold mb-2">{s.heading || s.title}</h3>
                {s.content ? (
                  s.content.split('\n\n').map((p, idx) => (
                    <p key={idx} className="leading-7 text-slate-700 mb-3" dangerouslySetInnerHTML={{ __html: p.replace(/\n/g, '<br/>') }} />
                  ))
                ) : (
                  <p className="text-slate-500 italic">(No text available for this section.)</p>
                )}
                <div className="mt-2 text-sm text-slate-400">Section {i + 1}</div>
              </article>
            ))}
          </div>
        </section>
      </main>
    </div>
  )
}
