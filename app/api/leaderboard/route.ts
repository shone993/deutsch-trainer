import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'

const QuerySchema = z.object({
  period: z.enum(['all', '7days', 'semester']).default('all'),
  limit: z.coerce.number().int().min(1).max(100).default(20),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Nije autorizovano' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const { period, limit } = QuerySchema.parse(Object.fromEntries(searchParams))

  let dateFilter: Date | undefined

  if (period === '7days') {
    dateFilter = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  } else if (period === 'semester') {
    // Semestar = od 1. oktobra ili 1. februara (zavisno od trenutnog meseca)
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()
    dateFilter = month >= 10 || month <= 1
      ? new Date(month >= 10 ? year : year - 1, 9, 1) // oktobar
      : new Date(year, 1, 1) // februar
  }

  const sessions = await prisma.exerciseSession.groupBy({
    by: ['userId'],
    where: dateFilter ? { completedAt: { gte: dateFilter } } : undefined,
    _sum: { score: true },
    _count: { id: true },
    orderBy: { _sum: { score: 'desc' } },
    take: limit,
  })

  const userIds = sessions.map((s) => s.userId)
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, displayName: true, avatarUrl: true },
  })

  const streaks = await prisma.streak.findMany({
    where: { userId: { in: userIds } },
    select: { userId: true, currentStreak: true },
  })

  const userMap = new Map(users.map((u) => [u.id, u]))
  const streakMap = new Map(streaks.map((s) => [s.userId, s.currentStreak]))

  const leaderboard = sessions.map((s, index) => {
    const u = userMap.get(s.userId)
    return {
      rank: index + 1,
      userId: s.userId,
      displayName: u?.displayName ?? 'Nepoznat',
      avatarUrl: u?.avatarUrl ?? null,
      totalPoints: s._sum.score ?? 0,
      currentStreak: streakMap.get(s.userId) ?? 0,
      sessionsCount: s._count.id,
    }
  })

  return Response.json({ leaderboard, period })
}
