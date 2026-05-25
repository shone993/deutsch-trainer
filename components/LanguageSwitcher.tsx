'use client'

import { useTranslation } from '@/lib/i18n/LanguageContext'
import { LANG_LABELS, type Lang } from '@/lib/i18n/translations'

const LANGS: Lang[] = ['sr', 'hu', 'de']

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, changing } = useTranslation()

  if (compact) {
    // Samo zastava trenutnog jezika — klikni za sledeći
    const current = LANGS.indexOf(lang)
    const next = LANGS[(current + 1) % LANGS.length]
    const flag = LANG_LABELS[lang].split(' ')[0]
    return (
      <button
        onClick={() => setLang(next)}
        disabled={changing}
        title={`Promeni jezik / Change language / Sprache wechseln`}
        className="text-xl opacity-90 hover:opacity-100 transition disabled:opacity-50"
      >
        {flag}
      </button>
    )
  }

  return (
    <div className="flex gap-2">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          disabled={changing}
          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
            lang === l
              ? 'bg-sky-500 text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          } disabled:opacity-50`}
        >
          {LANG_LABELS[l]}
        </button>
      ))}
    </div>
  )
}
