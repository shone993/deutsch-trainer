'use client'

import { useState, useMemo } from 'react'
import type { GameQuestion, QuestionResult } from '@/types'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface Props {
  question: GameQuestion
  onAnswer: (result: QuestionResult) => void
  questionNumber: number
  totalQuestions: number
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

export function MatchPairsGame({ question, onAnswer, questionNumber, totalQuestions }: Props) {
  const { t } = useTranslation()
  const g = t.game

  const infinitives = question.options ?? []
  const conjugations = question.correctAnswers

  const pairMap = useMemo(() => {
    const m = new Map<string, string>()
    infinitives.forEach((inf, i) => m.set(inf, conjugations[i]))
    return m
  }, [infinitives, conjugations])

  const [leftItems] = useState(() => shuffle(infinitives))
  const [rightItems] = useState(() => shuffle(conjugations))
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matched, setMatched] = useState<Set<string>>(new Set())
  const [wrong, setWrong] = useState<{ left: string; right: string } | null>(null)
  const [wrongAttempts, setWrongAttempts] = useState(0)

  const totalPairs = infinitives.length

  function handleLeft(inf: string) {
    if (matched.has(inf) || wrong) return
    setSelectedLeft(inf)
    if (selectedRight !== null) checkPair(inf, selectedRight)
  }

  function handleRight(conj: string) {
    if (wrong) return
    const alreadyMatched = [...matched].some((inf) => pairMap.get(inf) === conj)
    if (alreadyMatched) return
    setSelectedRight(conj)
    if (selectedLeft !== null) checkPair(selectedLeft, conj)
  }

  function checkPair(inf: string, conj: string) {
    if (pairMap.get(inf) === conj) {
      const newMatched = new Set(matched)
      newMatched.add(inf)
      setMatched(newMatched)
      setSelectedLeft(null)
      setSelectedRight(null)
      if (newMatched.size === totalPairs) {
        setTimeout(() => {
          onAnswer({
            questionId: question.id, userAnswer: conjugations[0], isCorrect: true,
            timeTakenMs: wrongAttempts, pointsEarned: Math.max(10, 100 - wrongAttempts * 15),
          })
        }, 600)
      }
    } else {
      setWrongAttempts((n) => n + 1)
      setWrong({ left: inf, right: conj })
      setTimeout(() => { setWrong(null); setSelectedLeft(null); setSelectedRight(null) }, 800)
    }
  }

  function getLeftStyle(inf: string) {
    if (matched.has(inf)) return 'bg-green-100 border-green-400 text-green-800 opacity-60'
    if (wrong?.left === inf) return 'bg-red-100 border-red-400 text-red-700 animate-shake'
    if (selectedLeft === inf) return 'bg-sky-100 border-sky-500 text-blue-800'
    return 'bg-white border-gray-300 text-gray-800 hover:border-sky-400 hover:bg-sky-50'
  }

  function getRightStyle(conj: string) {
    const isMatched = [...matched].some((inf) => pairMap.get(inf) === conj)
    if (isMatched) return 'bg-green-100 border-green-400 text-green-800 opacity-60'
    if (wrong?.right === conj) return 'bg-red-100 border-red-400 text-red-700 animate-shake'
    if (selectedRight === conj) return 'bg-sky-100 border-sky-500 text-blue-800'
    return 'bg-white border-gray-300 text-gray-800 hover:border-sky-400 hover:bg-sky-50'
  }

  return (
    <div className="max-w-lg mx-auto w-full">
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>{g.question} {questionNumber} / {totalQuestions}</span>
          <span>{matched.size} / {totalPairs} {g.pairsOf}</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div className="h-2 bg-sky-500 rounded-full transition-all"
            style={{ width: `${((questionNumber - 1) / totalQuestions) * 100}%` }} />
        </div>
      </div>

      <h2 className="text-lg font-bold text-gray-900 mb-1">{g.matchTitle}</h2>
      <p className="text-sm text-gray-500 mb-6">{g.matchInstruction}</p>

      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-3">
          {leftItems.map((inf) => (
            <button key={inf} onClick={() => handleLeft(inf)} disabled={matched.has(inf)}
              className={`border-2 rounded-xl px-4 py-3 font-semibold text-sm transition cursor-pointer ${getLeftStyle(inf)}`}>
              {inf}
            </button>
          ))}
        </div>
        <div className="flex flex-col gap-3">
          {rightItems.map((conj) => {
            const isMatched = [...matched].some((inf) => pairMap.get(inf) === conj)
            return (
              <button key={conj} onClick={() => handleRight(conj)} disabled={isMatched}
                className={`border-2 rounded-xl px-4 py-3 font-semibold text-sm transition cursor-pointer ${getRightStyle(conj)}`}>
                {conj}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
