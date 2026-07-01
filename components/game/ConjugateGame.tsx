'use client'

import { useState, useRef, useEffect } from 'react'
import type { GameQuestion, QuestionResult } from '@/types'
import { checkAnswer } from '@/lib/game/parser'
import { calculatePoints } from '@/lib/game/scorer'
import { randomCorrectPhrase, randomWrongPhrase } from '@/lib/game/feedback'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface Props {
  question: GameQuestion
  onAnswer: (result: QuestionResult) => void
  questionNumber: number
  totalQuestions: number
}

export function ConjugateGame({ question, onAnswer, questionNumber, totalQuestions }: Props) {
  const { t } = useTranslation()
  const g = t.game

  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedbackPhrase, setFeedbackPhrase] = useState('')
  const startTime = useRef(Date.now())
  const inputRef = useRef<HTMLInputElement>(null)

  const pronoun = question.options?.[0] ?? ''

  useEffect(() => {
    startTime.current = Date.now()
    setInput('')
    setSubmitted(false)
    setFeedbackPhrase('')
    inputRef.current?.focus()
  }, [question.id])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitted || !input.trim()) return
    const timeTakenMs = Date.now() - startTime.current
    const correct = checkAnswer(input, question.correctAnswers[0])
    const points = calculatePoints(correct, timeTakenMs)
    setIsCorrect(correct)
    setFeedbackPhrase(correct ? randomCorrectPhrase() : randomWrongPhrase())
    setSubmitted(true)
    setTimeout(() => {
      onAnswer({ questionId: question.id, userAnswer: input, isCorrect: correct, timeTakenMs, pointsEarned: points })
    }, 1200)
  }

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

      <p className="text-sm text-gray-500 self-start">{g.conjugateInstruction}</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 w-full text-center">
        <p className="text-sm text-gray-400 uppercase tracking-wide mb-2">{g.verbLabel}</p>
        <p className="text-3xl font-bold text-gray-900 mb-6">{question.infinitiv}</p>
        <div className="flex items-center justify-center gap-4 text-2xl">
          <span className="bg-sky-100 text-sky-700 font-bold px-4 py-2 rounded-xl">{pronoun}</span>
          <span className="text-gray-400">+</span>
          <span className={`font-bold px-4 py-2 rounded-xl border-2 min-w-[120px] transition-colors ${
            submitted
              ? isCorrect ? 'border-green-400 text-green-600 bg-green-50' : 'border-red-400 text-red-600 bg-red-50'
              : 'border-blue-300 text-sky-500 bg-sky-50'
          }`}>
            {submitted ? (isCorrect ? input : question.correctAnswers[0]) : (input || '?')}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex gap-2">
        <input
          ref={inputRef} type="text" value={input}
          onChange={(e) => setInput(e.target.value)} disabled={submitted}
          className="flex-1 border-2 border-gray-300 focus:border-sky-500 rounded-xl px-4 py-3 text-lg outline-none transition disabled:opacity-60 font-medium"
          placeholder={`${pronoun} ${g.formPlaceholder}`}
          autoCorrect="off" autoCapitalize="none" spellCheck={false}
        />
        <button type="submit" disabled={submitted || !input.trim()}
          className="bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl transition text-xl">
          ✓
        </button>
      </form>

      {submitted && (
        <div className={`w-full rounded-xl p-4 text-center font-semibold text-lg ${
          isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          <div>{feedbackPhrase}</div>
          {!isCorrect && <div className="text-sm font-normal mt-1">{g.wrong} {question.correctAnswers[0]}</div>}
        </div>
      )}
    </div>
  )
}
