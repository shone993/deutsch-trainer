import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { logout } from '@/app/actions/auth'
import { getLang } from '@/lib/i18n/getLang'
import { T } from '@/lib/i18n/translations'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [dbUser, streak, totalPointsAgg, lang, roleRows] = await Promise.all([
    prisma.user.findUnique({
      where: { id: user.id },
      select: { displayName: true, name: true, surname: true, email: true, avatarUrl: true, language: true },
    }),
    prisma.streak.findUnique({ where: { userId: user.id } }),
    prisma.stats.aggregate({
      where: { userId: user.id },
      _sum: { totalPoints: true },
      _count: { verbId: true },
    }),
    getLang(),
    prisma.$queryRaw<{ role: string }[]>`SELECT role::text FROM users WHERE id = ${user.id}`,
  ])

  const isAdmin = roleRows[0]?.role === 'ADMIN'

  if (!dbUser) redirect('/login')

  const t = T[lang]

  const totalPoints = totalPointsAgg._sum.totalPoints ?? 0
  const verbsLearned = totalPointsAgg._count.verbId ?? 0
  const currentStreak = streak?.currentStreak ?? 0
  const longestStreak = streak?.longestStreak ?? 0

  const LESSONS = Array.from({ length: 13 }, (_, i) => i + 1)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-sky-500 text-white px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-white rounded-lg px-2 py-1">
              <Image src="/vts-transparent.png" alt="VTŠ" width={50} height={25} />
            </div>
            <div>
              <h1 className="font-bold text-base leading-tight">{dbUser.displayName}</h1>
              <p className="text-sky-100 text-xs">{dbUser.name} {dbUser.surname}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher compact />
            <form action={logout}>
              <button type="submit" className="text-sky-100 hover:text-white text-sm">
                {t.logout}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Statistike */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard emoji="🔥" label={t.profile.streak} value={`${currentStreak} ${t.profile.days}`} highlight={currentStreak > 0} />
          <StatCard emoji="⭐" label={t.profile.points} value={totalPoints.toLocaleString()} />
          <StatCard emoji="📚" label={t.profile.verbs} value={`${verbsLearned}`} />
        </div>

        {currentStreak > 0 && longestStreak > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center text-sm text-orange-700">
            🏆 {t.profile.longestStreak} <strong>{longestStreak} {t.profile.days}</strong>
          </div>
        )}

        {/* Lekcije */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">{t.profile.chooseLesson}</h2>
          <div className="grid grid-cols-3 gap-3">
            {LESSONS.map((lesson) => (
              <Link
                key={lesson}
                href={`/lesson/${lesson}`}
                className={`border-2 rounded-xl p-4 text-center font-bold transition ${
                  lesson === 13
                    ? 'bg-sky-50 border-sky-300 hover:border-sky-500 hover:bg-sky-100 text-sky-700 hover:text-sky-800'
                    : 'bg-white border-gray-200 hover:border-sky-500 hover:bg-sky-50 text-gray-700 hover:text-sky-700'
                }`}
              >
                <div className="text-2xl mb-1">{lesson === 13 ? '🔄' : '📖'}</div>
                <div className="text-sm">{lesson === 13 ? t.profile.review : `${t.profile.lesson} ${lesson}`}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Kartice za učenje */}
        <Link
          href="/imenice/kartice"
          className="flex items-center gap-4 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl px-5 py-4 transition shadow-sm"
        >
          <span className="text-3xl">🃏</span>
          <div>
            <div className="font-bold text-base leading-tight">{t.profile.nounsTitle}</div>
            <div className="text-sky-100 text-sm">{t.profile.nounsSubtitle}</div>
          </div>
          <span className="ml-auto text-sky-200 text-xl">›</span>
        </Link>

        {/* Admin link */}
        {isAdmin && (
          <Link
            href="/dashboard"
            className="flex items-center gap-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl px-5 py-4 transition shadow-sm"
          >
            <span className="text-3xl">⚙️</span>
            <div>
              <div className="font-bold text-base leading-tight">Admin Panel</div>
              <div className="text-indigo-200 text-sm">Sesije · Studenti · Glagoli</div>
            </div>
            <span className="ml-auto text-indigo-300 text-xl">›</span>
          </Link>
        )}

        {/* Navigacija */}
        <div className="grid grid-cols-3 gap-3">
          <Link
            href="/leaderboard"
            className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-sky-400 hover:bg-sky-50 transition"
          >
            <div className="text-2xl">🏆</div>
            <div className="text-sm font-medium text-gray-700 mt-1">{t.profile.leaderboard}</div>
          </Link>
          <Link
            href="/saved"
            className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-sky-400 hover:bg-sky-50 transition"
          >
            <div className="text-2xl">🔖</div>
            <div className="text-sm font-medium text-gray-700 mt-1">{t.profile.saved}</div>
          </Link>
          <Link
            href="/glosar"
            className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-sky-400 hover:bg-sky-50 transition"
          >
            <div className="text-2xl">📖</div>
            <div className="text-sm font-medium text-gray-700 mt-1">{t.profile.glossary}</div>
          </Link>
          <Link
            href="/zanimljivosti"
            className="bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-sky-400 hover:bg-sky-50 transition"
          >
            <div className="text-2xl">🌍</div>
            <div className="text-sm font-medium text-gray-700 mt-1">{t.profile.facts}</div>
          </Link>
        </div>
      </div>
    </main>
  )
}

function StatCard({ emoji, label, value, highlight = false }: {
  emoji: string; label: string; value: string; highlight?: boolean
}) {
  return (
    <div className={`rounded-xl p-3 text-center ${highlight ? 'bg-orange-50 border border-orange-200' : 'bg-white border border-gray-200'}`}>
      <div className="text-2xl">{emoji}</div>
      <div className="text-xs text-gray-500 mt-1">{label}</div>
      <div className="font-bold text-gray-900 text-sm">{value}</div>
    </div>
  )
}
