'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { GameSession, GameType, GameQuestion, QuestionResult } from '@/types'
import { GameEngine } from '@/components/game/GameEngine'

type ExerciseEntry = { type: GameType; label: string; emoji: string; desc: string }

const MODAL_EXERCISES: ExerciseEntry[] = [
  { type: 'MATCH_PAIRS', label: 'Poveži parove',   emoji: '🔗', desc: 'Poveži infinitiv sa zamenicom i oblikom (er mag)' },
  { type: 'CONJUGATE',   label: 'Konjugacija',     emoji: '🔤', desc: 'Data je lična zamenica — upiši oblik modalnog glagola' },
  { type: 'FILL_BLANK',  label: 'Umetni u rečenicu', emoji: '✏️', desc: 'Dat je infinitiv i rečenica — upiši ispravan oblik' },
]

const INSTRUCTIONS: Record<string, { title: string; emoji: string; steps: string[]; example: string }> = {
  MATCH_PAIRS: {
    title: 'Poveži parove',
    emoji: '🔗',
    steps: [
      'Na levoj strani su infinitivi modalnih glagola.',
      'Na desnoj strani su oblici sa ličnom zamenicom — izmešani.',
      'Klikni infinitiv (levo), pa odgovarajući oblik (desno).',
      'Tačan par postaje zelen.',
    ],
    example: 'Primer: klikni "können" → klikni "er/sie/es kann"',
  },
  CONJUGATE: {
    title: 'Konjugacija modalnih glagola',
    emoji: '🔤',
    steps: [
      'Prikazan je infinitiv modalnog glagola i lična zamenica.',
      'Upiši tačan oblik glagola za to lice.',
      'Modalni glagoli: ich/er/sie/es imaju ISTI oblik (bez nastavka)!',
    ],
    example: 'Primer: "können" + "er/sie/es"  →  upiši: kann',
  },
  FILL_BLANK: {
    title: 'Umetni u rečenicu',
    emoji: '✏️',
    steps: [
      'Vidiš nemačku rečenicu u kojoj nedostaje modalni glagol.',
      'Kartica gore prikazuje koji glagol i koje lice treba.',
      'Upiši tačan oblik modalnog glagola.',
    ],
    example: 'Primer: "Er _____ Deutsch sprechen."  →  upiši: kann',
  },
}

export default function ModalPage() {
  const router = useRouter()
  const [session, setSession] = useState<GameSession | null>(null)
  const [selectedType, setSelectedType] = useState<GameType | null>(null)
  const [showInstructions, setShowInstructions] = useState(false)
  const [pendingType, setPendingType] = useState<GameType | null>(null)
  const [loading, setLoading] = useState(false)
  const [completed, setCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState({ total: 0, max: 0 })
  const [error, setError] = useState<string | null>(null)

  function selectExercise(type: GameType) {
    setPendingType(type)
    setShowInstructions(true)
  }

  async function startGame(type: GameType) {
    setShowInstructions(false)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/game/generate?gameType=${type}&count=12&modalOnly=true`)
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Greška')

      setSelectedType(type)
      setSession({
        sessionId: crypto.randomUUID(),
        gameType: type,
        lesson: 0,
        questions: data.questions as GameQuestion[],
        results: [],
        totalScore: 0,
        maxScore: data.questions.length * 100,
        startedAt: Date.now(),
      })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Greška')
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(results: QuestionResult[], totalScore: number, maxScore: number) {
    setFinalScore({ total: totalScore, max: maxScore })
    setCompleted(true)
    try {
      await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: selectedType,
          lesson: 1,
          results: (session?.questions ?? []).map((q, i) => ({
            questionId: q.id,
            verbId: q.verbId,
            userAnswer: results[i]?.userAnswer ?? '',
            correctAnswer: q.correctAnswers[0],
            timeTakenMs: results[i]?.timeTakenMs ?? 0,
          })),
        }),
      })
    } catch { /* tiha greška */ }
  }

  // Instructions ekran
  if (showInstructions && pendingType) {
    const instr = INSTRUCTIONS[pendingType]
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-500 to-sky-700 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{instr.emoji}</div>
            <h2 className="text-2xl font-bold text-gray-900">{instr.title}</h2>
            <p className="text-sky-600 text-sm mt-1">Modalni glagoli</p>
          </div>
          <ol className="space-y-3 mb-6">
            {instr.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-6 h-6 bg-sky-100 text-sky-700 font-bold rounded-full flex items-center justify-center text-xs">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
          {instr.example && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6 text-sm text-gray-600 italic">{instr.example}</div>
          )}
          <div className="flex flex-col gap-3">
            <button onClick={() => startGame(pendingType)} disabled={loading}
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition text-lg">
              {loading ? 'Učitavam...' : '🚀 Počni vežbu'}
            </button>
            <button onClick={() => { setShowInstructions(false); setPendingType(null) }}
              className="w-full border border-gray-300 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition">
              ← Nazad
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Game ekran
  if (session && !completed) {
    return <GameEngine session={session} onComplete={handleComplete} />
  }

  // Rezultat
  if (completed) {
    const pct = Math.round((finalScore.total / finalScore.max) * 100)
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-500 to-sky-700 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">Završeno!</h2>
          <p className="text-gray-500 mb-4">Modalni glagoli</p>
          <div className="bg-sky-50 rounded-xl p-4 mb-6">
            <div className="text-4xl font-bold text-sky-600">{finalScore.total}</div>
            <div className="text-gray-500 text-sm">od {finalScore.max} poena ({pct}%)</div>
          </div>
          <div className="flex flex-col gap-3">
            <button onClick={() => { setSession(null); setCompleted(false); setSelectedType(null) }}
              className="bg-sky-500 text-white font-semibold py-2.5 rounded-xl hover:bg-sky-600 transition">
              Pokušaj ponovo
            </button>
            <button onClick={() => router.push('/profile')}
              className="border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition">
              Na profil
            </button>
          </div>
        </div>
      </main>
    )
  }

  // Izbor vežbe
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <button onClick={() => router.push('/profile')} className="text-sky-600 text-sm mb-4">← Nazad</button>

        <div className="bg-sky-500 text-white rounded-2xl p-5 mb-6">
          <h1 className="text-2xl font-bold mb-1">Modalni glagoli</h1>
          <p className="text-sky-100 text-sm">können · müssen · wollen · sollen · dürfen · mögen</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">{error}</div>
        )}

        <h2 className="text-sm font-bold uppercase tracking-widest text-sky-600 mb-3">Präsens</h2>
        <div className="grid grid-cols-1 gap-3">
          {MODAL_EXERCISES.map((g) => (
            <button key={g.type} onClick={() => selectExercise(g.type)} disabled={loading}
              className="bg-white border-2 border-gray-200 hover:border-sky-500 hover:bg-sky-50 disabled:opacity-60 rounded-2xl p-4 flex items-center gap-4 text-left transition">
              <span className="text-2xl">{g.emoji}</span>
              <div>
                <div className="font-bold text-gray-900 text-sm">{g.label}</div>
                <div className="text-xs text-gray-500">{g.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
