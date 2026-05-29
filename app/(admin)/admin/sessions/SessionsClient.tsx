'use client'

import { useState, useMemo } from 'react'

export interface SessionRow {
  id: string
  name: string
  surname: string
  gameType: string
  lesson: number
  score: number
  maxScore: number
  correctCount: number
  wrongCount: number
  completedAt: string // ISO string
}

const GAME_LABELS: Record<string, string> = {
  MATCH_PAIRS:           'Poveži parove',
  TRANSLATE:             'Višestruki izbor',
  CONJUGATE:             'Konjugacija',
  FILL_BLANK:            'Popuni rečenicu',
  PERFEKT_HILFSVERB:     'HABEN ili SEIN?',
  PERFEKT_PARTIZIP:      'Partizip II',
  PERFEKT_PARTIZIP_MATCH:'Poveži Partizip II',
  PERFEKT_CONJUGATE:     'Konjugacija Perfekt',
  PERFEKT_FILL:          'Rečenice (Perfekt)',
  PRETERIT_MATCH:        'Poveži — Präteritum',
  PRETERIT_CONJUGATE:    'Konjugacija — Präteritum',
  PRETERIT_FILL:         'Umetni — Präteritum',
  WORD_ORDER:            'Redosled reči',
  AUDIO:                 'Slušanje',
  NOUN_ARTICLE:          'DER / DIE / DAS',
  VOCAB_MATCH:           'Poveži (sve reči)',
  QUESTION_WORDS:        'Upitne reči',
}

const ALL_TYPES = Object.entries(GAME_LABELS)

interface Props { sessions: SessionRow[] }

