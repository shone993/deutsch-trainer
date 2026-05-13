import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { generateQuestions } from '@/lib/game/generator'
import type { VerbData, GameType } from '@/types'

const QuerySchema = z.object({
  lesson: z.coerce.number().int().min(1).max(13),
  gameType: z.enum(['FILL_BLANK', 'MATCH_PAIRS', 'TRANSLATE', 'AUDIO']),
  count: z.coerce.number().int().min(1).max(30).default(10),
})

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Nije autorizovano' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const parsed = QuerySchema.safeParse(Object.fromEntries(searchParams))

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { lesson, gameType, count } = parsed.data

  // Dohvati glagole iz lekcije (ili svih lekcija do date)
  const dbVerbs = await prisma.verb.findMany({
    where: { lesson: { lte: lesson }, isActive: true },
    orderBy: { lesson: 'asc' },
  })

  const verbs: VerbData[] = dbVerbs.map((v) => ({
    id: v.id,
    infinitiv: v.infinitiv,
    conjugation: {
      ich: v.ich,
      du: v.du,
      er: v.erSieEs,
      wir: v.wir,
      ihr: v.ihr,
      sie: v.sieSie,
    },
    perfekt: v.perfekt,
    hilfsverb: v.hilfsverb as 'HABEN' | 'SEIN',
    lesson: v.lesson,
    difficulty: v.difficulty,
    translation: v.translation,
    translationHu: v.translationHu,
    translationEn: v.translationEn,
  }))

  let sentences: Array<{ id: string; verbId: string; template: string; translation: string }> = []

  if (gameType === 'FILL_BLANK') {
    const dbSentences = await prisma.sentence.findMany({
      where: {
        verbId: { in: dbVerbs.map((v) => v.id) },
        isActive: true,
      },
    })
    sentences = dbSentences.map((s) => ({
      id: s.id,
      verbId: s.verbId,
      template: s.template,
      translation: s.translation,
    }))
  }

  const questions = generateQuestions({
    verbs,
    sentences,
    gameType: gameType as GameType,
    lesson,
    count,
  })

  return Response.json({ questions, lesson, gameType })
}
