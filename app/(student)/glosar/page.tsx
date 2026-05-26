import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { GlosarClient, type GlossaryItem } from './GlosarClient'

export const metadata = { title: 'Glosar — Deutsch Trainer' }

export default async function GlosarPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [verbs, nouns, words] = await Promise.all([
    prisma.verb.findMany({
      where: { isActive: true },
      select: { id: true, infinitiv: true, translation: true, translationHu: true, lesson: true },
      orderBy: [{ lesson: 'asc' }, { infinitiv: 'asc' }],
    }),
    prisma.noun.findMany({
      where: { isActive: true },
      select: { id: true, article: true, noun: true, translation: true, translationHu: true, lesson: true },
      orderBy: [{ lesson: 'asc' }, { noun: 'asc' }],
    }),
    prisma.word.findMany({
      where: { isActive: true },
      select: { id: true, word: true, translation: true, translationHu: true },
      orderBy: [{ word: 'asc' }],
    }),
  ])

  const items: GlossaryItem[] = [
    ...verbs.map(v => ({
      id: v.id,
      german: v.infinitiv,
      category: 'verb' as const,
      translationSr: v.translation,
      translationHu: v.translationHu,
      lesson: v.lesson,
    })),
    ...nouns.map(n => ({
      id: n.id,
      german: `${n.article} ${n.noun}`,
      category: 'noun' as const,
      translationSr: n.translation,
      translationHu: n.translationHu,
      lesson: n.lesson,
    })),
    ...words.map(w => ({
      id: w.id,
      german: w.word,
      category: 'word' as const,
      translationSr: w.translation,
      translationHu: w.translationHu,
      lesson: null,
    })),
  ]

  // Sort: by lesson asc (nulls last), then German asc
  items.sort((a, b) => {
    if (a.lesson === null && b.lesson !== null) return 1
    if (a.lesson !== null && b.lesson === null) return -1
    if (a.lesson !== b.lesson) return (a.lesson ?? 99) - (b.lesson ?? 99)
    return a.german.localeCompare(b.german)
  })

  return <GlosarClient items={items} />
}
