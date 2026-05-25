'use client'

import { useState, useCallback } from 'react'
import type { GameQuestion, QuestionResult } from '@/types'

// Klasične boje za rodove u nemačkom
const ARTICLE_STYLE: Record<string, { idle: string; selected: string; correct: string; wrong: string }> = {
  der: {
    idle:     'border-sky-400 text-sky-700 hover:bg-sky-50',
    selected: 'border-sky-500 bg-sky-100 text-sky-800',
    correct:  'border-sky-500 bg-sky-500 text-white',
    wrong:    'border-red-400 bg-red-100 text-red-700',
  },
  die: {
    idle:     'border-rose-400 text-rose-700 hover:bg-rose-50',
    selected: 'border-rose-500 bg-rose-100 text-rose-800',
    correct:  'border-rose-500 bg-rose-500 text-white',
    wrong:    'border-red-400 bg-red-100 text-red-700',
  },
  das: {
    idle:     'border-emerald-400 text-emerald-700 hover:bg-emerald-50',
    selected: 'border-emerald-500 bg-emerald-100 text-emerald-800',
    correct:  'border-emerald-500 bg-emerald-500 text-white',
    wrong:    'border-red-400 bg-red-100 text-red-700',
  },
}

interface Props {
  question: GameQuestion
  onAnswer: (result: QuestionResult) => void
  questionNumber: number
  totalQuestions: number
}

export function NounArticleGame({ question, onAnswer, questionNumber, totalQuestions }: Props) {
  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [startTime] = useState(Date.now())

  const correctArticle = question.correctAnswers[0]
  const articles = ['der', 'die', 'das']

  const handleSelect = useCallback((article: string) => {
    if (submitted) return
    setSelected(article)
  }, [submitted])

  const handleSubmit = useCallback(() => {
    if (!selected || submitted) return
    setSubmitted(true)
    const isCorrect = selected === correctArticle
    setTimeout(() => {
      onAnswer({
        questionId: question.id,
        userAnswer: selected,
        isCorrect,
        timeTakenMs: Date.now() - startTime,
        pointsEarned: isCorrect ? 100 : 0,
      })
    }, 1200)
  }, [selected, submitted, correctArticle, question.id, startTime, onAnswer])

  const getArticleStyle = (article: string) => {
    const styles = ARTICLE_STYLE[article]
    if (!submitted) {
      return selected === article ? styles.selected : styles.idle
    }
    if (article === correctArticle) return styles.correct
    if (article === selected && article !== correctArticle) return styles.wrong
    return styles.idle
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-8">
      {/* Progress */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Pitanje {questionNumber} / {totalQuestions}</span>
          <span>Imenice — član</span>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-sky-400 rounded-full transition-all"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
          />
        </div>
      </div>

      {/* Instrukcija */}
      <p className="text-gray-500 text-sm mb-6 text-center">
        Odaberi odredjeni član za imenicu:
      </p>

      {/* Imenica */}
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 mb-8 text-center">
        <p className="text-5xl font-bold text-gray-800 mb-3">{question.infinitiv}</p>
        {question.translation && (
          <p className="text-gray-400 text-sm">{question.translation}</p>
        )}
      </div>

      {/* Dugmad za članove */}
      <div className="w-full max-w-md grid grid-cols-3 gap-4 mb-8">
        {articles.map((article) => (
          <button
            key={article}
            onClick={() => handleSelect(article)}
            disabled={submitted}
            className={`
              py-5 rounded-xl border-2 font-bold text-2xl transition-all
              ${getArticleStyle(article)}
              ${!submitted && selected !== article ? 'cursor-pointer' : ''}
              ${submitted ? 'cursor-default' : ''}
            `}
          >
            {article}
          </button>
        ))}
      </div>

      {/* Feedback posle submita */}
      {submitted && (
        <div className={`w-full max-w-md rounded-xl p-4 text-center mb-6 ${
          selected === correctArticle
            ? 'bg-green-50 border border-green-200'
            : 'bg-red-50 border border-red-200'
        }`}>
          {selected === correctArticle ? (
            <p className="text-green-700 font-semibold">
              ✓ Tačno! <span className="font-bold">{correctArticle} {question.infinitiv}</span>
            </p>
          ) : (
            <p className="text-red-700 font-semibold">
              ✗ Netačno. Tačan odgovor: <span className="font-bold">{correctArticle} {question.infinitiv}</span>
            </p>
          )}
        </div>
      )}

      {/* Potvrdi dugme */}
      {!submitted && (
        <button
          onClick={handleSubmit}
          disabled={!selected}
          className="w-full max-w-md py-4 rounded-xl font-semibold text-white bg-sky-500 hover:bg-sky-600 disabled:bg-gray-200 disabled:text-gray-400 transition-colors"
        >
          Potvrdi
        </button>
      )}
    </div>
  )
}