export function SessionsClient({ sessions }: Props) {
  const [nameSearch, setNameSearch]       = useState('')
  const [gameTypeFilter, setGameTypeFilter] = useState('sve')
  const [dateFrom, setDateFrom]           = useState('')
  const [dateTo, setDateTo]               = useState('')
  const [showBreakdown, setShowBreakdown] = useState(false)

  const filtered = useMemo(() => {
    return sessions.filter(s => {
      if (nameSearch.trim()) {
        const q = nameSearch.trim().toLowerCase()
        if (!`${s.name} ${s.surname}`.toLowerCase().includes(q)) return false
      }
      if (gameTypeFilter !== 'sve' && s.gameType !== gameTypeFilter) return false
      if (dateFrom) {
        const from = new Date(dateFrom); from.setHours(0, 0, 0, 0)
        if (new Date(s.completedAt) < from) return false
      }
      if (dateTo) {
        const to = new Date(dateTo); to.setHours(23, 59, 59, 999)
        if (new Date(s.completedAt) > to) return false
      }
      return true
    })
  }, [sessions, nameSearch, gameTypeFilter, dateFrom, dateTo])

  const totalSessions = filtered.length
  const avgPct = filtered.length > 0
    ? Math.round(filtered.reduce((sum, s) => sum + (s.maxScore > 0 ? s.score / s.maxScore * 100 : 0), 0) / filtered.length)
    : 0

  // Per-exercise breakdown (sorted by count)
  const breakdown = useMemo(() => {
    const counts: Record<string, { count: number; totalPct: number }> = {}
    for (const s of filtered) {
      if (!counts[s.gameType]) counts[s.gameType] = { count: 0, totalPct: 0 }
      counts[s.gameType].count++
      counts[s.gameType].totalPct += s.maxScore > 0 ? (s.score / s.maxScore) * 100 : 0
    }
    return Object.entries(counts)
      .map(([type, d]) => ({ type, count: d.count, avgPct: Math.round(d.totalPct / d.count) }))
      .sort((a, b) => b.count - a.count)
  }, [filtered])

  const mostPopular = breakdown[0]

  return (
    <div className="space-y-5">
      {/* Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Filteri</h2>
          <button
            onClick={() => { setNameSearch(''); setGameTypeFilter('sve'); setDateFrom(''); setDateTo('') }}
            className="text-xs text-indigo-500 hover:underline"
          >
            Obriši sve
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <input
            type="text"
            placeholder="Pretraži po imenu ili prezimenu..."
            value={nameSearch}
            onChange={e => setNameSearch(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          />
          <select
            value={gameTypeFilter}
            onChange={e => setGameTypeFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400"
          >
            <option value="sve">Sve vežbe</option>
            {ALL_TYPES.map(([type, label]) => (
              <option key={type} value={type}>{label}</option>
            ))}
          </select>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 shrink-0 w-6">Od:</span>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500 shrink-0 w-6">Do:</span>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-400" />
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <div className="text-2xl font-bold text-indigo-600">{totalSessions}</div>
          <div className="text-xs text-gray-500 mt-0.5">sesija</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <div className={`text-2xl font-bold ${avgPct >= 80 ? 'text-green-600' : avgPct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {avgPct}%
          </div>
          <div className="text-xs text-gray-500 mt-0.5">prosek</div>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-3 text-center">
          <div className="text-sm font-bold text-gray-700 leading-tight line-clamp-2">
            {mostPopular ? GAME_LABELS[mostPopular.type] ?? mostPopular.type : '—'}
          </div>
          <div className="text-xs text-gray-500 mt-0.5">najpopularnije</div>
        </div>
      </div>

      {/* Per-exercise breakdown */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <button
          onClick={() => setShowBreakdown(v => !v)}
          className="w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition"
        >
          <span>Pregled po vežbi</span>
          <span className="text-gray-400">{showBreakdown ? '▲' : '▼'}</span>
        </button>
        {showBreakdown && (
          <div className="border-t border-gray-100 divide-y divide-gray-100">
            {breakdown.map(b => (
              <div key={b.type} className="flex items-center justify-between px-4 py-2.5">
                <span className="text-sm text-gray-700">{GAME_LABELS[b.type] ?? b.type}</span>
                <div className="flex items-center gap-3 text-sm">
                  <span className="text-gray-500">{b.count}×</span>
                  <span className={`font-semibold ${b.avgPct >= 80 ? 'text-green-600' : b.avgPct >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                    {b.avgPct}%
                  </span>
                </div>
              </div>
            ))}
            {breakdown.length === 0 && (
              <p className="text-center text-gray-500 py-4 text-sm">Nema podataka</p>
            )}
          </div>
        )}
      </div>

      {/* Sessions table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100 text-sm text-gray-500">
          Prikazano <strong className="text-gray-800">{totalSessions}</strong> sesija
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-left">
                <th className="px-4 py-3 font-semibold text-gray-700">Ime i prezime</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Vežba</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center">Lekcija</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center">Poeni</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center">%</th>
                <th className="px-4 py-3 font-semibold text-gray-700 text-center">Tačnih</th>
                <th className="px-4 py-3 font-semibold text-gray-700">Datum</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-10 text-sm">
                    Nema sesija za odabrane filtere
                  </td>
                </tr>
              )}
              {filtered.map(s => {
                const pct = s.maxScore > 0 ? Math.round(s.score / s.maxScore * 100) : 0
                const total = s.correctCount + s.wrongCount
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3 font-medium text-gray-900 whitespace-nowrap">
                      {s.name} {s.surname}
                    </td>
                    <td className="px-4 py-3 text-gray-600">
                      {GAME_LABELS[s.gameType] ?? s.gameType}
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">{s.lesson}</td>
                    <td className="px-4 py-3 text-center font-bold text-indigo-600">{s.score}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${
                        pct >= 80 ? 'bg-green-100 text-green-700'
                        : pct >= 50 ? 'bg-yellow-100 text-yellow-700'
                        : 'bg-red-100 text-red-700'
                      }`}>
                        {pct}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-gray-600">
                      {s.correctCount} / {total > 0 ? total : '—'}
                    </td>
                    <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                      {new Date(s.completedAt).toLocaleString('sr-RS', { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
