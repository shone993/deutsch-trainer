import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/db/prisma'
import { FlashcardClient } from './FlashcardClient'

export default async function KarticeNounsPage({
  searchParams,
}: {
  searchParams: Promise<{ lesson?: string; type?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const params = await searchParams
  const lessonFilter = params.lesson ? parseInt(params.lesson) : 0
  const typeFilter = params.type ?? 'all' // 'noun' | 'verb' | 'word' | 'all'

  // Fetch imenice
  const dbNouns = lessonFilter > 0
    ? await prisma.noun.findMany({ where: { lesson: lessonFilter, isActive: true }, orderBy: { noun: 'asc' } })
    : await prisma.noun.findMany({ where: { isActive: true }, orderBy: { noun: 'asc' } })

  // Fetch glagoli
  const dbVerbs = await prisma.verb.findMany({
    where: { isActive: true },
    select: { id: true, infinitiv: true, translation: true },
    orderBy: { infinitiv: 'asc' },
  })

  // Fetch ostale reči
  const dbWords = await prisma.word.findMany({
    where: { isActive: true },
    select: { id: true, word: true, translation: true },
    orderBy: { word: 'asc' },
  })

  type CardType = 'noun' | 'verb' | 'word'

  const nounCards = dbNouns.map(n => ({
    id: `noun-${n.id}`,
    front: `${n.article} ${n.noun}`,
    back: n.translation ?? n.noun,
    type: 'noun' as CardType,
  }))

  const verbCards = dbVerbs.map(v => ({
    id: `verb-${v.id}`,
    front: v.infinitiv,
    back: v.translation ?? v.infinitiv,
    type: 'verb' as CardType,
  }))

  const wordCards = dbWords.map(w => ({
    id: `word-${w.id}`,
    front: w.word,
    back: w.translation ?? w.word,
    type: 'word' as CardType,
  }))

  let cards = [...nounCards, ...verbCards, ...wordCards]
  if (typeFilter === 'noun') cards = nounCards
  else if (typeFilter === 'verb') cards = verbCards
  else if (typeFilter === 'word') cards = wordCards

  // Izmešaj
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[cards[i], cards[j]] = [cards[j], cards[i]]
  }

  return <FlashcardClient cards={cards} lesson={lessonFilter || undefined} />
}
