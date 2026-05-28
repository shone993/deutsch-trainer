'use client'

import { useState, useRef, useEffect } from 'react'
import type { GameQuestion, QuestionResult } from '@/types'
import { checkAnswer } from '@/lib/game/parser'
import { calculatePoints } from '@/lib/game/scorer'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface Props {
  question: GameQuestion
  onAnswer: (result: QuestionResult) => void
  questionNumber: number
  totalQuestions: number
}

export function QuestionWordsGame({ question, onAnswer, questionNumber, totalQuestions }: Props) {
  const { t } = useTranslation()
  const g = t.game

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
      onAnswer({ questionId: question.id, userAnswer: input, isCorrect: correct, timeTakenMs, pointsEarned: points })
    }, 1200)
  }

  const template = question.sentence ?? ''
  const blankIdx = template.indexOf('___')
  const before = blankIdx >= 0 ? template.slice(0, blankIdx) : template
  const after  = blankIdx >= 0 ? template.slice(blankIdx + 3) : ''

  const displayAnswer = submitted ? (isCorrect ? input : question.correctAnswers[0]) : (input || '?')

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{g.question} {questionNumber} / {totalQuestions}</span>
          <span className="font-medium text-violet-600">{questionNumber}/{totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-violet-500 h-2 rounded-full transition-all"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
        </div>
      </div>

      <div className="w-full bg-violet-500 text-white rounded-2xl px-5 py-4">
        <p className="text-xs text-violet-200 uppercase tracking-wide mb-0.5">{g.fragewortLabel}</p>
        <p className="text-xl font-bold">❓ {g.fragewortInstruction}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full">
        <div className="text-xl text-gray-900 leading-loose flex flex-wrap items-baseline gap-x-1">
          {before && <span>{before}</span>}
          <span className={`inline-block min-w-[100px] border-b-2 px-2 text-center font-bold transition-colors ${
            submitted
              ? isCorrect ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'
              : 'border-violet-400 text-violet-500'
          }`}>
            {displayAnswer}
          </span>
          {after && <span>{after}</span>}
        </div>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex gap-2">
        <input
          ref={inputRef} type="text" value={input}
          onChange={(e) => setInput(e.target.value)} disabled={submitted}
          className="flex-1 border-2 border-gray-300 focus:border-violet-500 rounded-xl px-4 py-3 text-lg outline-none transition disabled:opacity-60 font-medium"
          placeholder={g.answerPlaceholder}
          autoCorrect="off" autoCapitalize="none" spellCheck={false}
        />
        <button type="submit" disabled={submitted || !input.trim()}
          className="bg-violet-500 hover:bg-violet-600 disabled:opacity-40 text-white font-bold px-6 py-3 rounded-xl transition text-xl">
          ✓
        </button>
      </form>

      {submitted && (
        <div className={`w-full rounded-xl p-4 text-center font-semibold text-lg ${
          isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isCorrect ? g.correct : `${g.wrong} ${question.correctAnswers[0]}`}
        </div>
      )}
    </div>
  )
}
