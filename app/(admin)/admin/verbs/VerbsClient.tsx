'use client'

import { useState, useTransition } from 'react'

export interface VerbRow {
  id: string
  infinitiv: string
  lesson: number
  translation: string | null
  translationHu: string | null
  isActive: boolean
}

interface Props { verbs: VerbRow[] }

export function VerbsClient({ verbs }: Props) {
  const [search, setSearch] = useState('')
  const [lessonFilter, setLessonFilter] = useState<number | 'all'>('all')
  const [editId, setEditId] = useState<string | null>(null)
  const [editSr, setEditSr] = useState('')
  const [editHu, setEditHu] = useState('')
  const [saving, startSaving] = useTransition()
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

  const filtered = verbs.filter(v => {
    const matchSearch = v.infinitiv.toLowerCase().includes(search.toLowerCase())
      || (v.translation ?? '').toLowerCase().includes(search.toLowerCase())
    const matchLesson = lessonFilter === 'all' || v.lesson === lessonFilter
    return matchSearch && matchLesson
  })

  const lessons = Array.from(new Set(verbs.map(v => v.lesson))).sort((a, b) => a - b)

  function startEdit(v: VerbRow) {
    setEditId(v.id)
    setEditSr(v.translation ?? '')
    setEditHu(v.translationHu ?? '')
  }

  function saveEdit(id: string) {
    startSaving(async () => {
      const res = await fetch('/api/admin/verbs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, translation: editSr, translationHu: editHu }),
      })
      if (res.ok) {
        setSavedIds(prev => new Set(prev).add(id))
        setEditId(null)
        // Refresh to show updated data
        window.location.reload()
      }
    })
  }

  const emptyCount = verbs.filter(v => !v.translation || !v.translationHu).length

  return (
    <div className="space-y-4">
      {/* Summary */}
      {emptyCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-sm text-amber-800">
          ⚠️ <strong>{emptyCount}</strong> glagola bez prevoda
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <input
          type="text"
          placeholder="Pretraži glagole..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm flex-1 min-w-48"
        />
        <select
          value={lessonFilter}
          onChange={e => setLessonFilter(e.target.value === 'all' ? 'all' : Number(e.target.value))}
          className="border border-gray-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="all">Sve lekcije</option>
          {lessons.map(l => (
            <option key={l} value={l}>Lekcija {l}</option>
          ))}
        </select>
      </div>

      <p className="text-xs text-gray-500">{filtered.length} / {verbs.length} glagola</p>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Infinitiv</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Lekcija</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Srpski</th>
              <th className="text-left px-4 py-3 font-semibold text-gray-700">Mađarski</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filtered.map(v => (
              <tr key={v.id} className={`hover:bg-gray-50 ${savedIds.has(v.id) ? 'bg-green-50' : ''}`}>
                <td className="px-4 py-3 font-medium text-gray-900">{v.infinitiv}</td>
                <td className="px-4 py-3 text-gray-500">{v.lesson}</td>
                {editId === v.id ? (
                  <>
                    <td className="px-4 py-2">
                      <input
                        value={editSr}
                        onChange={e => setEditSr(e.target.value)}
                        className="border border-indigo-300 rounded px-2 py-1 text-sm w-full"
                        placeholder="srpski prevod"
                        autoFocus
                      />
                    </td>
                    <td className="px-4 py-2">
                      <input
                        value={editHu}
                        onChange={e => setEditHu(e.target.value)}
                        className="border border-indigo-300 rounded px-2 py-1 text-sm w-full"
                        placeholder="mađarski prevod"
                      />
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      <button
                        onClick={() => saveEdit(v.id)}
                        disabled={saving}
                        className="bg-indigo-600 text-white px-3 py-1 rounded text-xs hover:bg-indigo-700 disabled:opacity-50"
                      >
                        {saving ? '...' : 'Sačuvaj'}
                      </button>
                      <button
                        onClick={() => setEditId(null)}
                        className="text-gray-500 px-2 py-1 rounded text-xs hover:bg-gray-100"
                      >
                        Otkaži
                      </button>
                    </td>
                  </>
                ) : (
                  <>
                    <td className={`px-4 py-3 ${!v.translation ? 'text-red-400 italic' : 'text-gray-700'}`}>
                      {v.translation || '—'}
                    </td>
                    <td className={`px-4 py-3 ${!v.translationHu ? 'text-red-400 italic' : 'text-gray-700'}`}>
                      {v.translationHu || '—'}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => startEdit(v)}
                        className="text-indigo-600 hover:text-indigo-800 text-xs font-medium"
                      >
                        Uredi
                      </button>
                    </td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <p className="text-center text-gray-500 py-8 text-sm">Nema rezultata</p>
        )}
      </div>
    </div>
  )
}
