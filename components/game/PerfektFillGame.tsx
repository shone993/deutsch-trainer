'use client'

import { useState, useRef, useEffect } from 'react'
import type { GameQuestion, QuestionResult } from '@/types'
import { checkAnswer } from '@/lib/game/parser'
import { calculatePoints } from '@/lib/game/scorer'

interface Props {
  question: GameQuestion
  onAnswer: (result: QuestionResult) => void
  questionNumber: number
  totalQuestions: number
}

export function PerfektFillGame({ question, onAnswer, questionNumber, totalQuestions }: Props) {
  const [inputs, setInputs] = useState(['', ''])
  const [submitted, setSubmitted] = useState(false)
  const [correct, setCorrect] = useState([false, false])
  const startTime = useRef(Date.now())
  const inputRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)]

  const blanks = question.parsedSentence?.blanks ?? []
  const parts = question.parsedSentence?.parts ?? []

  useEffect(() => {
    startTime.current = Date.now()
    setInputs(['', ''])
    setSubmitted(false)
    inputRefs[0].current?.focus()
  }, [question.id])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (submitted) return
    if (inputs[0].trim() === '' || (blanks.length > 1 && inputs[1].trim() === '')) return

    const c = blanks.map((b, i) => checkAnswer(inputs[i] ?? '', b.answer))
    const allCorrect = c.every(Boolean)
    const timeTakenMs = Date.now() - startTime.current
    const points = calculatePoints(allCorrect, timeTakenMs)

    setCorrect(c)
    setSubmitted(true)

    setTimeout(() => {
      onAnswer({
        questionId: question.id,
        userAnswer: inputs.join(' | '),
        isCorrect: allCorrect,
        timeTakenMs,
        pointsEarned: points,
      })
    }, 1500)
  }

  let blankUsed = 0

  return (
    <div className="flex flex-col items-center gap-5 w-full max-w-lg mx-auto">
      <div className="w-full">
        <div className="flex justify-between text-sm text-gray-500 mb-1">
          <span>Pitanje {questionNumber} / {totalQuestions}</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div className="bg-purple-500 h-2 rounded-full transition-all"
            style={{ width: `${(questionNumber / totalQuestions) * 100}%` }} />
        </div>
      </div>

      <div className="w-full bg-purple-600 text-white rounded-2xl px-5 py-4 text-center">
        <p className="text-xs text-purple-200 uppercase tracking-wide mb-1">Perfekt — Popuni rečenicu</p>
        <p className="text-2xl font-bold">{question.infinitiv}</p>
      </div>

      <p className="text-sm text-gray-500 self-start">
        ✏️ Upiši pomoćni glagol i Partizip II:
      </p>

      {/* Rečenica sa prazninama */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5 w-full">
        <div className="text-lg text-gray-900 leading-loose flex flex-wrap items-center gap-1">
          {parts.map((part, i) => {
            if (part.type === 'text') return <span key={i}>{part.value}</span>
            const idx = blankUsed++
            const isAux = idx === 0
            const val = submitted
              ? (correct[idx] ? inputs[idx] : blanks[idx]?.answer ?? '')
              : (inputs[idx] || (isAux ? 'aux' : 'Partizip II'))
            return (
              <span key={i} className={`inline-block border-b-2 px-2 text-center font-bold min-w-[80px] transition-colors ${
                submitted
                  ? correct[idx] ? 'border-green-500 text-green-600' : 'border-red-500 text-red-600'
                  : 'border-purple-400 text-purple-500'
              }`}>
                {val}
              </span>
            )
          })}
        </div>
        <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
          <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded">1. pomoćni glagol</span>
          <span className="bg-purple-100 text-purple-600 px-2 py-0.5 rounded">2. Partizip II</span>
        </div>
      </div>

      {/* Dva input polja */}
      <form onSubmit={handleSubmit} className="w-full space-y-2">
        <div className="flex gap-2">
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">1. Pomoćni glagol (haben/sein)</label>
            <input ref={inputRefs[0]} type="text" value={inputs[0]}
              onChange={(e) => setInputs([e.target.value, inputs[1]])}
              disabled={submitted}
              className="w-full border-2 border-gray-300 focus:border-purple-500 rounded-xl px-3 py-2.5 text-base outline-none transition disabled:opacity-60"
              placeholder="habe / bin / hat ..."
              autoCorrect="off" autoCapitalize="none" spellCheck={false} />
          </div>
          <div className="flex-1">
            <label className="text-xs text-gray-500 mb-1 block">2. Partizip II</label>
            <input ref={inputRefs[1]} type="text" value={inputs[1]}
              onChange={(e) => setInputs([inputs[0], e.target.value])}
              disabled={submitted}
              className="w-full border-2 border-gray-300 focus:border-purple-500 rounded-xl px-3 py-2.5 text-base outline-none transition disabled:opacity-60"
              placeholder="gelernt / gegangen ..."
              autoCorrect="off" autoCapitalize="none" spellCheck={false} />
          </div>
        </div>
        <button type="submit" disabled={submitted || !inputs[0].trim()}
          className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition">
          Potvrdi ✓
        </button>
      </form>

      {submitted && (
        <div className={`w-full rounded-xl p-4 text-center font-semibold ${
          correct.every(Boolean) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {correct.every(Boolean) ? '🎉 Tačno!' : (
            <div>
              <div>❌ Tačni odgovori:</div>
              {blanks.map((b, i) => (
                <div key={i} className="text-sm mt-1">
                  {i === 0 ? 'Pomoćni glagol' : 'Partizip II'}: <strong>{b.answer}</strong>
                  {!correct[i] && <span className="text-red-400"> (ti si upisao: {inputs[i]})</span>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
