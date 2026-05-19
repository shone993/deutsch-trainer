import type { GameQuestion, GameType, GrammaticalPerson, VerbData } from '@/types'
import { parseSentenceTemplate } from './parser'

const PERSONS: GrammaticalPerson[] = ['ich', 'du', 'er', 'wir', 'ihr', 'sie']

const HABEN_CONJ: Record<GrammaticalPerson, string> = {
  ich: 'habe', du: 'hast', er: 'hat', wir: 'haben', ihr: 'habt', sie: 'haben',
}
const SEIN_CONJ: Record<GrammaticalPerson, string> = {
  ich: 'bin', du: 'bist', er: 'ist', wir: 'sind', ihr: 'seid', sie: 'sind',
}

function getPerfektForm(verb: VerbData, person: GrammaticalPerson): string {
  const aux = verb.hilfsverb === 'SEIN' ? SEIN_CONJ[person] : HABEN_CONJ[person]
  return `${aux} ${verb.perfekt}`
}

const PERSON_PRONOUN: Record<GrammaticalPerson, string> = {
  ich: 'ich',
  du: 'du',
  er: 'er/sie/es',
  wir: 'wir',
  ihr: 'ihr',
  sie: 'sie/Sie',
}

function randomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

function getConjugation(verb: VerbData, person: GrammaticalPerson): string {
  return verb.conjugation[person]
}

function getDistractors(correct: string, allVerbs: VerbData[], count = 3): string[] {
  const pool = new Set<string>()
  for (const verb of shuffle(allVerbs)) {
    for (const person of PERSONS) {
      const form = getConjugation(verb, person)
      if (form !== correct) pool.add(form)
      if (pool.size >= count * 3) break
    }
    if (pool.size >= count * 3) break
  }
  return shuffle([...pool]).slice(0, count)
}

interface GenerateOptions {
  verbs: VerbData[]
  sentences?: Array<{ id: string; verbId: string; template: string; translation: string }>
  gameType: GameType
  lesson: number
  count: number
}

export function generateQuestions(opts: GenerateOptions): GameQuestion[] {
  const { verbs, sentences = [], gameType, count } = opts
  if (verbs.length === 0) return []

  const verbMap = new Map(verbs.map((v) => [v.id, v]))
  const questions: GameQuestion[] = []
  const shuffledVerbs = shuffle(verbs)

  for (let i = 0; i < count; i++) {
    const verb = shuffledVerbs[i % shuffledVerbs.length]
    const person = randomItem(PERSONS)
    const correctAnswer = getConjugation(verb, person)

    switch (gameType) {

      case 'CONJUGATE': {
        // Prosta konjugacija: prikazuje se zamenica + praznina, upisuje se oblik
        questions.push({
          id: `conj-${verb.id}-${person}-${i}`,
          type: 'CONJUGATE',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: `${PERSON_PRONOUN[person]} + ${verb.infinitiv}`,
          correctAnswers: [correctAnswer],
          options: [PERSON_PRONOUN[person]], // options[0] = zamenica koja se prikazuje
        })
        break
      }

      case 'FILL_BLANK': {
        // Samo rečenice sa prazninom — bez generičkog fallbacka
        const matchingSentences = sentences.filter((s) => s.verbId === verb.id)
        if (matchingSentences.length === 0) break

        const sentence = randomItem(matchingSentences)
        const parsed = parseSentenceTemplate(sentence.template, verbMap)
        const firstBlank = parsed.blanks[0]
        if (!firstBlank) break

        questions.push({
          id: `${sentence.id}-${i}`,
          type: 'FILL_BLANK',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          sentence: sentence.template,
          parsedSentence: parsed,
          translation: sentence.translation,
          correctAnswers: [firstBlank.answer],
        })
        break
      }

      case 'MATCH_PAIRS': {
        // 4 para: infinitiv ↔ zamenica + konjugacija (npr. "sein" ↔ "er/sie/es ist")
        const pairVerbs = shuffle(verbs).slice(0, 4)
        const pairPerson = randomItem(PERSONS)
        const pronoun = PERSON_PRONOUN[pairPerson]
        questions.push({
          id: `match-${verb.id}-${i}`,
          type: 'MATCH_PAIRS',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: verb.translation ?? verb.infinitiv,
          correctAnswers: pairVerbs.map((v) => `${pronoun} ${getConjugation(v, pairPerson)}`),
          options: pairVerbs.map((v) => v.infinitiv),
        })
        break
      }

      case 'TRANSLATE': {
        const distractors = getDistractors(correctAnswer, verbs, 3)
        const options = shuffle([correctAnswer, ...distractors])
        questions.push({
          id: `trans-${verb.id}-${person}-${i}`,
          type: 'TRANSLATE',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: `${PERSON_PRONOUN[person]} (${verb.translation ?? verb.infinitiv})`,
          correctAnswers: [correctAnswer],
          options,
        })
        break
      }

      case 'PERFEKT_HILFSVERB': {
        // Samo HABEN ili SEIN — višestruki izbor od 2
        const isHaben = verb.hilfsverb === 'HABEN'
        questions.push({
          id: `ph-${verb.id}-${i}`,
          type: 'PERFEKT_HILFSVERB',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: verb.translation ?? verb.infinitiv,
          correctAnswers: [verb.hilfsverb === 'HABEN' ? 'haben' : 'sein'],
          options: isHaben ? ['haben', 'sein'] : ['sein', 'haben'],
        })
        break
      }

      case 'PERFEKT_PARTIZIP': {
        // Dat infinitiv → upiši Partizip II
        const distractorsP = shuffle(verbs)
          .filter((v) => v.id !== verb.id && v.perfekt)
          .slice(0, 3)
          .map((v) => v.perfekt)
        questions.push({
          id: `pp-${verb.id}-${i}`,
          type: 'PERFEKT_PARTIZIP',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: verb.translation ?? verb.infinitiv,
          correctAnswers: [verb.perfekt],
          options: shuffle([verb.perfekt, ...distractorsP]),
        })
        break
      }

      case 'PERFEKT_CONJUGATE': {
        // Sa licem: ich + gehen → bin gegangen
        const perfektAnswer = getPerfektForm(verb, person)
        questions.push({
          id: `pc-${verb.id}-${person}-${i}`,
          type: 'PERFEKT_CONJUGATE',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: verb.translation ?? verb.infinitiv,
          correctAnswers: [perfektAnswer],
          options: [PERSON_PRONOUN[person]],
        })
        break
      }

      case 'PERFEKT_FILL': {
        // Rečenica sa dva prazna mesta: aux + partizip
        const matchingSentences = sentences.filter((s) => s.verbId === verb.id)
        if (matchingSentences.length === 0) break
        const sentence = randomItem(matchingSentences)
        const parsed = parseSentenceTemplate(sentence.template, verbMap)
        if (parsed.blanks.length < 2) break
        questions.push({
          id: `pf-${sentence.id}-${i}`,
          type: 'PERFEKT_FILL',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          sentence: sentence.template,
          parsedSentence: parsed,
          translation: sentence.translation,
          correctAnswers: parsed.blanks.map((b) => b.answer),
        })
        break
      }

      case 'AUDIO': {
        questions.push({
          id: `audio-${verb.id}-${person}-${i}`,
          type: 'AUDIO',
          verbId: verb.id,
          infinitiv: verb.infinitiv,
          translation: verb.translation ?? verb.infinitiv,
          correctAnswers: [correctAnswer],
          audioWord: correctAnswer,
        })
        break
      }
    }
  }

  return questions
}
