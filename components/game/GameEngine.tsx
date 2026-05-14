'use client'

import { useState, useCallback } from 'react'
import type { GameQuestion, GameSession, GameType, QuestionResult } from '@/types'
import { FillBlankGame } from './FillBlankGame'
import { TranslateGame } from './TranslateGame'
import { MatchPairsGame } from './MatchPairsGame'

interface Props {
  session: GameSession
  onComplete: (results: QuestionResult[], totalScore: number, maxScore: number) => void
}

export function GameEngine({ session, onComplete }: Props) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [results, setResults] = useState<QuestionResult[]>([])

  const handleAnswer = useCallback((result: QuestionResult) => {
    const newResults = [...results, result]
    setResults(newResults)

    if (currentIndex + 1 >= session.questions.length) {
      const totalScore = newResults.reduce((sum, r) => sum + r.pointsEarned, 0)
      const maxScore = session.questions.length * 100
      onComplete(newResults, totalScore, maxScore)
    } else {
      setCurrentIndex((i) => i + 1)
    }
  }, [results, currentIndex, session.questions.length, onComplete])

  const question = session.questions[currentIndex]
  if (!question) return null

  const questionProps = {
    question,
    onAnswer: handleAnswer,
    questionNumber: currentIndex + 1,
    totalQuestions: session.questions.length,
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 px-4 py-8">
      {question.type === 'FILL_BLANK' && <FillBlankGame {...questionProps} />}
      {question.type === 'TRANSLATE' && <TranslateGame {...questionProps} />}
      {question.type === 'MATCH_PAIRS' && <MatchPairsGame {...questionProps} />}
      {question.type === 'AUDIO' && (
        <div className="text-center text-gray-500 mt-20">
          <p className="text-2xl mb-2">🚧</p>
          <p>Audio vežba je u razvoju</p>
          <button
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg"
            onClick={() => handleAnswer({
              questionId: question.id,
              userAnswer: '',
              isCorrect: false,
              timeTakenMs: 0,
              pointsEarned: 0,
            })}
          >
            Preskoči
          </button>
        </div>
      )}
    </div>
  )
}
