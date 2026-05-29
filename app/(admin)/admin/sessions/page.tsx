import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { SessionsClient } from './SessionsClient'
import type { SessionRow } from './SessionsClient'

export const metadata = { title: 'Sesije — Admin' }

export default async function AdminSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true, displayName: true },
  })
  if (!dbUser || dbUser.role !== 'ADMIN') redirect('/profile')

  const raw = await prisma.exerciseSession.findMany({
    take: 1000,
    orderBy: { completedAt: 'desc' },
    include: { user: { select: { name: true, surname: true } } },
  })

  const sessions: SessionRow[] = raw.map(s => ({
    id: s.id,
    name: s.user.name,
    surname: s.user.surname,
    gameType: s.gameType,
    lesson: s.lesson,
    score: s.score,
    maxScore: s.maxScore,
    correctCount: s.correctCount,
    wrongCount: s.wrongCount,
    completedAt: s.completedAt.toISOString(),
  }))

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-indigo-300 hover:text-white text-sm shrink-0">
            ← Admin
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-tight">Sesije &amp; Analitika</h1>
            <p className="text-indigo-300 text-xs">Poslednjih {sessions.length} sesija</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <SessionsClient sessions={sessions} />
      </div>
    </main>
  )
}
