'use client'

import { useState, useRef, useEffect } from 'react'
import type { GameQuestion, QuestionResult } from '@/types'
import { calculatePoints } from '@/lib/game/scorer'
import { randomCorrectPhrase, randomWrongPhrase } from '@/lib/game/feedback'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface Props {
  question: GameQuestion
  onAnswer: (result: QuestionResult) => void
  questionNumber: number
  totalQuestions: number
}

export function KonjunktionFillGame({ question, onAnswer, questionNumber, totalQuestions }: Props) {
  const { t } = useTranslation()
  const g = t.game

  const [selected, setSelected] = useState<string | null>(null)
  const [feedbackPhrase, setFeedbackPhrase] = useState('')
  const startTime = useRef(Date.now())

  useEffect(() => {
    startTime.current = Date.now()
    setSelected(null)
    setFeedbackPhrase('')
  }, [question.id])

  const template = question.sentence ?? ''
  const blankIdx = template.indexOf('___')
  const before = blankIdx >= 0 ? template.slice(0, blankIdx) : template
  const after  = blankIdx >= 0 ? template.slice(blankIdx + 3) : ''

  const correctAnswer = question.correctAnswers[0]
  const options = question.options ?? []

  function handleSelect(option: string) {
    if (selected) return
    const timeTakenMs = Date.now() - startTime.current
    const isCorrect = option.toLowerCase() === correctAnswer.toLowerCase()
    const points = calculatePoints(isCorrect, timeTakenMs)
    setSelected(option)
    setFeedbackPhrase(isCorrect ? randomCorrectPhrase() : randomWrongPhrase())
    setTimeout(() => {
      onAnswer({ questionId: question.id, userAnswer: option, isCorrect, timeTakenMs, pointsEarned: points })
    }, 1200)
  }

  const displayWord = selected
    ? (selected.toLowerCase() === correctAnswer.toLowerCase() ? selected : correctAnswer)
    : '___'

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{g.question} {questionNumber} / {totalQuestions}</span>
          <span className="font-medium text-amber-600">{questionNumber}/{totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-amber-500 h-2 rounded-full transition-all"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
        </div>
      </div>

      <div className="w-full bg-amber-500 text-white rounded-2xl px-5 py-4">
        <p className="text-xs text-amber-100 uppercase tracking-wide mb-0.5">{g.konjunktionLabel}</p>
        <p className="text-lg font-bold">🔗 {g.konjunktionInstruction}</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full">
        <div className="text-xl text-gray-900 leading-loose flex flex-wrap items-baseline gap-x-1">
          {before && <span>{before}</span>}
          <span className={`inline-block min-w-[80px] border-b-2 px-2 text-center font-bold transition-colors ${
            selected
              ? selected.toLowerCase() === correctAnswer.toLowerCase()
                ? 'border-green-500 text-green-600'
                : 'border-red-500 text-red-600'
              : 'border-amber-400 text-amber-500'
          }`}>
            {displayWord}
          </span>
          {after && <span>{after}</span>}
        </div>
      </div>

      <div className="grid grid-cols-3 gap-3 w-full sm:grid-cols-5">
        {options.map((option) => {
          const isCorrectOption = option.toLowerCase() === correctAnswer.toLowerCase()
          let cls = 'border-2 border-gray-200 bg-white text-gray-800 hover:border-amber-400 hover:bg-amber-50'
          if (selected) {
            if (isCorrectOption) cls = 'border-2 border-green-500 bg-green-50 text-green-700 font-bold'
            else if (option === selected) cls = 'border-2 border-red-500 bg-red-50 text-red-700'
            else cls = 'border-2 border-gray-200 bg-white text-gray-400 opacity-60'
          }
          return (
            <button key={option} onClick={() => handleSelect(option)} disabled={!!selected}
              className={`rounded-xl px-3 py-3 text-base font-semibold transition ${cls}`}>
              {option}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className={`w-full rounded-xl p-4 text-center font-semibold text-lg ${
          selected.toLowerCase() === correctAnswer.toLowerCase()
            ? 'bg-green-100 text-green-700'
            : 'bg-red-100 text-red-700'
        }`}>
          <div>{feedbackPhrase}</div>
          {selected.toLowerCase() !== correctAnswer.toLowerCase() && (
            <div className="text-sm font-normal mt-1">{g.wrong} {correctAnswer}</div>
          )}
        </div>
      )}
    </div>
  )
}
