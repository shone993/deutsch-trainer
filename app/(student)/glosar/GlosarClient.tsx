'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export interface GlossaryItem {
  id:            string
  german:        string
  category:      'verb' | 'noun' | 'word'
  translationSr: string | null
  translationHu: string | null
  lesson:        number | null
}

interface Props {
  items: GlossaryItem[]
}

type LangCol = 'sr' | 'hu'
type Category = 'all' | 'verb' | 'noun' | 'word'

const CAT_LABELS: Record<Category, string> = {
  all:  'Sve',
  verb: '📝 Glagoli',
  noun: '🏷️ Imenice',
  word: '💬 Ostalo',
}

const LANG_OPTIONS: { code: LangCol; flag: string; label: string }[] = [
  { code: 'sr', flag: '🇷🇸', label: 'Srpski' },
  { code: 'hu', flag: '🇭🇺', label: 'Magyar' },
]

export function GlosarClient({ items }: Props) {
  const router = useRouter()
  const [search, setSearch]     = useState('')
  const [category, setCategory] = useState<Category>('all')
  const [lang, setLang]         = useState<LangCol>('sr')

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return items.filter((item) => {
      if (category !== 'all' && item.category !== category) return false
      if (!q) return true
      const tr = lang === 'sr' ? item.translationSr : item.translationHu
      return (
        item.german.toLowerCase().includes(q) ||
        (tr ?? '').toLowerCase().includes(q)
      )
    })
  }, [items, search, category, lang])

  const total = items.length

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-sky-500 text-white px-4 py-4 sticky top-0 z-10 shadow-md">
        <div className="max-w-3xl mx-auto flex items-center gap-3">
          <div className="bg-white rounded-lg px-2 py-1 flex-shrink-0">
            <Image src="/vts-transparent.png" alt="VTŠ" width={40} height={20} />
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="font-bold text-base leading-tight">Glosar</h1>
            <p className="text-sky-100 text-xs">{filtered.length} / {total}</p>
          </div>
          <button
            onClick={() => router.push('/profile')}
            className="text-sky-100 hover:text-white text-sm flex-shrink-0"
          >
            ← Nazad
          </button>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-4 space-y-3">

        {/* Search + lang toggle */}
        <div className="flex gap-2 flex-wrap">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pretraži…"
            className="flex-1 min-w-[160px] border border-gray-300 rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
          />
          <div className="flex rounded-xl border border-gray-300 overflow-hidden bg-white">
            {LANG_OPTIONS.map(l => (
              <button
                key={l.code}
                onClick={() => setLang(l.code)}
                className={`px-3 py-2 text-sm font-medium transition ${
                  lang === l.code
                    ? 'bg-sky-500 text-white'
                    : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                {l.flag} {l.label}
              </button>
            ))}
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap">
          {(Object.keys(CAT_LABELS) as Category[]).map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition ${
                category === cat
                  ? 'bg-sky-500 text-white'
                  : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-50'
              }`}
            >
              {CAT_LABELS[cat]}
            </button>
          ))}
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-2xl border border-gray-200 bg-white shadow-sm">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="bg-sky-50 text-sky-700">
                <th className="px-3 py-3 text-left font-semibold w-8">L</th>
                <th className="px-3 py-3 text-left font-semibold">Deutsch</th>
                <th className="px-2 py-3 text-center font-semibold w-8"></th>
                <th className="px-3 py-3 text-left font-semibold">
                  {lang === 'sr' ? '🇷🇸 Srpski' : '🇭🇺 Magyar'}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-gray-400">
                    Nema rezultata
                    {search && <> za &ldquo;{search}&rdquo;</>}
                  </td>
                </tr>
              ) : (
                filtered.map((item, idx) => {
                  const tr = lang === 'sr' ? item.translationSr : item.translationHu
                  const icon = item.category === 'verb' ? '📝' : item.category === 'noun' ? '🏷️' : '💬'
                  return (
                    <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="px-3 py-2.5 text-gray-400 text-xs">{item.lesson ?? '—'}</td>
                      <td className="px-3 py-2.5 font-semibold text-gray-900">{item.german}</td>
                      <td className="px-2 py-2.5 text-center text-base">{icon}</td>
                      <td className="px-3 py-2.5 text-gray-700">
                        {tr ?? <span className="text-gray-300">—</span>}
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>

        <p className="text-xs text-center text-gray-400 pb-4">
          {total} reči · Deutsch Trainer — VTŠ Subotica
        </p>
      </div>
    </main>
  )
}
