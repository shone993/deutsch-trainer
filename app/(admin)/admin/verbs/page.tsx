import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { VerbsClient, type VerbRow } from './VerbsClient'

export const metadata = { title: 'Glagoli — Admin' }

export default async function AdminVerbsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { role: true },
  })
  if (!dbUser || dbUser.role !== 'ADMIN') redirect('/profile')

  const raw = await prisma.verb.findMany({
    orderBy: [{ lesson: 'asc' }, { infinitiv: 'asc' }],
    select: {
      id: true,
      infinitiv: true,
      lesson: true,
      translation: true,
      translationHu: true,
      isActive: true,
    },
  })

  const verbs: VerbRow[] = raw.map(v => ({
    id: v.id,
    infinitiv: v.infinitiv,
    lesson: v.lesson,
    translation: v.translation,
    translationHu: v.translationHu,
    isActive: v.isActive,
  }))

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="bg-indigo-700 text-white px-4 py-4 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Link href="/dashboard" className="text-indigo-300 hover:text-white text-sm shrink-0">
            ← Admin
          </Link>
          <div>
            <h1 className="font-bold text-lg leading-tight">Glagoli</h1>
            <p className="text-indigo-300 text-xs">{verbs.length} glagola u bazi</p>
          </div>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 py-6">
        <VerbsClient verbs={verbs} />
      </div>
    </main>
  )
}
