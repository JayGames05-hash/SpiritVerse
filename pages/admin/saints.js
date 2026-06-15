import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import Link from 'next/link'

export default function AdminSaints() {
  const [saints, setSaints] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState({ id: '', name: '', feast_date: '', scripture_ref: '', note: '', reflection: '' })
  const [error, setError] = useState(null)

  const fetchSaints = async () => {
    setLoading(true)
    const res = await fetch('/api/admin/saints')
    const data = await res.json()
    setSaints(data.saints || [])
    setLoading(false)
  }

  useEffect(() => { fetchSaints() }, [])

  const startEdit = (s) => {
    setEditing(s.id)
    setForm({ ...s })
  }

  const startNew = () => {
    setEditing('new')
    setForm({ id: `custom-${Date.now()}`, name: '', feast_date: '', scripture_ref: '', note: '', reflection: '' })
  }

  const save = async () => {
    setError(null)
    try {
      const method = editing === 'new' ? 'POST' : 'PUT'
      const res = await fetch('/api/admin/saints', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
      const data = await res.json()
      if (!res.ok) return setError(data.error || 'Save failed')
      setSaints(data.saints)
      setEditing(null)
    } catch (err) {
      setError('Save error')
    }
  }

  const remove = async (id) => {
    if (!confirm('Delete this entry?')) return
    const res = await fetch(`/api/admin/saints?id=${encodeURIComponent(id)}`, { method: 'DELETE' })
    const data = await res.json()
    if (!res.ok) return setError(data.error || 'Delete failed')
    setSaints(data.saints)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#3d1212] via-[#5c1515] to-[#1b0707]">
      <Header />
      <main className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="bg-white rounded-3xl shadow-xl p-6 sm:p-8 mb-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#4b2d23]">Admin — Saints & Calendar</h1>
            <div className="flex items-center gap-3">
              <Link href="/calendar" className="text-sm text-gray-600 underline">Back to Calendar</Link>
              <button onClick={startNew} className="bg-[#8b1e1e] text-white px-3 py-1 rounded-md">New</button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6">
          {loading && <div>Loading...</div>}
          {!loading && (
            <div className="space-y-4">
              {saints.map(s => (
                <div key={s.id} className="flex items-start justify-between border-b pb-3">
                  <div>
                    <div className="text-sm font-semibold text-[#4b2d23]">{s.name} <span className="text-xs text-gray-500">({s.id})</span></div>
                    <div className="text-xs text-gray-500">{s.feast_date}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button onClick={() => startEdit(s)} className="px-3 py-1 rounded-md bg-white/5">Edit</button>
                    <button onClick={() => remove(s.id)} className="px-3 py-1 rounded-md bg-red-100 text-red-800">Delete</button>
                  </div>
                </div>
              ))}

              {editing && (
                <div className="mt-4 border-t pt-4">
                  <h3 className="text-lg font-semibold mb-2">{editing === 'new' ? 'New Entry' : `Edit ${form.id}`}</h3>
                  {error && <div className="text-red-600 mb-2">{error}</div>}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <input value={form.id} onChange={(e) => setForm(f => ({ ...f, id: e.target.value }))} className="border p-2 rounded" placeholder="id" />
                    <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))} className="border p-2 rounded" placeholder="name" />
                    <input value={form.feast_date} onChange={(e) => setForm(f => ({ ...f, feast_date: e.target.value }))} className="border p-2 rounded" placeholder="feast_date (e.g., January 7 or August 7-22)" />
                    <input value={form.scripture_ref} onChange={(e) => setForm(f => ({ ...f, scripture_ref: e.target.value }))} className="border p-2 rounded" placeholder="scripture_ref" />
                    <textarea value={form.note} onChange={(e) => setForm(f => ({ ...f, note: e.target.value }))} className="border p-2 rounded col-span-1 md:col-span-2" placeholder="note" />
                    <textarea value={form.reflection} onChange={(e) => setForm(f => ({ ...f, reflection: e.target.value }))} className="border p-2 rounded col-span-1 md:col-span-2" placeholder="reflection" />
                  </div>
                  <div className="mt-3 flex gap-2">
                    <button onClick={save} className="bg-[#8b1e1e] text-white px-4 py-2 rounded">Save</button>
                    <button onClick={() => setEditing(null)} className="px-4 py-2 rounded border">Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
