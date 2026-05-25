'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import type { GameSession, GameType, GameQuestion, QuestionResult } from '@/types'
import { GameEngine } from '@/components/game/GameEngine'
import { useTranslation } from '@/lib/i18n/LanguageContext'

function GameContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { t } = useTranslation()

  const type = searchParams.get('type') as GameType | null
  const count = parseInt(searchParams.get('count') ?? '10', 10)
  const nounLesson = parseInt(searchParams.get('nounLesson') ?? '0', 10)

  const [session, setSession] = useState<GameSession | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [finalScore, setFinalScore] = useState({ total: 0, max: 0 })

  useEffect(() => {
    if (!type) {
      setError(t.error)
      setLoading(false)
      return
    }

    const params = new URLSearchParams({
      gameType: type,
      count: String(count),
      nounLesson: String(nounLesson),
    })

    fetch(`/api/game/generate?${params}`)
      .then(async res => {
        // Ako server vrati redirect (npr. login page) ili prazno tijelo
        const text = await res.text()
        if (!text.trim()) throw new Error(t.noQuestions)
        let data: { error?: string; questions?: GameQuestion[] }
        try { data = JSON.parse(text) } catch { throw new Error(`Server error (${res.status})`) }
        if (!res.ok || data.error) throw new Error(data.error ?? `HTTP ${res.status}`)
        return data
      })
      .then(data => {
        if (!data.questions?.length) throw new Error(t.noQuestions)
        setSession({
          sessionId: crypto.randomUUID(),
          gameType: type,
          lesson: nounLesson || 0,
          questions: data.questions as GameQuestion[],
          results: [],
          totalScore: 0,
          maxScore: data.questions.length * 100,
          startedAt: Date.now(),
        })
      })
      .catch(e => setError(e instanceof Error ? e.message : t.error))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function handleComplete(results: QuestionResult[], totalScore: number, maxScore: number) {
    setFinalScore({ total: totalScore, max: maxScore })
    setCompleted(true)
    try {
      await fetch('/api/game/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          gameType: type,
          lesson: nounLesson || 1,
          results: (session?.questions ?? []).map((q, i) => ({
            questionId: q.id,
            verbId: q.verbId ?? null,
            userAnswer: results[i]?.userAnswer ?? '',
            correctAnswer: q.correctAnswers[0],
            timeTakenMs: results[i]?.timeTakenMs ?? 0,
          })),
        }),
      })
    } catch { /* tiha greška */ }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
          <p className="text-gray-500">{t.game.loading}</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
        <div className="bg-white rounded-2xl shadow p-8 max-w-sm w-full text-center">
          <div className="text-4xl mb-3">❌</div>
          <h2 className="text-lg font-bold text-gray-800 mb-2">{t.error}</h2>
          <p className="text-gray-500 text-sm mb-6">{error}</p>
          <button
            onClick={() => router.back()}
            className="w-full bg-sky-500 text-white font-semibold py-3 rounded-xl hover:bg-sky-600 transition"
          >
            {t.back}
          </button>
        </div>
      </div>
    )
  }

  if (completed) {
    const pct = finalScore.max > 0 ? Math.round((finalScore.total / finalScore.max) * 100) : 0
    const typeLabel = type === 'NOUN_ARTICLE'
      ? 'DER / DIE / DAS'
      : type === 'VOCAB_MATCH'
        ? t.vocabMatch.label
        : type ?? ''

    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-500 to-sky-700 px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-sm w-full text-center">
          <div className="text-6xl mb-4">{pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '💪'}</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-1">{t.game.finished}</h2>
          <p className="text-gray-500 mb-4">{typeLabel}</p>
          <div className="bg-sky-50 rounded-xl p-4 mb-6">
            <div className="text-4xl font-bold text-sky-600">{finalScore.total}</div>
            <div className="text-gray-500 text-sm">
              {t.game.of} {finalScore.max} {t.game.points} ({pct}%)
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push(`/game?type=${type}&count=${count}&nounLesson=${nounLesson}`)}
              className="bg-sky-500 text-white font-semibold py-2.5 rounded-xl hover:bg-sky-600 transition"
            >
              {t.game.tryAgain}
            </button>
            <button
              onClick={() => router.push('/imenice')}
              className="border border-gray-300 text-gray-700 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition"
            >
              {t.game.toNouns}
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

  if (session) {
    return <GameEngine session={session} onComplete={handleComplete} />
  }

  return null
}

export default function GamePage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-pulse">⏳</div>
        </div>
      </div>
    }>
      <GameContent />
    </Suspense>
  )
}
