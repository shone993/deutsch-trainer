'use client'

import { useState, useRef, useEffect } from 'react'
import type { GameQuestion, QuestionResult } from '@/types'
import { checkAnswer } from '@/lib/game/parser'
import { calculatePoints } from '@/lib/game/scorer'

interface Props {
  question: GameQuestion
  onAnswer: (result: QuestionResult) => void
  questionNumber: number
  totalQuestions: number
}

export function FillBlankGame({ question, onAnswer, questionNumber, totalQuestions }: Props) {
  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const startTime = useRef(Date.now())
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    startTime.current = Date.now()
    setInput('')
    setSubmitted(false)
    inputRef.current?.focus()
  }, [question.id])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitted || !input.trim()) return

    const timeTakenMs = Date.now() - startTime.current
    const correct = checkAnswer(input, question.correctAnswers[0])
    const points = calculatePoints(correct, timeTakenMs)

    setIsCorrect(correct)
    setSubmitted(true)

    setTimeout(() => {
      onAnswer({
        questionId: question.id,
        userAnswer: input,
        isCorrect: correct,
        timeTakenMs,
        pointsEarned: points,
      })
    }, 1200)
  }

  const parts = question.parsedSentence?.parts ?? [
    { type: 'text' as const, value: question.sentence ?? '' },
  ]

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Pitanje {questionNumber}/{totalQuestions}</span>
          <span className="font-medium text-blue-600">{question.infinitiv}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Rečenica */}
      <div className="bg-white rounded-2xl shadow p-6 w-full">
        <p className="text-gray-500 text-sm mb-3">Popuni prazninu:</p>
        <div className="text-xl text-gray-900 leading-loose flex flex-wrap items-center gap-1">
          {parts.map((part, i) => {
            if (part.type === 'text') {
              return <span key={i}>{part.value}</span>
            }
            return (
              <span
                key={i}
                className={`inline-block min-w-[80px] border-b-2 px-1 text-center font-semibold ${
                  submitted
                    ? isCorrect
                      ? 'border-green-500 text-green-600'
                      : 'border-red-500 text-red-600'
                    : 'border-blue-400 text-blue-600'
                }`}
              >
                {submitted ? (isCorrect ? input : question.correctAnswers[0]) : (input || '_____')}
              </span>
            )
          })}
        </div>
        <p className="text-gray-400 text-sm mt-4 italic">"{question.translation}"</p>
      </div>

      {/* Input forma */}
      <form onSubmit={handleSubmit} className="w-full flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitted}
          className="flex-1 border-2 border-gray-300 focus:border-blue-500 rounded-xl px-4 py-3 text-lg outline-none transition disabled:opacity-60"
          placeholder="Unesite odgovor..."
          autoCorrect="off"
          autoCapitalize="none"
        />
        <button
          type="submit"
          disabled={submitted || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-semibold px-6 py-3 rounded-xl transition"
        >
          ✓
        </button>
      </form>

      {/* Feedback */}
      {submitted && (
        <div className={`w-full rounded-xl p-4 text-center font-semibold text-lg ${
          isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isCorrect ? '🎉 Tačno!' : `❌ Tačan odgovor: ${question.correctAnswers[0]}`}
        </div>
      )}
    </div>
  )
}
