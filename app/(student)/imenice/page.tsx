'use client'

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { useTranslation } from '@/lib/i18n/LanguageContext'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

type ExerciseType = 'NOUN_ARTICLE' | 'VOCAB_MATCH'

const LESSONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]

export default function ImeniceListPage() {
  const router = useRouter()
  const { t, lang } = useTranslation()
  const [selectedType, setSelectedType] = useState<ExerciseType | null>(null)
  const [selectedLesson, setSelectedLesson] = useState<number>(0)
  const [showInstruction, setShowInstruction] = useState(false)

  const NOUN_EXERCISES = [
    {
      type: 'NOUN_ARTICLE' as ExerciseType,
      label: 'DER / DIE / DAS',
      emoji: '🏷️',
      description: t.nounArticle.instruction.replace(':', ''),
    },
    {
      type: 'VOCAB_MATCH' as ExerciseType,
      label: t.vocabMatch.label,
      emoji: '🔗',
      description: lang === 'sr'
        ? 'Poveži nemački izraz sa prevodom'
        : lang === 'hu'
          ? 'Kapcsold össze a német kifejezést a fordítással'
          : 'Verbinde den deutschen Ausdruck mit der Übersetzung',
    },
  ]

  const INSTRUCTIONS: Record<ExerciseType, string> = {
    NOUN_ARTICLE: lang === 'sr'
      ? 'Pojaviće se nemačka imenica. Klikni na tačan određeni član: DER (muški rod), DIE (ženski rod) ili DAS (srednji rod). Potvrdi izbor klikom na dugme "Potvrdi".'
      : lang === 'hu'
        ? 'Megjelenik egy német főnév. Kattints a helyes határozott névelőre: DER (hímnem), DIE (nőnem) vagy DAS (semleges nem). Erősítsd meg a választást a "Megerősít" gombra kattintva.'
        : 'Ein deutsches Nomen wird angezeigt. Klicke auf den richtigen bestimmten Artikel: DER (männlich), DIE (weiblich) oder DAS (sächlich). Bestätige deine Wahl mit "Bestätigen".',
    VOCAB_MATCH: lang === 'sr'
      ? 'Poveži nemački izraz na levoj strani sa srpskim prevodom na desnoj strani. Klikni na par reči da ih povežeš. Svi parovi moraju biti tačno povezani.'
      : lang === 'hu'
        ? 'Kapcsold össze a bal oldali német kifejezést a jobb oldali fordítással. Kattints egy szópárra az összekapcsoláshoz. Minden párt helyesen kell összekapcsolni.'
        : 'Verbinde den deutschen Ausdruck auf der linken Seite mit der Übersetzung auf der rechten Seite. Klicke auf ein Wortpaar, um es zu verbinden.',
  }

  const handleStart = useCallback((type: ExerciseType) => {
    setSelectedType(type)
    setShowInstruction(true)
  }, [])

  const startGame = useCallback(() => {
    if (!selectedType) return
    const lessonParam = selectedLesson > 0 ? `&nounLesson=${selectedLesson}` : ''
    router.push(`/game?type=${selectedType}&count=10${lessonParam}`)
  }, [router, selectedType, selectedLesson])

  const selectedExercise = NOUN_EXERCISES.find(e => e.type === selectedType)

  if (showInstruction && selectedType && selectedExercise) {
    return (
      <div className="flex flex-col items-center min-h-screen bg-gray-50 px-4 py-8">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="flex justify-center mb-6">
            <Image src="/vts-logo.png" alt="VTŠ Subotica" width={80} height={80} className="rounded-full" />
          </div>

          {/* Lang toggle */}
          <div className="flex justify-center mb-6">
            <LanguageSwitcher />
          </div>

          {/* Uputstvo */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="font-bold text-gray-800 text-lg mb-3">
              {selectedExercise.emoji} {selectedExercise.label}
            </h2>
            <p className="text-gray-600 leading-relaxed">
              {INSTRUCTIONS[selectedType]}
            </p>
          </div>

          {/* Lekcija filter (samo za NOUN_ARTICLE) */}
          {selectedType === 'NOUN_ARTICLE' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
              <p className="text-sm font-medium text-gray-600 mb-3">
                {t.imenice.lessonLabel}
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
                  {t.imenice.allLessons}
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
              {t.back}
            </button>
            <button
              onClick={startGame}
              className="flex-1 py-3 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold transition-colors"
            >
              {t.imenice.start}
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
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => router.back()} className="text-gray-400 hover:text-gray-600">
              ←
            </button>
            <div>
              <h1 className="text-xl font-bold text-gray-800">{t.imenice.title}</h1>
              <p className="text-gray-500 text-sm">{t.imenice.subtitle}</p>
            </div>
          </div>
          <LanguageSwitcher compact />
        </div>

        {/* Sekcija: Vežbe */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            {t.imenice.exercises}
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
            {t.imenice.flashcardsSection}
          </h2>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => router.push('/imenice/kartice')}
              className="bg-white rounded-xl border border-gray-100 p-4 text-left hover:border-amber-300 hover:bg-amber-50 transition-all shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">🃏</span>
                <div>
                  <p className="font-semibold text-gray-800">{t.imenice.allCards}</p>
                  <p className="text-sm text-gray-500">{t.imenice.allCardsDesc}</p>
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
                  <p className="font-semibold text-gray-800">{t.imenice.onlyNouns}</p>
                  <p className="text-sm text-gray-500">{t.imenice.onlyNounsDesc}</p>
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
                  <p className="font-semibold text-gray-800">{t.imenice.onlyVerbs}</p>
                  <p className="text-sm text-gray-500">{t.imenice.onlyVerbsDesc}</p>
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
                  <p className="font-semibold text-gray-800">{t.imenice.otherWords}</p>
                  <p className="text-sm text-gray-500">{t.imenice.otherWordsDesc}</p>
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
