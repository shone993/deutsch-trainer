import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { getLang } from '@/lib/i18n/getLang'
import { LanguageProvider } from '@/lib/i18n/LanguageContext'

const geistSans = Geist({ variable: '--font-geist-sans', subsets: ['latin'] })
const geistMono = Geist_Mono({ variable: '--font-geist-mono', subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Deutsch Trainer VTŠ',
  description: 'Interaktivno učenje nemačkog jezika — konjugacija glagola, vežbe i gejmifikacija',
  manifest: '/manifest.json',
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang()
  const htmlLang = lang === 'de' ? 'de' : lang === 'hu' ? 'hu' : 'sr'

  return (
    <html lang={htmlLang} className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full bg-gray-50 text-gray-900 flex flex-col">
        <LanguageProvider initialLang={lang}>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
