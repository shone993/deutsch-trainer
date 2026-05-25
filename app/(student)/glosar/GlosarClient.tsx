'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

interface VerbRow {
  id:            string
  infinitiv:     string
  perfekt:       string
  translation:   string | null
  translationHu: string | null
  translationEn: string | null
  lesson:        number
}

interface Props {
  verbs: VerbRow[]
}

const LESSONS = Array.from({ length: 13 }, (_, i) => i + 1)

export function GlosarClient({ verbs }: Props) {
  const router = useRouter()
  const [search, setSearch]   = useState('')
  const [lesson, setLesson]   = useState<number | 'sve'>('sve')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return verbs.filter((v) => {
      if (lesson !== 'sve' && v.lesson !== lesson) return false
      if (!q) return true
      return (
        v.infinitiv.toLowerCase().includes(q) ||
        v.perfekt.toLowerCase().includes(q) ||
        (v.translation   ?? '').toLowerCase().includes(q) ||
        (v.translationHu ?? '').toLowerCase().includes(q) ||
        (v.translationEn ?? '').toLowerCase().includes(q)
      )
    })
  }, [verbs, search, lesson])

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-sky-500 text-white px-4 py-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-4xl mx-auto flex items-center gap-3">
          <div className="bg-white rounded-lg px-2 py-1 flex-shrink-0">
            <Image src="/vts-transparent.png" alt="VTŠ" width={40} height={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base leading-tight">Glosar</h1>
            <p className="text-sky-100 text-xs">{filtered.length} / {verbs.length} glagola</p>
          </div>
          <button
            onClick={() => router.push('/profile')}
            className="text-sky-100 hover:text-white text-sm flex-shrink-0"
          >
            ← Nazad
          </button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-4 space-y-3">
        {/* Filter traka */}
        <div className="flex gap-2">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži glagol ili prevod…"
            className="flex-1 border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <select
            value={lesson}
            onChange={(e) => setLesson(e.target.value === 'sve' ? 'sve' : Number(e.target.value))}
            className="border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 bg-white"
          >
            <option value="sve">Sve lekcije</option>
            {LESSONS.map((l) => (
              <option key={l} value={l}>Lekcija {l}</option>
            ))}
          </select>
        </div>

        {/* Legenda kolona */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-sky-50 text-sky-700">
                <th className="px-3 py-3 text-left font-semibold w-8">#</th>
                <th className="px-3 py-3 text-left font-semibold">Infinitiv</th>
                <th className="px-3 py-3 text-left font-semibold">Partizip II</th>
                <th className="px-3 py-3 text-left font-semibold">
                  <span className="mr-1">🇷🇸</span>Srpski
                </th>
                <th className="px-3 py-3 text-left font-semibold">
                  <span className="mr-1">🇭🇺</span>Magyar
                </th>
                <th className="px-3 py-3 text-left font-semibold">
                  <span className="mr-1">🇬🇧</span>English
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-gray-400">
                    Nema rezultata za &ldquo;{search}&rdquo;
                  </td>
                </tr>
              ) : (
                filtered.map((v, idx) => (
                  <tr
                    key={v.id}
                    className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <td className="px-3 py-2.5 text-gray-400 text-xs">{v.lesson}</td>
                    <td className="px-3 py-2.5 font-semibold text-gray-900">{v.infinitiv}</td>
                    <td className="px-3 py-2.5 text-gray-600 font-mono text-xs">{v.perfekt}</td>
                    <td className="px-3 py-2.5 text-gray-700">{v.translation  ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-3 py-2.5 text-gray-700">{v.translationHu ?? <span className="text-gray-300">—</span>}</td>
                    <td className="px-3 py-2.5 text-gray-700">{v.translationEn ?? <span className="text-gray-300">—</span>}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-center text-gray-400 pb-4">
          Ukupno {verbs.length} glagola · Deutsch Trainer — VTŠ Subotica
        </p>
      </div>
    </main>
  )
}
