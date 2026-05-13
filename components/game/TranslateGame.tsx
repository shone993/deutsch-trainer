'use client'

import { useState, useRef, useEffect } from 'react'
import type { GameQuestion, QuestionResult } from '@/types'
import { calculatePoints } from '@/lib/game/scorer'

interface Props {
  question: GameQuestion
  onAnswer: (result: QuestionResult) => void
  questionNumber: number
  totalQuestions: number
}

export function TranslateGame({ question, onAnswer, questionNumber, totalQuestions }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const startTime = useRef(Date.now())

  useEffect(() => {
    startTime.current = Date.now()
    setSelected(null)
  }, [question.id])

  function handleSelect(option: string) {
    if (selected) return
    setSelected(option)
    const timeTakenMs = Date.now() - startTime.current
    const isCorrect = question.correctAnswers.includes(option)
    const points = calculatePoints(isCorrect, timeTakenMs)

    setTimeout(() => {
      onAnswer({ questionId: question.id, userAnswer: option, isCorrect, timeTakenMs, pointsEarned: points })
    }, 1000)
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
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

      <div className="bg-white rounded-2xl shadow p-6 w-full text-center">
        <p className="text-gray-500 text-sm mb-2">Izaberi ispravnu konjugaciju za:</p>
        <p className="text-2xl font-bold text-gray-900">{question.translation}</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full">
        {(question.options ?? []).map((option) => {
          const isAnswer = question.correctAnswers.includes(option)
          let cls = 'border-2 border-gray-200 bg-white text-gray-800 hover:border-blue-400 hover:bg-blue-50'
          if (selected) {
            if (isAnswer) cls = 'border-2 border-green-500 bg-green-50 text-green-700'
            else if (option === selected) cls = 'border-2 border-red-500 bg-red-50 text-red-700'
            else cls = 'border-2 border-gray-200 bg-white text-gray-400 opacity-60'
          }
          return (
            <button
              key={option}
              onClick={() => handleSelect(option)}
              disabled={!!selected}
              className={`rounded-xl px-4 py-4 text-lg font-semibold transition ${cls}`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}
