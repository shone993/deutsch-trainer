'use client'

import { useState, useEffect, useRef } from 'react'
import type { GameQuestion, QuestionResult } from '@/types'
import { calculatePoints } from '@/lib/game/scorer'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface Props {
  question: GameQuestion
  onAnswer: (result: QuestionResult) => void
  questionNumber: number
  totalQuestions: number
}

export function WordOrderGame({ question, onAnswer, questionNumber, totalQuestions }: Props) {
  const { t } = useTranslation()
  const g = t.game

  const tokens: string[] = question.options ?? []
  const [pool, setPool] = useState<string[]>([])
  const [built, setBuilt] = useState<string[]>([])
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const startTime = useRef(Date.now())

  useEffect(() => {
    startTime.current = Date.now()
    setPool([...tokens])
    setBuilt([])
    setSubmitted(false)
  }, [question.id]) // eslint-disable-line react-hooks/exhaustive-deps

  function addToken(idx: number) {
    if (submitted) return
    const tok = pool[idx]
    setPool(p => p.filter((_, i) => i !== idx))
    setBuilt(b => [...b, tok])
  }

  function removeToken(idx: number) {
    if (submitted) return
    const tok = built[idx]
    setBuilt(b => b.filter((_, i) => i !== idx))
    setPool(p => [...p, tok])
  }

  function clearAll() {
    setPool([...tokens])
    setBuilt([])
  }

  function handleSubmit() {
    if (submitted || built.length === 0) return
    const userSentence = built.join(' ')
    const correctAnswer = question.correctAnswers[0]
    const normalize = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase()
    const correct = normalize(userSentence) === normalize(correctAnswer)
    const timeTakenMs = Date.now() - startTime.current
    setIsCorrect(correct)
    setSubmitted(true)
    setTimeout(() => {
      onAnswer({ questionId: question.id, userAnswer: userSentence, isCorrect: correct, timeTakenMs, pointsEarned: calculatePoints(correct, timeTakenMs) })
    }, 1800)
  }

  const correctAnswer = question.correctAnswers[0]

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{g.question} {questionNumber} / {totalQuestions}</span>
          <span className="font-medium text-sky-600">{questionNumber}/{totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-sky-500 h-2 rounded-full transition-all"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
        </div>
      </div>

      <div className="w-full bg-sky-500 text-white rounded-2xl px-5 py-4">
        <p className="text-xs text-sky-200 uppercase tracking-wide mb-0.5">{g.wordOrderHeader}</p>
        <p className="text-xl font-bold">{question.infinitiv}</p>
        {question.translation && <p className="text-sky-200 text-sm mt-0.5">{question.translation}</p>}
      </div>

      <p className="text-sm text-gray-500 self-start">{g.wordOrderInstruction}</p>

      <div className={`w-full min-h-[64px] rounded-2xl border-2 p-3 flex flex-wrap gap-2 items-center transition-colors ${
        submitted
          ? isCorrect ? 'border-green-500 bg-green-50' : 'border-red-400 bg-red-50'
          : built.length > 0 ? 'border-sky-400 bg-sky-50' : 'border-dashed border-gray-300 bg-gray-50'
      }`}>
        {built.length === 0 && !submitted && (
          <span className="text-gray-400 text-sm italic">{g.wordOrderEmpty}</span>
        )}
        {built.map((tok, i) => (
          <button key={i} onClick={() => removeToken(i)} disabled={submitted}
            className={`px-3 py-1.5 rounded-xl text-sm font-semibold transition-all ${
              submitted
                ? isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                : 'bg-sky-500 text-white hover:bg-sky-600 hover:scale-105'
            }`}>
            {tok}
          </button>
        ))}
      </div>

      <div className="w-full bg-white rounded-2xl border border-gray-200 p-3 flex flex-wrap gap-2 min-h-[56px]">
        {pool.map((tok, i) => (
          <button key={i} onClick={() => addToken(i)} disabled={submitted}
            className="px-3 py-1.5 bg-gray-100 hover:bg-sky-100 hover:text-sky-800 border border-gray-300 hover:border-sky-400 rounded-xl text-sm font-medium transition-all hover:scale-105 disabled:opacity-50">
            {tok}
          </button>
        ))}
      </div>

      {!submitted && (
        <div className="flex gap-3 w-full">
          <button onClick={clearAll} disabled={built.length === 0}
            className="flex-1 border border-gray-300 text-gray-600 font-medium py-2.5 rounded-xl hover:bg-gray-50 transition disabled:opacity-40">
            {g.reset}
          </button>
          <button onClick={handleSubmit} disabled={pool.length > 0}
            className="flex-1 bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold py-2.5 rounded-xl transition">
            {pool.length > 0
              ? `${g.wordOrderRemaining} ${pool.length} ${g.wordOrderWords}`
              : `✓ ${g.confirm}`}
          </button>
        </div>
      )}

      {submitted && (
        <div className={`w-full rounded-xl p-4 font-semibold text-base ${
          isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isCorrect ? g.correct : (
            <div>
              <div>{g.wrongSentence}</div>
              <div className="mt-1 font-normal text-sm">{correctAnswer}</div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
