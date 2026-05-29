import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { getLang } from '@/lib/i18n/getLang'
import { T } from '@/lib/i18n/translations'

export const metadata = { title: 'Sačuvani glagoli — Deutsch Trainer' }

export default async function SavedPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [lang, saved] = await Promise.all([
    getLang(),
    prisma.savedVerb.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: {
        verb: {
          select: {
            id: true,
            infinitiv: true,
            translation: true,
            translationHu: true,
            ich: true,
            du: true,
            erSieEs: true,
            wir: true,
            ihr: true,
            sieSie: true,
            perfekt: true,
            lesson: true,
          },
        },
      },
    }),
  ])

  const t = T[lang]

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-sky-500 text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/profile" className="text-sky-200 hover:text-white text-sm">← Nazad</Link>
          <div>
            <h1 className="font-bold text-lg leading-tight">🔖 {t.profile.saved}</h1>
            <p className="text-sky-100 text-xs">{saved.length} sačuvanih glagola</p>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {saved.length === 0 ? (
          <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
            <div className="text-4xl mb-3">🔖</div>
            <p className="text-gray-600 font-medium mb-1">Nema sačuvanih glagola</p>
            <p className="text-gray-400 text-sm">Sačuvaj glagole tokom vežbanja da ih nađeš ovde.</p>
            <Link
              href="/profile"
              className="mt-4 inline-block bg-sky-500 text-white px-4 py-2 rounded-lg text-sm hover:bg-sky-600 transition"
            >
              Vrati se na profil
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {saved.map(({ verb }) => (
              <div key={verb.id} className="bg-white rounded-xl border border-gray-200 p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className="font-bold text-gray-900 text-base">{verb.infinitiv}</span>
                    <span className="text-xs text-gray-400 ml-2">Lekcija {verb.lesson}</span>
                  </div>
                  <div className="text-right text-sm">
                    {lang === 'hu' && verb.translationHu ? (
                      <span className="text-sky-700">{verb.translationHu}</span>
                    ) : (
                      <span className="text-sky-700">{verb.translation ?? ''}</span>
                    )}
                  </div>
                </div>

                {/* Konjugacija prezent */}
                <div className="grid grid-cols-3 gap-1 text-xs mt-2">
                  {[
                    ['ich', verb.ich],
                    ['du', verb.du],
                    ['er/sie/es', verb.erSieEs],
                    ['wir', verb.wir],
                    ['ihr', verb.ihr],
                    ['sie/Sie', verb.sieSie],
                  ].map(([pron, form]) => (
                    <div key={pron} className="bg-gray-50 rounded px-2 py-1">
                      <span className="text-gray-400">{pron} </span>
                      <span className="font-medium text-gray-800">{form}</span>
                    </div>
                  ))}
                </div>

                {/* Perfekt */}
                <div className="mt-2 text-xs text-gray-500">
                  Perfekt: <span className="font-medium text-gray-700">{verb.perfekt}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
