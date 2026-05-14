import { NextRequest } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/db/prisma'
import { calculatePoints, calculateSessionScore, updateStreak } from '@/lib/game/scorer'
import type { QuestionResult } from '@/types'

const ResultSchema = z.object({
  questionId: z.string(),
  verbId: z.string(),
  userAnswer: z.string(),
  correctAnswer: z.string(),
  timeTakenMs: z.number().int().nonnegative(),
})

const SubmitSchema = z.object({
  gameType: z.enum(['FILL_BLANK', 'MATCH_PAIRS', 'TRANSLATE', 'AUDIO']),
  lesson: z.number().int().min(1).max(13),
  results: z.array(ResultSchema).min(1),
})

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return Response.json({ error: 'Nije autorizovano' }, { status: 401 })
  }

  const body = await request.json().catch(() => null)
  const parsed = SubmitSchema.safeParse(body)

  if (!parsed.success) {
    return Response.json({ error: parsed.error.issues[0].message }, { status: 400 })
  }

  const { gameType, lesson, results: rawResults } = parsed.data

  const questionResults: QuestionResult[] = rawResults.map((r) => {
    const isCorrect = r.userAnswer.trim().toLowerCase() === r.correctAnswer.trim().toLowerCase()
    // Za MATCH_PAIRS timeTakenMs nosi broj pogrešnih pokušaja
    const pointsEarned = gameType === 'MATCH_PAIRS'
      ? (isCorrect ? Math.max(10, 100 - r.timeTakenMs * 15) : 0)
      : calculatePoints(isCorrect, r.timeTakenMs)
    return {
      questionId: r.questionId,
      userAnswer: r.userAnswer,
      isCorrect,
      timeTakenMs: r.timeTakenMs,
      pointsEarned,
    }
  })

  const { totalScore, maxScore, accuracy, averageTimeMs } = calculateSessionScore(questionResults)

  // Sačuvaj sesiju
  await prisma.exerciseSession.create({
    data: {
      userId: user.id,
      gameType,
      lesson,
      score: totalScore,
      maxScore,
      correctCount: questionResults.filter((r) => r.isCorrect).length,
      wrongCount: questionResults.filter((r) => !r.isCorrect).length,
      durationMs: questionResults.reduce((sum, r) => sum + BigInt(r.timeTakenMs), BigInt(0)),
    },
  })

  // Ažuriraj statistike po glagolu
  const verbGroups = new Map<string, QuestionResult[]>()
  rawResults.forEach((r, i) => {
    if (!verbGroups.has(r.verbId)) verbGroups.set(r.verbId, [])
    verbGroups.get(r.verbId)!.push(questionResults[i])
  })

  for (const [verbId, verbResults] of verbGroups) {
    const correct = verbResults.filter((r) => r.isCorrect).length
    const wrong = verbResults.filter((r) => !r.isCorrect).length
    const points = verbResults.reduce((sum, r) => sum + r.pointsEarned, 0)
    const timeMs = verbResults.reduce((sum, r) => sum + r.timeTakenMs, 0)

    await prisma.stats.upsert({
      where: { userId_verbId: { userId: user.id, verbId } },
      create: {
        userId: user.id,
        verbId,
        correctCount: correct,
        wrongCount: wrong,
        totalPoints: points,
        totalTimeMs: BigInt(timeMs),
        lastPracticed: new Date(),
      },
      update: {
        correctCount: { increment: correct },
        wrongCount: { increment: wrong },
        totalPoints: { increment: points },
        totalTimeMs: { increment: BigInt(timeMs) },
        lastPracticed: new Date(),
      },
    })
  }

  // Ažuriraj streak
  const streak = await prisma.streak.findUnique({ where: { userId: user.id } })
  const updated = updateStreak(streak?.lastActiveDate, streak?.currentStreak ?? 0, streak?.longestStreak ?? 0)

  if (updated.extended) {
    await prisma.streak.upsert({
      where: { userId: user.id },
      create: {
        userId: user.id,
        currentStreak: updated.currentStreak,
        longestStreak: updated.longestStreak,
        lastActiveDate: new Date(),
      },
      update: {
        currentStreak: updated.currentStreak,
        longestStreak: updated.longestStreak,
        lastActiveDate: new Date(),
      },
    })
  }

  return Response.json({
    totalScore,
    maxScore,
    accuracy,
    averageTimeMs,
    results: questionResults,
    streak: updated,
  })
}
