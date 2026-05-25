'use client'

import { createContext, useContext, useState, useCallback, useTransition, type ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { T, type Lang, type Translations } from './translations'

interface LanguageContextValue {
  lang: Lang
  t: Translations
  setLang: (lang: Lang) => void
  changing: boolean
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'sr',
  t: T.sr,
  setLang: () => {},
  changing: false,
})

export function LanguageProvider({ children, initialLang }: { children: ReactNode; initialLang: Lang }) {
  const [lang, setLangState] = useState<Lang>(initialLang)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const setLang = useCallback((newLang: Lang) => {
    setLangState(newLang)
    // Postavi cookie direktno sa client strane (trajanje 1 godina)
    document.cookie = `app-lang=${newLang}; path=/; max-age=31536000; SameSite=Lax`
    // Osvježi server komponente
    startTransition(() => router.refresh())
  }, [router])

  return (
    <LanguageContext.Provider value={{ lang, t: T[lang], setLang, changing: isPending }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useTranslation() {
  return useContext(LanguageContext)
}
