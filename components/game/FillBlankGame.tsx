'use client'

import { useState, useRef, useEffect } from 'react'
import type { GameQuestion, GrammaticalPerson, QuestionResult } from '@/types'
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

const PERSON_DE: Record<GrammaticalPerson, string> = {
  ich: 'ich', du: 'du', er: 'er/sie/es', wir: 'wir', ihr: 'ihr', sie: 'sie/Sie',
}

export function FillBlankGame({ question, onAnswer, questionNumber, totalQuestions }: Props) {
  const { t } = useTranslation()
  const g = t.game

  const [input, setInput] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [feedbackPhrase, setFeedbackPhrase] = useState('')
  const startTime = useRef(Date.now())
  const inputRef = useRef<HTMLInputElement>(null)

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

  const parts = question.parsedSentence?.parts ?? [
    { type: 'text' as const, value: question.sentence ?? '' },
  ]

  const person = question.parsedSentence?.blanks[0]?.person as GrammaticalPerson | undefined
  const personDe = person ? PERSON_DE[person] : null
  const personNative = person ? g.persons[person] : null

  const hint = !question.parsedSentence ? question.translation : null

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

      <div className="w-full bg-sky-500 text-white rounded-2xl px-5 py-4 flex items-center justify-between">
        <div>
          <p className="text-xs text-sky-200 uppercase tracking-wide mb-0.5">{g.verbLabel}</p>
          <p className="text-2xl font-bold">{question.infinitiv}</p>
        </div>
        {personDe && (
          <div className="text-right">
            <p className="text-xs text-sky-200 uppercase tracking-wide mb-0.5">{g.personLabel}</p>
            <p className="text-xl font-bold">{personDe}</p>
            {personNative && <p className="text-sm text-sky-200">({personNative})</p>}
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 self-start">{g.fillInstruction}</p>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 w-full">
        <div className="text-xl text-gray-900 leading-loose flex flex-wrap items-center gap-1">
          {parts.map((part, i) => {
            if (part.type === 'text') return <span key={i}>{part.value}</span>
            return (
              <span key={i} className={`inline-block min-w-[90px] border-b-2 px-2 text-center font-bold transition-colors ${
                submitted
                  ? isCorrect ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'
                  : 'border-sky-400 text-sky-500'
              }`}>
                {submitted ? (isCorrect ? input : question.correctAnswers[0]) : (input || '?')}
              </span>
            )
          })}
        </div>
        {hint && <p className="text-gray-400 text-sm mt-3 italic">💡 {hint}</p>}
      </div>

      <form onSubmit={handleSubmit} className="w-full flex gap-2">
        <input
          ref={inputRef} type="text" value={input}
          onChange={(e) => setInput(e.target.value)} disabled={submitted}
          className="flex-1 border-2 border-gray-300 focus:border-sky-500 rounded-xl px-4 py-3 text-lg outline-none transition disabled:opacity-60 font-medium"
          placeholder={personDe ? `${personDe} ${g.formPlaceholder}` : g.answerPlaceholder}
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
