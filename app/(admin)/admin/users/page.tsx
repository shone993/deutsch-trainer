import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export const metadata = { title: 'Studenti — Admin' }

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })
  if (!dbUser || dbUser.role !== 'ADMIN') redirect('/profile')

  const [students, allStats, allStreaks, allSessions] = await Promise.all([
    prisma.user.findMany({
      where: { role: 'STUDENT' },
      orderBy: [{ surname: 'asc' }, { name: 'asc' }],
      select: { id: true, name: true, surname: true, displayName: true, email: true, createdAt: true },
    }),
    prisma.stats.groupBy({
      by: ['userId'],
      _sum: { totalPoints: true },
      _count: { verbId: true },
    }),
    prisma.streak.findMany({
      select: { userId: true, currentStreak: true, longestStreak: true, lastActiveDate: true },
    }),
    prisma.exerciseSession.groupBy({
      by: ['userId'],
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } },
    }),
  ])

  const statsMap = new Map(allStats.map(s => [s.userId, s]))
  const streakMap = new Map(allStreaks.map(s => [s.userId, s]))
  const sessionMap = new Map(allSessions.map(s => [s.userId, s._count.id]))

  const rows = students.map(s => ({
    ...s,
    totalPoints: statsMap.get(s.id)?._sum.totalPoints ?? 0,
    verbsLearned: statsMap.get(s.id)?._count.verbId ?? 0,
    currentStreak: streakMap.get(s.id)?.currentStreak ?? 0,
    lastActive: streakMap.get(s.id)?.lastActiveDate ?? null,
    sessionsCount: sessionMap.get(s.id) ?? 0,
  }))

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-indigo-300 hover:text-white text-sm shrink-0">
            ← Admin
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-tight">Studenti</h1>
            <p className="text-indigo-300 text-xs">{students.length} registrovanih studenata</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Ime i prezime</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Korisničko ime</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Poeni</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Glagola</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Sesija</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Streak</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Poslednja aktiv.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {rows.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">{r.name} {r.surname}</div>
                    <div className="text-xs text-gray-400">{r.email}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{r.displayName}</td>
                  <td className="px-4 py-3 text-right font-semibold text-indigo-600">
                    {r.totalPoints.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right text-gray-700">{r.verbsLearned}</td>
                  <td className="px-4 py-3 text-right text-gray-700">{r.sessionsCount}</td>
                  <td className="px-4 py-3 text-right">
                    {r.currentStreak > 0 ? (
                      <span className="text-orange-600 font-medium">🔥 {r.currentStreak}d</span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs">
                    {r.lastActive
                      ? new Date(r.lastActive).toLocaleDateString('sr-RS')
                      : '—'}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center text-gray-500 py-8">
                    Nema registrovanih studenata
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  )
}
