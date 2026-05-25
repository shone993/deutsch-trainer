'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslation } from '@/lib/i18n/LanguageContext'

interface FlashCard {
  id: string
  front: string
  back: string
  type: 'noun' | 'verb' | 'word'
}

interface Props {
  cards: FlashCard[]
  lesson?: number
}

export function FlashcardClient({ cards, lesson }: Props) {
  const router = useRouter()
  const { t } = useTranslation()
  const fc = t.flashcard

  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<string[]>([])
  const [unknown, setUnknown] = useState<string[]>([])
  const [done, setDone] = useState(false)
  const [filteredCards, setFilteredCards] = useState(cards)

  const current = filteredCards[index]

  const handleFlip = useCallback(() => {
    setFlipped(f => !f)
  }, [])

  const handleAnswer = useCallback((knows: boolean) => {
    if (!current) return
    const newKnown = knows ? [...known, current.id] : known
    const newUnknown = !knows ? [...unknown, current.id] : unknown
    if (knows) setKnown(newKnown)
    else setUnknown(newUnknown)
    setFlipped(false)
    if (index + 1 >= filteredCards.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }, [current, index, filteredCards.length, known, unknown])

  const restart = useCallback(() => {
    setIndex(0)
    setFlipped(false)
    setKnown([])
    setUnknown([])
    setDone(false)
    setFilteredCards(cards)
  }, [cards])

  const retryUnknown = useCallback(() => {
    const unknownIds = new Set(unknown)
    const retry = cards.filter(c => unknownIds.has(c.id))
    setFilteredCards(retry)
    setIndex(0)
    setFlipped(false)
    setKnown([])
    setUnknown([])
    setDone(false)
  }, [cards, unknown])

  if (done) {
    const total = filteredCards.length
    const knownCount = known.length
    const pct = Math.round((knownCount / total) * 100)
    return (
      <div className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">{fc.finished}</h2>
          <p className="text-gray-500 mb-6">{fc.finishedDesc}</p>
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{knownCount}</p>
              <p className="text-sm text-gray-500">{fc.knownLabel}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{unknown.length}</p>
              <p className="text-sm text-gray-500">{fc.unknownLabel}</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-sky-600">{pct}%</p>
              <p className="text-sm text-gray-500">{fc.successLabel}</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={restart}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors"
            >
              {fc.repeatAll}
            </button>
            {unknown.length > 0 && (
              <button
                onClick={retryUnknown}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
              >
                {fc.repeatUnknown} ({unknown.length})
              </button>
            )}
            <button
              onClick={() => router.push('/imenice')}
              className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
            >
              {fc.backToNouns}
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!current) return null

  const typeBadge =
    current.type === 'noun' ? fc.noun :
    current.type === 'verb' ? fc.verb : fc.other

  const typeBadgeColor =
    current.type === 'noun' ? 'text-sky-400' :
    current.type === 'verb' ? 'text-violet-400' : 'text-amber-400'

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between items-center mb-2">
          <button onClick={() => router.push('/imenice')} className="text-gray-400 hover:text-gray-600 text-sm">
            {fc.back}
          </button>
          <span className="text-sm text-gray-500">
            {index + 1} / {filteredCards.length}
            {lesson ? ` · L${lesson}` : ''}
          </span>
          <div className="flex gap-3 text-sm">
            <span className="text-green-600">✓ {known.length}</span>
            <span className="text-red-500">✗ {unknown.length}</span>
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-sky-400 rounded-full transition-all duration-300"
            style={{ width: `${(index / filteredCards.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Kartica */}
      <div
        className="w-full max-w-md cursor-pointer mb-6"
        style={{ perspective: '1000px' }}
        onClick={handleFlip}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: 'preserve-3d',
            transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
            height: '220px',
          }}
        >
          {/* Prednja strana — nemački */}
          <div
            className="absolute inset-0 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden' }}
          >
            <span className={`text-xs font-semibold uppercase tracking-wider mb-3 ${typeBadgeColor}`}>
              {typeBadge}
            </span>
            <p className="text-4xl font-bold text-gray-800 text-center">{current.front}</p>
            <p className="text-gray-400 text-sm mt-4">{fc.clickToFlip}</p>
          </div>

          {/* Zadnja strana — prevod */}
          <div
            className="absolute inset-0 bg-sky-50 rounded-2xl shadow-sm border border-sky-100 flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider mb-3 text-sky-400">
              {fc.translationLang}
            </span>
            <p className="text-4xl font-bold text-sky-700 text-center">{current.back}</p>
            <p className="text-gray-400 text-sm mt-4 text-center font-medium">{current.front}</p>
          </div>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-6">
        {flipped ? fc.doYouKnow : fc.clickToFlip}
      </p>

      {/* Znam / Ne znam */}
      <div className={`w-full max-w-md flex gap-4 transition-opacity duration-300 ${flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => handleAnswer(false)}
          className="flex-1 py-4 rounded-xl border-2 border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors text-lg"
        >
          {fc.dontKnow}
        </button>
        <button
          onClick={() => handleAnswer(true)}
          className="flex-1 py-4 rounded-xl border-2 border-green-400 text-green-700 font-semibold hover:bg-green-50 transition-colors text-lg"
        >
          {fc.know}
        </button>
      </div>

      {/* Okreni dugme ako nije flipped */}
      {!flipped && (
        <button
          onClick={handleFlip}
          className="w-full max-w-md py-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors text-lg"
        >
          {fc.flipCard}
        </button>
      )}
    </div>
  )
}
