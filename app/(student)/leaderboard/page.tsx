import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { period = 'all' } = await searchParams
  const validPeriod = ['all', '7days', 'semester'].includes(period) ? period : 'all'

  let dateFilter: Date | undefined
  if (validPeriod === '7days') dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  else if (validPeriod === 'semester') {
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    dateFilter = month >= 10 || month <= 1
      ? new Date(month >= 10 ? year : year - 1, 9, 1)
      : new Date(year, 1, 1)
  }

  const sessions = await prisma.exerciseSession.groupBy({
    by: ['userId'],
    where: dateFilter ? { completedAt: { gte: dateFilter } } : undefined,
    _sum: { score: true },
    _count: { id: true },
    orderBy: { _sum: { score: 'desc' } },
    take: 50,
  })

  const userIds = sessions.map((s) => s.userId)
  const [users, streaks] = await Promise.all([
    prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, displayName: true, avatarUrl: true },
    }),
    prisma.streak.findMany({
      where: { userId: { in: userIds } },
      select: { userId: true, currentStreak: true },
    }),
  ])

  const userMap = new Map(users.map((u) => [u.id, u]))
  const streakMap = new Map(streaks.map((s) => [s.userId, s.currentStreak]))

  const entries = sessions.map((s, i) => ({
    rank: i + 1,
    userId: s.userId,
    displayName: userMap.get(s.userId)?.displayName ?? 'Nepoznat',
    totalPoints: s._sum.score ?? 0,
    currentStreak: streakMap.get(s.userId) ?? 0,
    sessionsCount: s._count.id,
    isMe: s.userId === user.id,
  }))

  const PERIODS = [
    { key: 'all', label: 'Ukupno' },
    { key: '7days', label: '7 dana' },
    { key: 'semester', label: 'Semestar' },
  ]

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-blue-600 text-white px-4 py-4">
        <div className="max-w-lg mx-auto flex items-center gap-3">
          <Link href="/profile" className="text-blue-200 hover:text-white">←</Link>
          <h1 className="font-bold text-lg">🏆 Leaderboard</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-4 py-6">
        {/* Period filter */}
        <div className="flex gap-2 mb-6">
          {PERIODS.map((p) => (
            <Link
              key={p.key}
              href={`?period=${p.key}`}
              className={`flex-1 text-center py-2 rounded-lg text-sm font-medium transition ${
                validPeriod === p.key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-200 text-gray-600 hover:border-blue-400'
              }`}
            >
              {p.label}
            </Link>
          ))}
        </div>

        {/* Rang lista */}
        <div className="space-y-2">
          {entries.length === 0 && (
            <p className="text-center text-gray-500 py-8">Nema podataka za ovaj period</p>
          )}
          {entries.map((entry) => (
            <div
              key={entry.userId}
              className={`flex items-center gap-3 bg-white rounded-xl p-4 border-2 ${
                entry.isMe ? 'border-blue-400 bg-blue-50' : 'border-transparent'
              }`}
            >
              <div className={`w-8 text-center font-bold text-lg ${
                entry.rank === 1 ? 'text-yellow-500' :
                entry.rank === 2 ? 'text-gray-400' :
                entry.rank === 3 ? 'text-amber-600' : 'text-gray-500'
              }`}>
                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : entry.rank}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 truncate">
                  {entry.displayName} {entry.isMe && <span className="text-blue-600 text-xs">(ti)</span>}
                </div>
                <div className="text-xs text-gray-500">
                  {entry.sessionsCount} sesija · 🔥 {entry.currentStreak}d
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gray-900">{entry.totalPoints.toLocaleString()}</div>
                <div className="text-xs text-gray-400">poena</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  )
}
