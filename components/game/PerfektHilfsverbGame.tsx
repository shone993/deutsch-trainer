'use client'

import { useState, useRef } from 'react'
import type { GameQuestion, QuestionResult } from '@/types'
import { calculatePoints } from '@/lib/game/scorer'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface Props {
  question: GameQuestion
  onAnswer: (result: QuestionResult) => void
  questionNumber: number
  totalQuestions: number
}

export function PerfektHilfsverbGame({ question, onAnswer, questionNumber, totalQuestions }: Props) {
  const { t } = useTranslation()
  const g = t.game

  const [selected, setSelected] = useState<string | null>(null)
  const startTime = useRef(Date.now())

  function handleSelect(option: string) {
    if (selected) return
    setSelected(option)
    const isCorrect = option === question.correctAnswers[0]
    const timeTakenMs = Date.now() - startTime.current
    const points = calculatePoints(isCorrect, timeTakenMs)
    setTimeout(() => {
      onAnswer({ questionId: question.id, userAnswer: option, isCorrect, timeTakenMs, pointsEarned: points })
    }, 900)
  }

  const correct = question.correctAnswers[0]

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{g.question} {questionNumber} / {totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
        </div>
      </div>

      <div className="w-full bg-purple-600 text-white rounded-2xl px-5 py-4 text-center">
        <p className="text-xs text-purple-200 uppercase tracking-wide mb-1">{g.perfektHilfsverbHeader}</p>
        <p className="text-3xl font-bold">{question.infinitiv}</p>
        {question.translation && <p className="text-purple-200 text-sm mt-1">({question.translation})</p>}
      </div>

      <p className="text-sm text-gray-500 self-start">{g.perfektHilfsverbQ}</p>

      <div className="grid grid-cols-2 gap-4 w-full">
        {(question.options ?? ['haben', 'sein']).map((opt) => {
          let style = 'border-2 border-gray-300 text-gray-800 hover:border-purple-400 hover:bg-purple-50'
          if (selected) {
            if (opt === correct) style = 'border-2 border-green-500 bg-green-100 text-green-800'
            else if (opt === selected) style = 'border-2 border-red-400 bg-red-100 text-red-700'
            else style = 'border-2 border-gray-200 text-gray-400 opacity-60'
          }
          return (
            <button key={opt} onClick={() => handleSelect(opt)} disabled={!!selected}
              className={`rounded-2xl py-6 text-2xl font-bold transition ${style}`}>
              {opt}
            </button>
          )
        })}
      </div>

      {selected && (
        <div className={`w-full rounded-xl p-4 text-center font-semibold text-lg ${
          selected === correct ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {selected === correct
            ? `${g.correct} ${question.infinitiv} ${g.perfektHilfsverbUses} "${correct}"`
            : `${g.wrong} ${correct}`}
        </div>
      )}
    </div>
  )
}
