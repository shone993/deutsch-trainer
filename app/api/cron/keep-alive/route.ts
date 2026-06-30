import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db/prisma'

// Vercel Cron poziva ovu rutu povremeno samo da bi baza ostala aktivna —
// Supabase Free plan pauzira projekat posle ~7 dana bez saobraćaja.
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Nije autorizovano' }, { status: 401 })
  }

  const userCount = await prisma.user.count()
  return Response.json({ ok: true, userCount, timestamp: new Date().toISOString() })
}
