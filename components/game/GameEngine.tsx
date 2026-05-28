'use client'

import { useState, useCallback } from 'react'
import type { GameSession, QuestionResult } from '@/types'
import { ConjugateGame } from './ConjugateGame'
import { FillBlankGame } from './FillBlankGame'
import { TranslateGame } from './TranslateGame'
import { MatchPairsGame } from './MatchPairsGame'
import { PerfektHilfsverbGame } from './PerfektHilfsverbGame'
import { PerfektPartizipGame } from './PerfektPartizipGame'
import { PerfektConjugateGame } from './PerfektConjugateGame'
import { PerfektFillGame } from './PerfektFillGame'
import { AudioGame } from './AudioGame'
import { WordOrderGame } from './WordOrderGame'
import { NounArticleGame } from './NounArticleGame'
import { QuestionWordsGame } from './QuestionWordsGame'

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
      {question.type === 'CONJUGATE' && <ConjugateGame key={question.id} {...questionProps} />}
      {question.type === 'FILL_BLANK' && <FillBlankGame key={question.id} {...questionProps} />}
      {question.type === 'TRANSLATE' && <TranslateGame {...questionProps} />}
      {question.type === 'MATCH_PAIRS' && <MatchPairsGame key={question.id} {...questionProps} />}
      {question.type === 'PERFEKT_HILFSVERB' && <PerfektHilfsverbGame key={question.id} {...questionProps} />}
      {question.type === 'PERFEKT_PARTIZIP' && <PerfektPartizipGame key={question.id} {...questionProps} />}
      {question.type === 'PERFEKT_CONJUGATE' && <PerfektConjugateGame key={question.id} {...questionProps} />}
      {question.type === 'PERFEKT_FILL' && <PerfektFillGame key={question.id} {...questionProps} />}
      {question.type === 'PERFEKT_PARTIZIP_MATCH' && <MatchPairsGame key={question.id} {...questionProps} />}
      {question.type === 'PRETERIT_MATCH' && <MatchPairsGame key={question.id} {...questionProps} />}
      {question.type === 'PRETERIT_CONJUGATE' && <ConjugateGame key={question.id} {...questionProps} />}
      {question.type === 'PRETERIT_FILL' && <FillBlankGame key={question.id} {...questionProps} />}
      {question.type === 'WORD_ORDER' && <WordOrderGame key={question.id} {...questionProps} />}
      {question.type === 'AUDIO' && <AudioGame key={question.id} {...questionProps} />}
      {question.type === 'NOUN_ARTICLE' && <NounArticleGame key={question.id} {...questionProps} />}
      {question.type === 'VOCAB_MATCH' && <MatchPairsGame key={question.id} {...questionProps} />}
      {question.type === 'QUESTION_WORDS' && <QuestionWordsGame key={question.id} {...questionProps} />}
    </div>
  )
}
