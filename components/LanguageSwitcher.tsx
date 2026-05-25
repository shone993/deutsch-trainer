'use client'

import { useTranslation } from '@/lib/i18n/LanguageContext'
import type { Lang } from '@/lib/i18n/translations'

const LANGS: { code: Lang; flag: string; name: string }[] = [
  { code: 'sr', flag: '🇷🇸', name: 'Srpski' },
  { code: 'hu', flag: '🇭🇺', name: 'Magyar' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
]

/** compact=true → 3 zastavice bez teksta (za header)
 *  compact=false → 3 zastavice sa imenom (za login/register) */
export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { lang, setLang, changing } = useTranslation()

  if (compact) {
    return (
      <div className="flex items-center gap-1">
        {LANGS.map(({ code, flag }) => (
          <button
            key={code}
            onClick={() => setLang(code)}
            disabled={changing}
            title={code.toUpperCase()}
            className={`text-xl leading-none transition-all disabled:opacity-40 ${
              lang === code
                ? 'opacity-100 scale-125'
                : 'opacity-40 hover:opacity-80 hover:scale-110'
            }`}
          >
            {flag}
          </button>
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 justify-center">
      {LANGS.map(({ code, flag, name }) => (
        <button
          key={code}
          onClick={() => setLang(code)}
          disabled={changing}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all disabled:opacity-40 ${
            lang === code
              ? 'bg-sky-500 text-white shadow-sm'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          <span className="text-base">{flag}</span>
          <span>{name}</span>
        </button>
      ))}
    </div>
  )
}
