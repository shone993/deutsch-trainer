import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { generateQuestions } from '@/lib/game/generator'
import type { VerbData, GameType } from '@/types'
import type { NounData, WordData, QuestionSentenceData } from '@/lib/game/generator'

const MODAL_VERBS = ['können','müssen','wollen','sollen','dürfen','mögen']
const PRETERIT_VERBS = ['können','müssen','wollen','sollen','dürfen','mögen','sein','haben']

const QuerySchema = z.object({
  lesson: z.coerce.number().int().min(1).max(13).optional().default(13),
  gameType: z.enum(['MATCH_PAIRS','TRANSLATE','CONJUGATE','FILL_BLANK','PERFEKT_HILFSVERB','PERFEKT_PARTIZIP','PERFEKT_PARTIZIP_MATCH','PERFEKT_CONJUGATE','PERFEKT_FILL','PRETERIT_MATCH','PRETERIT_CONJUGATE','PRETERIT_FILL','WORD_ORDER','AUDIO','NOUN_ARTICLE','VOCAB_MATCH','QUESTION_WORDS']),
  count: z.coerce.number().int().min(1).max(30).default(10),
  modalOnly: z.coerce.boolean().optional().default(false),
  preteritOnly: z.coerce.boolean().optional().default(false),
  nounLesson: z.coerce.number().int().min(0).max(12).optional().default(0), // 0 = sve lekcije
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

  const { lesson, gameType, count, modalOnly, preteritOnly, nounLesson } = parsed.data

  // QUESTION_WORDS: vrati rečenice sa upitnim rečima
  if (gameType === 'QUESTION_WORDS') {
    const dbQS = await prisma.questionSentence.findMany({ where: { isActive: true } })
    const questionSentences: QuestionSentenceData[] = dbQS.map(q => ({
      id: q.id, template: q.template, answer: q.answer,
    }))
    const questions = generateQuestions({ verbs: [], gameType: 'QUESTION_WORDS', lesson, count, questionSentences })
    return Response.json({ questions, lesson, gameType })
  }

  // Dohvati glagole — preterit/modalni filtar ili po lekciji
  const isNounOnly = gameType === 'NOUN_ARTICLE'
  const dbVerbs = isNounOnly ? [] : await prisma.verb.findMany({
    where: preteritOnly
      ? { infinitiv: { in: PRETERIT_VERBS }, isActive: true }
      : modalOnly
        ? { infinitiv: { in: MODAL_VERBS }, isActive: true }
        : { lesson: { lte: lesson }, isActive: true },
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
  if (gameType === 'FILL_BLANK' || gameType === 'PERFEKT_FILL' || gameType === 'WORD_ORDER') {
    const difficulty = gameType === 'PERFEKT_FILL' ? 2 : gameType === 'WORD_ORDER' ? 3 : 1
    const dbSentences = await prisma.sentence.findMany({
      where: { verbId: { in: dbVerbs.map((v) => v.id) }, isActive: true, difficulty },
    })
    sentences = dbSentences.map((s) => ({
      id: s.id, verbId: s.verbId, template: s.template, translation: s.translation,
    }))
  }

  // Imenice — za NOUN_ARTICLE i VOCAB_MATCH
  let nouns: NounData[] = []
  if (gameType === 'NOUN_ARTICLE' || gameType === 'VOCAB_MATCH') {
    const dbNouns = await prisma.noun.findMany({
      where: nounLesson > 0
        ? { lesson: nounLesson, isActive: true }
        : { isActive: true },
    })
    nouns = dbNouns.map((n) => ({
      id: n.id,
      article: n.article,
      noun: n.noun,
      translation: n.translation,
      translationHu: n.translationHu,
      translationEn: n.translationEn,
      lesson: n.lesson,
    }))
  }

  // OSTALO reči — za VOCAB_MATCH
  let words: WordData[] = []
  if (gameType === 'VOCAB_MATCH') {
    const dbWords = await prisma.word.findMany({ where: { isActive: true } })
    words = dbWords.map((w) => ({
      id: w.id,
      word: w.word,
      translation: w.translation,
      translationHu: w.translationHu,
      translationEn: w.translationEn,
    }))
  }

  const questions = generateQuestions({
    verbs,
    sentences,
    nouns,
    words,
    gameType: gameType as GameType,
    lesson,
    count,
  })

  return Response.json({ questions, lesson, gameType })
}
