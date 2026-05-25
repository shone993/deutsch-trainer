import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { GlosarClient } from './GlosarClient'

export const metadata = { title: 'Glosar — Deutsch Trainer' }

export default async function GlosarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const verbs = await prisma.verb.findMany({
    where: { isActive: true },
    select: {
      id:            true,
      infinitiv:     true,
      perfekt:       true,
      translation:   true,
      translationHu: true,
      translationEn: true,
      lesson:        true,
    },
    orderBy: [{ lesson: 'asc' }, { infinitiv: 'asc' }],
  })

  return <GlosarClient verbs={verbs} />
}
