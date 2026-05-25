'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'

interface FlashCard {
  id: string
  front: string     // nemački (imenica sa članom, glagol, reč)
  back: string      // srpski prevod
  type: 'noun' | 'verb' | 'word'
}

interface Props {
  cards: FlashCard[]
  lesson?: number
}

export function FlashcardClient({ cards, lesson }: Props) {
  const router = useRouter()
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [known, setKnown] = useState<string[]>([])
  const [unknown, setUnknown] = useState<string[]>([])
  const [done, setDone] = useState(false)

  const current = cards[index]

  const handleFlip = useCallback(() => {
    setFlipped(f => !f)
  }, [])

  const handleAnswer = useCallback((knows: boolean) => {
    if (!current) return
    if (knows) {
      setKnown(k => [...k, current.id])
    } else {
      setUnknown(u => [...u, current.id])
    }
    setFlipped(false)
    if (index + 1 >= cards.length) {
      setDone(true)
    } else {
      setIndex(i => i + 1)
    }
  }, [current, index, cards.length])

  if (done) {
    const total = cards.length
    const knownCount = known.length
    const pct = Math.round((knownCount / total) * 100)
    return (
      <div className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-8">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center mt-12">
          <div className="text-6xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Završeno!</h2>
          <p className="text-gray-500 mb-6">
            Prošao/la si kroz sve kartice
          </p>
          <div className="flex justify-center gap-8 mb-8">
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{knownCount}</p>
              <p className="text-sm text-gray-500">Znam ✓</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-red-500">{unknown.length}</p>
              <p className="text-sm text-gray-500">Ne znam ✗</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-sky-600">{pct}%</p>
              <p className="text-sm text-gray-500">Uspešnost</p>
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { setIndex(0); setFlipped(false); setKnown([]); setUnknown([]); setDone(false) }}
              className="w-full py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors"
            >
              🔁 Ponovi sve kartice
            </button>
            {unknown.length > 0 && (
              <button
                onClick={() => {
                  // TODO: filter to only unknown cards
                  setIndex(0); setFlipped(false); setKnown([]); setUnknown([]); setDone(false)
                }}
                className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold transition-colors"
              >
                🔁 Ponovi samo neznane ({unknown.length})
              </button>
            )}
            <button
              onClick={() => router.push('/imenice')}
              className="w-full py-3 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 font-semibold transition-colors"
            >
              ← Nazad na imenice
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-8">
      {/* Header */}
      <div className="w-full max-w-md mb-6">
        <div className="flex justify-between items-center mb-2">
          <button onClick={() => router.push('/imenice')} className="text-gray-400 hover:text-gray-600 text-sm">
            ← Nazad
          </button>
          <span className="text-sm text-gray-500">
            {index + 1} / {cards.length}
          </span>
          <div className="flex gap-3 text-sm">
            <span className="text-green-600">✓ {known.length}</span>
            <span className="text-red-500">✗ {unknown.length}</span>
          </div>
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-sky-400 rounded-full transition-all duration-300"
            style={{ width: `${(index / cards.length) * 100}%` }}
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
            <span className={`text-xs font-semibold uppercase tracking-wider mb-3 ${
              current.type === 'noun' ? 'text-sky-400' :
              current.type === 'verb' ? 'text-violet-400' : 'text-amber-400'
            }`}>
              {current.type === 'noun' ? '🏷️ Imenica' : current.type === 'verb' ? '📝 Glagol' : '💬 Ostalo'}
            </span>
            <p className="text-4xl font-bold text-gray-800 text-center">{current.front}</p>
            <p className="text-gray-400 text-sm mt-4">Klikni da vidiš prevod</p>
          </div>

          {/* Zadnja strana — prevod */}
          <div
            className="absolute inset-0 bg-sky-50 rounded-2xl shadow-sm border border-sky-100 flex flex-col items-center justify-center p-6"
            style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
          >
            <span className="text-xs font-semibold uppercase tracking-wider mb-3 text-sky-400">
              🇷🇸 Srpski
            </span>
            <p className="text-4xl font-bold text-sky-700 text-center">{current.back}</p>
            <p className="text-gray-400 text-sm mt-4 text-center font-medium">{current.front}</p>
          </div>
        </div>
      </div>

      <p className="text-gray-400 text-sm mb-6">
        {flipped ? 'Da li si znao/la?' : 'Klikni na karticu da vidiš prevod'}
      </p>

      {/* Znam / Ne znam dugmad */}
      <div className={`w-full max-w-md flex gap-4 transition-opacity duration-300 ${flipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          onClick={() => handleAnswer(false)}
          className="flex-1 py-4 rounded-xl border-2 border-red-300 text-red-600 font-semibold hover:bg-red-50 transition-colors text-lg"
        >
          ✗ Ne znam
        </button>
        <button
          onClick={() => handleAnswer(true)}
          className="flex-1 py-4 rounded-xl border-2 border-green-400 text-green-700 font-semibold hover:bg-green-50 transition-colors text-lg"
        >
          ✓ Znam
        </button>
      </div>

      {/* Skip ako kartica nije okrenuta */}
      {!flipped && (
        <button
          onClick={handleFlip}
          className="w-full max-w-md py-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors text-lg"
        >
          Okreni karticu
        </button>
      )}
    </div>
  )
}
