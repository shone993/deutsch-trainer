export type Language = 'srb' | 'hun' | 'eng'

export type GrammaticalPerson = 'ich' | 'du' | 'er' | 'wir' | 'ihr' | 'sie'

export type GameType = 'FILL_BLANK' | 'MATCH_PAIRS' | 'TRANSLATE' | 'AUDIO'

export interface VerbConjugation {
  ich: string
  du: string
  er: string  // er/sie/es
  wir: string
  ihr: string
  sie: string // sie/Sie
}

export interface VerbData {
  id: string
  infinitiv: string
  conjugation: VerbConjugation
  perfekt: string
  hilfsverb: 'HABEN' | 'SEIN'
  lesson: number
  difficulty: number
  translation?: string | null
  translationHu?: string | null
  translationEn?: string | null
}

// Parsiran tag iz rečenice: <verbId,lice>
export interface SentenceTag {
  verbId: string
  person: GrammaticalPerson
  answer: string      // ispravna konjugacija
  startIndex: number  // pozicija u originalnoj rečenici
  endIndex: number
}

// Rečenica rastavljena na delove za prikaz
export type SentencePart =
  | { type: 'text'; value: string }
  | { type: 'blank'; tag: SentenceTag; index: number }

export interface ParsedSentence {
  parts: SentencePart[]
  blanks: SentenceTag[]
}

// Zadatak za igru
export interface GameQuestion {
  id: string
  type: GameType
  verbId: string
  infinitiv: string
  sentence?: string           // originalni template
  parsedSentence?: ParsedSentence
  translation: string
  correctAnswers: string[]    // sve ispravne vrednosti
  options?: string[]          // ponuđeni odgovori (za višestruki izbor)
  audioWord?: string          // reč za izgovor (Audio igra)
}

// Rezultat jednog pitanja
export interface QuestionResult {
  questionId: string
  userAnswer: string
  isCorrect: boolean
  timeTakenMs: number
  pointsEarned: number
}

// Cela sesija igre
export interface GameSession {
  sessionId: string
  gameType: GameType
  lesson: number
  questions: GameQuestion[]
  results: QuestionResult[]
  totalScore: number
  maxScore: number
  startedAt: number // timestamp
}

// Leaderboard unos
export interface LeaderboardEntry {
  rank: number
  userId: string
  displayName: string
  avatarUrl?: string | null
  totalPoints: number
  currentStreak: number
  sessionsCount: number
}

// Korisnički profil
export interface UserProfile {
  id: string
  email: string
  name: string
  surname: string
  displayName: string
  role: 'STUDENT' | 'ADMIN'
  avatarUrl?: string | null
  language: Language
  streak: {
    currentStreak: number
    longestStreak: number
    lastActiveDate?: Date | null
  } | null
  totalPoints: number
  verbsLearned: number
}
