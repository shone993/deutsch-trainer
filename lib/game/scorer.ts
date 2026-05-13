import type { QuestionResult } from '@/types'

// Maksimalni poeni po pitanju i vreme za puni bonus
const MAX_POINTS_PER_QUESTION = 100
const PERFECT_TIME_MS = 5_000  // 5 sekundi za maksimalni bonus
const MIN_POINTS = 10           // Minimum ako je tačno, ali sporo

// Bodovanje: tačan odgovor donosi poene zavisno od brzine
// Netačan odgovor = 0 poena
export function calculatePoints(isCorrect: boolean, timeTakenMs: number): number {
  if (!isCorrect) return 0
  if (timeTakenMs <= 0) return MAX_POINTS_PER_QUESTION

  const ratio = Math.max(0, (PERFECT_TIME_MS - timeTakenMs) / PERFECT_TIME_MS)
  const bonus = Math.round(ratio * (MAX_POINTS_PER_QUESTION - MIN_POINTS))
  return MIN_POINTS + bonus
}

// Kalkuliše ukupni rezultat sesije
export function calculateSessionScore(results: QuestionResult[]): {
  totalScore: number
  maxScore: number
  accuracy: number
  averageTimeMs: number
} {
  const maxScore = results.length * MAX_POINTS_PER_QUESTION
  const totalScore = results.reduce((sum, r) => sum + r.pointsEarned, 0)
  const correct = results.filter((r) => r.isCorrect).length
  const accuracy = results.length > 0 ? (correct / results.length) * 100 : 0
  const avgTime =
    results.length > 0
      ? results.reduce((sum, r) => sum + r.timeTakenMs, 0) / results.length
      : 0

  return { totalScore, maxScore, accuracy: Math.round(accuracy), averageTimeMs: Math.round(avgTime) }
}

// Ažurira streak: vraća novi streak i da li je produžen danas
export function updateStreak(
  lastActiveDate: Date | null | undefined,
  currentStreak: number,
  longestStreak: number,
  now = new Date()
): { currentStreak: number; longestStreak: number; extended: boolean } {
  if (!lastActiveDate) {
    return { currentStreak: 1, longestStreak: Math.max(1, longestStreak), extended: true }
  }

  const last = new Date(lastActiveDate)
  const today = new Date(now)

  // Poredi samo datume (bez vremena)
  last.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)

  const diffDays = Math.round((today.getTime() - last.getTime()) / 86_400_000)

  if (diffDays === 0) {
    // Već je vežbao danas — streak se ne menja
    return { currentStreak, longestStreak, extended: false }
  }

  if (diffDays === 1) {
    // Uzastopni dan — streak raste
    const next = currentStreak + 1
    return { currentStreak: next, longestStreak: Math.max(next, longestStreak), extended: true }
  }

  // Prekinut streak
  return { currentStreak: 1, longestStreak, extended: true }
}
