'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import type { GameSession, GameType, GameQuestion, QuestionResult } from '@/types'
import { GameEngine } from '@/components/game/GameEngine'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface PageProps {
  params: Promise<{ id: string }>
}

export default function LessonPage({ params }: PageProps) {
  const router = useRouter()
  const { t } = useTranslation()
  const L = t.lesson

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

  // Build exercise type arrays from translations
  type ExerciseEntry = { type: GameType; label: string; emoji: string; desc: string }

  function typeEntry(type: GameType): ExerciseEntry {
    const e = L.types[type as keyof typeof L.types]
    return { type, label: e.label, emoji: e.emoji, desc: e.desc }
  }

  const AUDIO_TYPES: ExerciseEntry[] = [typeEntry('AUDIO')]
  const WORTFOLGE_TYPES: ExerciseEntry[] = [typeEntry('WORD_ORDER')]
  const PREZENS_TYPES: ExerciseEntry[] = [
    typeEntry('MATCH_PAIRS'),
    typeEntry('TRANSLATE'),
    typeEntry('CONJUGATE'),
    typeEntry('FILL_BLANK'),
  ]
  const PERFEKT_TYPES: ExerciseEntry[] = [
    typeEntry('PERFEKT_HILFSVERB'),
    typeEntry('PERFEKT_PARTIZIP_MATCH'),
    typeEntry('PERFEKT_PARTIZIP'),
    typeEntry('PERFEKT_CONJUGATE'),
    typeEntry('PERFEKT_FILL'),
  ]

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
      const text = await res.text()
      if (!text.trim()) throw new Error(t.noQuestions)
      let data: { error?: string; questions?: GameQuestion[] }
      try { data = JSON.parse(text) } catch { throw new Error(`Server error (${res.status})`) }
      if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`)
      if (!data.questions?.length) throw new Error(t.noQuestions)

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
      setError(e instanceof Error ? e.message : t.error)
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
    } catch { /* silent */ }
  }

  // ── Instructions overlay ───────────────────────────────────────────────────
  if (showInstructions && pendingType) {
    const instrKey = pendingType as keyof typeof L.instructions
    const instr = L.instructions[instrKey]
    const typeInfo = L.types[pendingType as keyof typeof L.types]
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-500 to-sky-700 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">{typeInfo.emoji}</div>
            <h2 className="text-2xl font-bold text-gray-900">{instr.title}</h2>
          </div>

          <ol className="space-y-3 mb-6">
            {instr.steps.map((step: string, i: number) => (
              <li key={i} className="flex gap-3 text-sm text-gray-700">
                <span className="flex-shrink-0 w-6 h-6 bg-sky-100 text-sky-700 font-bold rounded-full flex items-center justify-center text-xs">
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
              className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition text-lg"
            >
              {loading ? t.loading : t.game.startExercise}
            </button>
            <button
              onClick={() => { setShowInstructions(false); setPendingType(null) }}
              className="w-full border border-gray-300 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
            >
              {t.back}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ── Game running ───────────────────────────────────────────────────────────
  if (session && !completed) {
    return (
      <GameEngine
        session={session}
        onComplete={handleComplete}
        onAbort={() => { setSession(null); setSelectedType(null) }}
      />
    )
  }

  // ── Completed screen ───────────────────────────────────────────────────────
  if (completed) {
    const pct = Math.round((finalScore.total / finalScore.max) * 100)
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-500 to-sky-700 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.game.finished}</h2>
          <p className="text-gray-500 mb-4">{L.lessonLabel} {lesson}</p>
          <div className="bg-sky-50 rounded-xl p-4 mb-6">
            <div className="text-4xl font-bold text-sky-600">{finalScore.total}</div>
            <div className="text-gray-500 text-sm">
              {t.game.of} {finalScore.max} {t.game.points} ({pct}%)
            </div>
          </div>
          <div className="flex flex-col gap-3">
            {selectedType && (
              <button
                onClick={() => { setCompleted(false); startGame(selectedType) }}
                className="bg-sky-500 text-white font-semibold py-2.5 rounded-xl hover:bg-sky-600 transition"
              >
                {t.game.tryAgain}
              </button>
            )}
            <button
              onClick={() => { setSession(null); setCompleted(false); setSelectedType(null) }}
              className="bg-white border-2 border-sky-400 text-sky-600 font-semibold py-2.5 rounded-xl hover:bg-sky-50 transition"
            >
              {L.chooseExercise}
            </button>
            <button
              onClick={() => router.push('/profile')}
              className="border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
            >
              {t.game.toProfile}
            </button>
          </div>
        </div>
      </main>
    )
  }

  // ── Exercise list ──────────────────────────────────────────────────────────
  function renderSection(title: string, color: string, types: ExerciseEntry[]) {
    return (
      <div className="mb-8">
        <h2 className={`text-sm font-bold uppercase tracking-widest mb-3 ${color}`}>{title}</h2>
        <div className="grid grid-cols-1 gap-3">
          {types.map((g) => (
            <button
              key={g.type}
              onClick={() => selectGameType(g.type)}
              disabled={loading}
              className="bg-white border-2 border-gray-200 hover:border-sky-500 hover:bg-sky-50 disabled:opacity-60 rounded-2xl p-4 flex items-center gap-4 text-left transition"
            >
              <span className="text-2xl">{g.emoji}</span>
              <div>
                <div className="font-bold text-gray-900 text-sm">{g.label}</div>
                <div className="text-xs text-gray-500">{g.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    )
  }

  // For lesson 13: section titles
  const isReview = lesson === 13

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="max-w-lg mx-auto">
        <button onClick={() => router.back()} className="text-sky-600 text-sm mb-4">{t.back}</button>
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          {isReview ? t.profile.review : `${L.lessonLabel} ${lesson}`}
        </h1>
        <p className="text-gray-500 mb-6">{L.chooseExercise}</p>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg p-3 mb-4">
            {error}
          </div>
        )}

        {renderSection('Präsens', 'text-sky-600', PREZENS_TYPES)}

        {/* Modalni glagoli / Modális igék / Modalverben */}
        <div className="mb-8">
          <h2 className="text-sm font-bold uppercase tracking-widest text-sky-600 mb-1">{L.modalVerbs}</h2>
          <p className="text-xs text-gray-400 mb-3">{L.modalVerbsList}</p>
          <Link
            href="/modal"
            className="bg-white border-2 border-sky-200 hover:border-sky-500 hover:bg-sky-50 rounded-2xl p-4 flex items-center gap-4 transition"
          >
            <span className="text-2xl">🔷</span>
            <div>
              <div className="font-bold text-gray-900 text-sm">{L.modalVerbsTitle}</div>
              <div className="text-xs text-gray-500">{L.modalVerbsDesc}</div>
            </div>
            <span className="ml-auto text-sky-400 text-lg">→</span>
          </Link>
        </div>

        {renderSection('Perfekt', 'text-purple-600', PERFEKT_TYPES)}

        {renderSection('Wortfolge', 'text-teal-600', WORTFOLGE_TYPES)}

        {renderSection('Audio', 'text-orange-600', AUDIO_TYPES)}

        {/* Lesson 13: DER/DIE/DAS + Poveži parove */}
        {isReview && renderSection(L.nounExercises, 'text-sky-600', [
          typeEntry('NOUN_ARTICLE'),
          typeEntry('VOCAB_MATCH'),
        ])}

        {/* Lesson 13: Upitne reči */}
        {isReview && renderSection(L.questionWordsExercises, 'text-violet-600', [
          typeEntry('QUESTION_WORDS'),
        ])}
      </div>
    </main>
  )
}
