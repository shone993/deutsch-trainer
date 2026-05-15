'use client'

import { useState, useRef, useEffect } from 'react'
import type { GameQuestion, GrammaticalPerson, QuestionResult } from '@/types'
import { checkAnswer } from '@/lib/game/parser'
import { calculatePoints } from '@/lib/game/scorer'

interface Props {
  question: GameQuestion
  onAnswer: (result: QuestionResult) => void
  questionNumber: number
  totalQuestions: number
}

const PERSON_DISPLAY: Record<GrammaticalPerson, { de: string; sr: string }> = {
  ich:  { de: 'ich',      sr: 'ja'         },
  du:   { de: 'du',       sr: 'ti'         },
  er:   { de: 'er/sie/es', sr: 'on/ona/ono' },
  wir:  { de: 'wir',      sr: 'mi'         },
  ihr:  { de: 'ihr',      sr: 'vi'         },
  sie:  { de: 'sie/Sie',  sr: 'oni/Vi'     },
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

  const person = question.parsedSentence?.blanks[0]?.person
  const personInfo = person ? PERSON_DISPLAY[person] : null

  // Za generička pitanja (bez parsedSentence) prikazujemo hint prijevod
  const isGeneric = !question.parsedSentence
  const hint = isGeneric ? question.translation : null

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      {/* Progress */}
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Pitanje {questionNumber} / {totalQuestions}</span>
          <span className="font-medium text-blue-600">{questionNumber}/{totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Info kartica: glagol + lice */}
      <div className="w-full bg-blue-600 text-white rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-blue-200 uppercase tracking-wide mb-0.5">Glagol</p>
          <p className="text-2xl font-bold">{question.infinitiv}</p>
        </div>
        {personInfo && (
          <div className="text-right">
            <p className="text-xs text-blue-200 uppercase tracking-wide mb-0.5">Lice</p>
            <p className="text-xl font-bold">{personInfo.de}</p>
            <p className="text-sm text-blue-200">({personInfo.sr})</p>
          </div>
        )}
      </div>

      {/* Uputstvo */}
      <p className="text-sm text-gray-500 self-start">
        ✏️ Upiši ispravni oblik glagola u prazninu:
      </p>

      {/* Rečenica */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full">
        <div className="text-xl text-gray-900 leading-loose flex flex-wrap items-center gap-1">
          {parts.map((part, i) => {
            if (part.type === 'text') {
              return <span key={i}>{part.value}</span>
            }
            return (
              <span
                key={i}
                className={`inline-block min-w-[90px] border-b-2 px-2 text-center font-bold transition-colors ${
                  submitted
                    ? isCorrect
                      ? 'border-green-500 text-green-600'
                      : 'border-red-500 text-red-600'
                    : 'border-blue-400 text-blue-500'
                }`}
              >
                {submitted
                  ? isCorrect ? input : question.correctAnswers[0]
                  : input || '?'}
              </span>
            )
          })}
        </div>

        {/* Hint samo za generička pitanja */}
        {hint && (
          <p className="text-gray-400 text-sm mt-3 italic">
            💡 {hint}
          </p>
        )}
      </div>

      {/* Input */}
      <form onSubmit={handleSubmit} className="w-full flex gap-2">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={submitted}
          className="flex-1 border-2 border-gray-300 focus:border-blue-500 rounded-xl px-4 py-3 text-lg outline-none transition disabled:opacity-60 font-medium"
          placeholder={personInfo ? `${personInfo.de} forma...` : 'Unesite odgovor...'}
          autoCorrect="off"
          autoCapitalize="none"
          spellCheck={false}
        />
        <button
          type="submit"
          disabled={submitted || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl transition text-xl"
        >
          ✓
        </button>
      </form>

      {/* Feedback */}
      {submitted && (
        <div className={`w-full rounded-xl p-4 text-center font-semibold text-lg ${
          isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isCorrect
            ? '🎉 Tačno!'
            : `❌ Tačan odgovor: ${question.correctAnswers[0]}`}
        </div>
      )}
    </div>
  )
}
