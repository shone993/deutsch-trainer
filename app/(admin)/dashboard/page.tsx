import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, displayName: true },
  })

  if (!dbUser || dbUser.role !== 'ADMIN') redirect('/profile')

  const [verbCount, userCount, sentenceCount, sessionsToday] = await Promise.all([
    prisma.verb.count(),
    prisma.user.count({ where: { role: 'STUDENT' } }),
    prisma.sentence.count(),
    prisma.exerciseSession.count({
      where: { completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) } },
    }),
  ])

  const recentSessions = await prisma.exerciseSession.findMany({
    take: 10,
    orderBy: { completedAt: 'desc' },
    include: { user: { select: { displayName: true } } },
  })

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white px-4 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="font-bold text-xl">Admin Panel</h1>
          <p className="text-indigo-300 text-sm">{dbUser.displayName}</p>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {/* Statistike */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Glagola', value: verbCount, emoji: '📝' },
            { label: 'Studenata', value: userCount, emoji: '👥' },
            { label: 'Rečenica', value: sentenceCount, emoji: '💬' },
            { label: 'Sesija danas', value: sessionsToday, emoji: '🎮' },
          ].map((s) => (
            <div key={s.label} className="bg-white rounded-xl border border-gray-200 p-4 text-center">
              <div className="text-2xl">{s.emoji}</div>
              <div className="text-2xl font-bold text-gray-900 mt-1">{s.value}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Brzi pristup */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Upravljanje</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Link href="/admin/verbs" className="bg-white border-2 border-gray-200 hover:border-indigo-400 rounded-xl p-4 text-center transition">
              <div className="text-2xl mb-1">📝</div>
              <div className="font-medium text-gray-800">Glagoli</div>
              <div className="text-xs text-gray-500">Dodaj / Uredi glagole</div>
            </Link>
            <Link href="/admin/sentences" className="bg-white border-2 border-gray-200 hover:border-indigo-400 rounded-xl p-4 text-center transition">
              <div className="text-2xl mb-1">💬</div>
              <div className="font-medium text-gray-800">Rečenice</div>
              <div className="text-xs text-gray-500">Upravljaj vežbama</div>
            </Link>
            <Link href="/admin/users" className="bg-white border-2 border-gray-200 hover:border-indigo-400 rounded-xl p-4 text-center transition">
              <div className="text-2xl mb-1">👥</div>
              <div className="font-medium text-gray-800">Studenti</div>
              <div className="text-xs text-gray-500">Kodovi i statistike</div>
            </Link>
          </div>
        </div>

        {/* Poslednje sesije */}
        <div>
          <h2 className="font-bold text-gray-900 mb-3">Poslednje sesije</h2>
          <div className="bg-white rounded-xl border border-gray-200 divide-y divide-gray-100">
            {recentSessions.map((s) => (
              <div key={s.id} className="flex items-center justify-between px-4 py-3">
                <div>
                  <span className="font-medium text-gray-900">{s.user.displayName}</span>
                  <span className="text-gray-400 text-sm ml-2">Lekcija {s.lesson} · {s.gameType}</span>
                </div>
                <div className="text-right">
                  <div className="font-bold text-indigo-600">{s.score} pt</div>
                  <div className="text-xs text-gray-400">{new Date(s.completedAt).toLocaleString('sr-RS')}</div>
                </div>
              </div>
            ))}
            {recentSessions.length === 0 && (
              <p className="text-center text-gray-500 py-6 text-sm">Nema sesija</p>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
