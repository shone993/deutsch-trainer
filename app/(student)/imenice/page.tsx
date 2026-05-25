'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

type ExerciseType = 'NOUN_ARTICLE' | 'VOCAB_MATCH'

interface ExerciseEntry {
  type: ExerciseType
  label: string
  emoji: string
  description: string
}

const NOUN_EXERCISES: ExerciseEntry[] = [
  {
    type: 'NOUN_ARTICLE',
    label: 'DER / DIE / DAS',
    emoji: '🏷️',
    description: 'Klikni na tačan odredjeni član',
  },
  {
    type: 'VOCAB_MATCH',
    label: 'Poveži parove',
    emoji: '🔗',
    description: 'Poveži nemački izraz sa prevodom',
  },
]

const LESSONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

const INSTRUCTIONS: Record<ExerciseType, { srb: string; hun: string }> = {
  NOUN_ARTICLE: {
    srb: 'Pojaviće se nemačka imenica. Klikni na tačan odredjeni član: DER (muški rod), DIE (ženski rod) ili DAS (srednji rod). Potvrdi izbor klikom na dugme "Potvrdi".',
    hun: 'Megjelenik egy német főnév. Kattints a helyes határozott névelőre: DER (hímnem), DIE (nőnem) vagy DAS (semleges nem). Erősítsd meg a választást a "Potvrdi" gombra kattintva.',
  },
  VOCAB_MATCH: {
    srb: 'Poveži nemački izraz na levoj strani sa srpskim prevodom na desnoj strani. Klikni na par reči da ih povežeš. Svi parovi moraju biti tačno povezani.',
    hun: 'Kapcsold össze a bal oldalon lévő német kifejezést a jobb oldali szerb fordítással. Kattints egy szópárra az összekapcsoláshoz. Minden párt helyesen kell összekapcsolni.',
  },
}

export default function ImeniceListPage() {
  const router = useRouter()
  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<number>(0) // 0 = sve
  const [lang, setLang] = useState<'srb' | 'hun'>('srb')
  const [showInstruction, setShowInstruction] = useState(false)

  const handleStart = useCallback((type: ExerciseType) => {
    setSelectedType(type)
    setShowInstruction(true)
  }, [])

  const startGame = useCallback(() => {
    if (!selectedType) return
    const lessonParam = selectedLesson > 0 ? `&nounLesson=${selectedLesson}` : ''
    router.push(`/game?type=${selectedType}&count=10${lessonParam}`)
  }, [router, selectedType, selectedLesson])

  if (showInstruction && selectedType) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image src="/vts-logo.png" alt="VTŠ Subotica" width={80} height={80} className="rounded-full" />
          </div>

          {/* Lang toggle */}
          <div className="flex justify-center gap-2 mb-6">
            <button
              onClick={() => setLang('srb')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                lang === 'srb' ? 'bg-sky-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              🇷🇸 Srpski
            </button>
            <button
              onClick={() => setLang('hun')}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                lang === 'hun' ? 'bg-sky-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              🇭🇺 Magyar
            </button>
          </div>

          {/* Uputstvo */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-gray-800 text-lg mb-3">
              {NOUN_EXERCISES.find(e => e.type === selectedType)?.emoji}{' '}
              {NOUN_EXERCISES.find(e => e.type === selectedType)?.label}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {INSTRUCTIONS[selectedType][lang]}
            </p>
          </div>

          {/* Lekcija filter (samo za NOUN_ARTICLE) */}
          {selectedType === 'NOUN_ARTICLE' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <p className="text-sm font-medium text-gray-600 mb-3">
                {lang === 'srb' ? 'Lekcija:' : 'Lecke:'}
              </p>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedLesson(0)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    selectedLesson === 0
                      ? 'bg-sky-500 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {lang === 'srb' ? 'Sve' : 'Mind'}
                </button>
                {LESSONS.map(l => (
                  <button
                    key={l}
                    onClick={() => setSelectedLesson(l)}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      selectedLesson === l
                        ? 'bg-sky-500 text-white'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => setShowInstruction(false)}
              className="flex-1 py-3 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-50 font-medium transition-colors"
            >
              ← Nazad
            </button>
            <button
              onClick={startGame}
              className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors"
            >
              Kreni! 🚀
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
            ←
          </button>
          <div>
            <h1 className="text-xl font-bold text-gray-800">Imenice</h1>
            <p className="text-gray-500 text-sm">Vežbe za nemačke imenice</p>
          </div>
        </div>

        {/* Sekcija: Vežbe */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Vežbe
          </h2>
          <div className="flex flex-col gap-3">
            {NOUN_EXERCISES.map((ex) => (
              <button
                key={ex.type}
                onClick={() => handleStart(ex.type)}
                className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:border-sky-300 hover:bg-sky-50 transition-all shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{ex.emoji}</span>
                  <div>
                    <p className="font-semibold text-gray-800">{ex.label}</p>
                    <p className="text-sm text-gray-500">{ex.description}</p>
                  </div>
                  <span className="ml-auto text-gray-300">›</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Sekcija: Kartice */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Kartice (Flashcards)
          </h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/imenice/kartice')}
              className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:border-amber-300 hover:bg-amber-50 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🃏</span>
                <div>
                  <p className="font-semibold text-gray-800">Sve kartice</p>
                  <p className="text-sm text-gray-500">Glagoli + imenice + ostalo</p>
                </div>
                <span className="ml-auto text-gray-300">›</span>
              </div>
            </button>
            <button
              onClick={() => router.push('/imenice/kartice?type=noun')}
              className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:border-sky-300 hover:bg-sky-50 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🏷️</span>
                <div>
                  <p className="font-semibold text-gray-800">Samo imenice</p>
                  <p className="text-sm text-gray-500">281 imenica sa članom</p>
                </div>
                <span className="ml-auto text-gray-300">›</span>
              </div>
            </button>
            <button
              onClick={() => router.push('/imenice/kartice?type=verb')}
              className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:border-violet-300 hover:bg-violet-50 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">📝</span>
                <div>
                  <p className="font-semibold text-gray-800">Samo glagoli</p>
                  <p className="text-sm text-gray-500">Infinitiv → prevod</p>
                </div>
                <span className="ml-auto text-gray-300">›</span>
              </div>
            </button>
            <button
              onClick={() => router.push('/imenice/kartice?type=word')}
              className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:border-amber-300 hover:bg-amber-50 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">💬</span>
                <div>
                  <p className="font-semibold text-gray-800">Ostale reči</p>
                  <p className="text-sm text-gray-500">Pridevi, prilozi i ostalo</p>
                </div>
                <span className="ml-auto text-gray-300">›</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
