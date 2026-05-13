import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { logout } from '@/app/actions/auth'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const [dbUser, streak, totalPointsAgg] = await Promise.all([
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
  ])

  if (!dbUser) redirect('/login')

  const totalPoints = totalPointsAgg._sum.totalPoints ?? 0
  const verbsLearned = totalPointsAgg._count.verbId ?? 0
  const currentStreak = streak?.currentStreak ?? 0
  const longestStreak = streak?.longestStreak ?? 0

  const LESSONS = Array.from({ length: 13 }, (_, i) => i + 1)

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-blue-600 text-white px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <h1 className="font-bold text-lg">{dbUser.displayName}</h1>
            <p className="text-blue-200 text-sm">{dbUser.name} {dbUser.surname}</p>
          </div>
          <form action={logout}>
            <button type="submit" className="text-blue-200 hover:text-white text-sm">
              Odjavi se
            </button>
          </form>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Statistike */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard emoji="🔥" label="Streak" value={`${currentStreak} dana`} highlight={currentStreak > 0} />
          <StatCard emoji="⭐" label="Poeni" value={totalPoints.toLocaleString()} />
          <StatCard emoji="📚" label="Glagoli" value={`${verbsLearned}`} />
        </div>

        {currentStreak > 0 && longestStreak > 0 && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center text-sm text-orange-700">
            🏆 Najduži streak: <strong>{longestStreak} dana</strong>
          </div>
        )}

        {/* Lekcije */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 mb-3">Izaberi lekciju</h2>
          <div className="grid grid-cols-3 gap-3">
            {LESSONS.map((lesson) => (
              <Link
                key={lesson}
                href={`/lesson/${lesson}`}
                className="bg-white border-2 border-gray-200 hover:border-blue-500 hover:bg-blue-50 rounded-xl p-4 text-center font-bold text-gray-700 hover:text-blue-700 transition"
              >
                <div className="text-2xl mb-1">📖</div>
                <div className="text-sm">Lekcija {lesson}</div>
              </Link>
            ))}
          </div>
        </div>

        {/* Navigacija */}
        <div className="flex gap-3">
          <Link
            href="/leaderboard"
            className="flex-1 bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition"
          >
            <div className="text-2xl">🏆</div>
            <div className="text-sm font-medium text-gray-700 mt-1">Leaderboard</div>
          </Link>
          <Link
            href="/saved"
            className="flex-1 bg-white border border-gray-200 rounded-xl p-4 text-center hover:border-blue-400 hover:bg-blue-50 transition"
          >
            <div className="text-2xl">🔖</div>
            <div className="text-sm font-medium text-gray-700 mt-1">Sačuvani</div>
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
