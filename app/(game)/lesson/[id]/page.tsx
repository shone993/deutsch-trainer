'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import type { GameSession, GameType, GameQuestion, QuestionResult } from '@/types'
import { GameEngine } from '@/components/game/GameEngine'

const GAME_TYPES: { type: GameType; label: string; emoji: string; desc: string }[] = [
  { type: 'FILL_BLANK', label: 'Popuni prazninu', emoji: '✏️', desc: 'Upiši ispravnu formu glagola' },
  { type: 'TRANSLATE',  label: 'Prevod',          emoji: '🌍', desc: 'Izaberi ispravnu konjugaciju' },
  { type: 'MATCH_PAIRS',label: 'Poveži parove',   emoji: '🔗', desc: 'Poveži infinitiv sa formom' },
  { type: 'AUDIO',      label: 'Audio',            emoji: '🔊', desc: 'Odslušaj i upiši' },
]

const INSTRUCTIONS: Record<GameType, { title: string; emoji: string; steps: string[]; example: string }> = {
  FILL_BLANK: {
    title: 'Popuni prazninu',
    emoji: '✏️',
    steps: [
      'Vidiš nemačku rečenicu u kojoj nedostaje glagol.',
      'U plavoj kartici gore piše koji glagol i koje lice treba.',
      'Upiši tačan oblik glagola u polje za unos.',
      'Potvrdi pritiskom na ✓ ili Enter.',
    ],
    example: 'Primer: "Ich  ?  Student."  →  upiši: bin',
  },
  TRANSLATE: {
    title: 'Prevod — višestruki izbor',
    emoji: '🌍',
    steps: [
      'Vidiš glagol i lice koje treba da konjuguješ.',
      'Ponuđena su 4 odgovora — samo jedan je tačan.',
      'Klikni na tačan oblik glagola.',
      'Brži odgovor donosi više poena!',
    ],
    example: 'Primer: "haben · wir"  →  klikni: haben',
  },
  MATCH_PAIRS: {
    title: 'Poveži parove',
    emoji: '🔗',
    steps: [
      'Na levoj strani su infinitivi glagola.',
      'Na desnoj strani su njihove konjugacije — izmešane.',
      'Klikni jedan infinitiv (levo), pa njegovu konjugaciju (desno).',
      'Tačan par postaje zelen. Krivi par bljesne crveno — pokušaj ponovo.',
    ],
    example: 'Primer: klikni "sein" → klikni "bin"',
  },
  AUDIO: {
    title: 'Audio vežba',
    emoji: '🔊',
    steps: [
      'Odslušaj izgovor nemačke reči.',
      'Upiši ono što si čuo.',
      'Možeš ponovo pustiti audio pre odgovora.',
    ],
    example: '',
  },
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default function LessonPage({ params }: PageProps) {
  const router = useRouter()
  const [lesson, setLesson] = useState<number | null>(null)
  const [selectedType, setSelectedType] = useState<GameType | null>(null)
  const [session, setSession] = useState<GameSession | null>(null)
  const [loading, setLoading] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [pendingType, setPendingType] = useState<GameType | null>(null)
  const [completed, setCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState({ total: 0, max: 0 })
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    params.then(({ id }) => setLesson(Number(id)))
  }, [params])

  if (lesson === null) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin text-4xl">⏳</div>
      </div>
    )
  }

  function selectGameType(gameType: GameType) {
    setPendingType(gameType)
    setShowInstructions(true)
  }

  async function startGame(gameType: GameType) {
    setShowInstructions(false)
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/game/generate?lesson=${lesson}&gameType=${gameType}&count=10`)
      const data = await res.json()

      if (!res.ok) throw new Error(data.error ?? 'Greška')

      const newSession: GameSession = {
        sessionId: crypto.randomUUID(),
        gameType,
        lesson: lesson!,
        questions: data.questions as GameQuestion[],
        results: [],
        totalScore: 0,
        maxScore: data.questions.length * 100,
        startedAt: Date.now(),
      }
      setSelectedType(gameType)
      setSession(newSession)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Došlo je do greške')
    } finally {
      setLoading(false)
    }
  }

  async function handleComplete(results: QuestionResult[], totalScore: number, maxScore: number) {
    setFinalScore({ total: totalScore, max: maxScore })
    setCompleted(true)

    // Pošalji rezultate na server
    try {
      await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: selectedType,
          lesson,
          results: (session?.questions ?? []).map((q, i) => ({
            questionId: q.id,
            verbId: q.verbId,
            userAnswer: results[i]?.userAnswer ?? '',
            correctAnswer: q.correctAnswers[0],
            timeTakenMs: results[i]?.timeTakenMs ?? 0,
          })),
        }),
      })
    } catch {
      // Tiha greška — statistike nisu kritične za UX
    }
  }

  if (showInstructions && pendingType) {
    const instr = INSTRUCTIONS[pendingType]
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{instr.emoji}</div>
            <h2 className="text-2xl font-bold text-gray-900">{instr.title}</h2>
          </div>

          <ol className="space-y-3 mb-6">
            {instr.steps.map((step, i) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-700 font-bold rounded-full flex items-center justify-center text-xs">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>

          {instr.example && (
            <div className="bg-gray-50 rounded-xl px-4 py-3 mb-6 text-sm text-gray-600 italic">
              {instr.example}
            </div>
          )}

          <div className="flex flex-col gap-3">
            <button
              onClick={() => startGame(pendingType)}
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition text-lg"
            >
              {loading ? 'Učitavam...' : '🚀 Počni vežbu'}
            </button>
            <button
              onClick={() => { setShowInstructions(false); setPendingType(null) }}
              className="w-full border border-gray-300 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
            >
              ← Nazad
            </button>
          </div>
        </div>
      </main>
    )
  }

  if (session && !completed) {
    return <GameEngine session={session} onComplete={handleComplete} />
  }

  if (completed) {
    const pct = Math.round((finalScore.total / finalScore.max) * 100)
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-600 to-indigo-800 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Završeno!</h2>
          <p className="text-gray-500 mb-4">Lekcija {lesson}</p>
          <div className="bg-blue-50 rounded-xl p-4 mb-6">
            <div className="text-4xl font-bold text-blue-600">{finalScore.total}</div>
            <div className="text-gray-500 text-sm">od {finalScore.max} poena ({pct}%)</div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setSession(null); setCompleted(false); setSelectedType(null) }}
              className="bg-blue-600 text-white font-semibold py-2.5 rounded-xl hover:bg-blue-700 transition"
            >
              Pokušaj ponovo
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
            >
              Na profil
            </button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <button onClick={() => router.back()} className="text-blue-600 text-sm mb-4">← Nazad</button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">Lekcija {lesson}</h1>
        <p className="text-gray-500 mb-6">Izaberi vrstu vežbe</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 gap-4">
          {GAME_TYPES.map((g) => (
            <button
              key={g.type}
              onClick={() => selectGameType(g.type)}
              disabled={loading}
              className="bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 disabled:opacity-60 rounded-2xl p-5 flex items-center gap-4 text-left transition"
            >
              <span className="text-3xl">{g.emoji}</span>
              <div>
                <div className="font-bold text-gray-900">{g.label}</div>
                <div className="text-sm text-gray-500">{g.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    </main>
  )
}
