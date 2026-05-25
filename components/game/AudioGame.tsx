'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import type { GameQuestion, QuestionResult } from '@/types'
import { calculatePoints } from '@/lib/game/scorer'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface Props {
  question: GameQuestion
  onAnswer: (result: QuestionResult) => void
  questionNumber: number
  totalQuestions: number
}

export function AudioGame({ question, onAnswer, questionNumber, totalQuestions }: Props) {
  const { t } = useTranslation()
  const g = t.game

  const [selected, setSelected] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const startTime = useRef(Date.now())

  const audioText = question.audioWord ?? question.infinitiv

  const speak = useCallback(() => {
    if (typeof window === 'undefined' || !window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utt = new SpeechSynthesisUtterance(audioText)
    utt.lang = 'de-DE'
    utt.rate = 0.85
    utt.pitch = 1.0
    utt.onstart = () => setIsPlaying(true)
    utt.onend = () => setIsPlaying(false)
    utt.onerror = () => setIsPlaying(false)
    window.speechSynthesis.speak(utt)
  }, [audioText])

  useEffect(() => {
    startTime.current = Date.now()
    setSelected(null)
    setSubmitted(false)
    setIsPlaying(false)
    const timer = setTimeout(speak, 600)
    return () => {
      clearTimeout(timer)
      if (typeof window !== 'undefined') window.speechSynthesis?.cancel()
    }
  }, [question.id, speak])

  function handleSelect(opt: string) {
    if (submitted) return
    setSelected(opt)
  }

  function handleSubmit() {
    if (!selected || submitted) return
    const timeTakenMs = Date.now() - startTime.current
    const correct = selected === question.correctAnswers[0]
    const points = calculatePoints(correct, timeTakenMs)
    setIsCorrect(correct)
    setSubmitted(true)
    setTimeout(() => {
      onAnswer({ questionId: question.id, userAnswer: selected, isCorrect: correct, timeTakenMs, pointsEarned: points })
    }, 1400)
  }

  const options = question.options ?? []

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

      <p className="text-xs text-gray-400 uppercase tracking-widest text-center w-full">
        {question.translation}
      </p>

      <div className="w-full bg-gradient-to-br from-sky-500 to-sky-700 rounded-2xl p-8 flex flex-col items-center gap-4">
        <button onClick={speak} title={g.audioClickToHear}
          className={`w-28 h-28 rounded-full flex items-center justify-center text-6xl transition-all select-none ${
            isPlaying ? 'bg-white/30 scale-95 shadow-inner' : 'bg-white/20 hover:bg-white/30 hover:scale-105 shadow-lg'
          }`}>
          <span className={isPlaying ? 'animate-pulse' : ''}>🔊</span>
        </button>
        <p className="text-sky-200 text-sm">
          {isPlaying ? g.audioPlaying : g.audioClickToHear}
        </p>
      </div>

      <p className="text-sm font-medium text-gray-600 self-start">{g.audioInstruction}</p>

      <div className="w-full grid grid-cols-2 gap-3">
        {options.map((opt) => {
          const isCorrectOpt = opt === question.correctAnswers[0]
          let cls = 'border-2 border-gray-200 bg-white text-gray-800 hover:border-sky-400 hover:bg-sky-50'
          if (selected === opt && !submitted) cls = 'border-2 border-sky-500 bg-sky-50 text-sky-800'
          if (submitted && isCorrectOpt) cls = 'border-2 border-green-500 bg-green-50 text-green-800'
          if (submitted && selected === opt && !isCorrectOpt) cls = 'border-2 border-red-400 bg-red-50 text-red-800'
          return (
            <button key={opt} onClick={() => handleSelect(opt)} disabled={submitted}
              className={`${cls} rounded-2xl py-5 text-center font-bold text-xl transition-all disabled:cursor-default`}>
              {opt}
            </button>
          )
        })}
      </div>

      {!submitted && (
        <button onClick={handleSubmit} disabled={!selected}
          className="w-full bg-sky-500 hover:bg-sky-600 disabled:opacity-40 text-white font-bold py-3 rounded-xl transition text-lg">
          {g.confirm}
        </button>
      )}

      {submitted && (
        <div className={`w-full rounded-xl p-4 text-center font-semibold text-lg ${
          isCorrect ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
        }`}>
          {isCorrect
            ? `${g.correct} ${g.audioYouHeard} „${audioText}"`
            : `${g.wrong} ${question.correctAnswers[0]} — ${g.audioHeard} „${audioText}"`}
        </div>
      )}
    </div>
  )
}
